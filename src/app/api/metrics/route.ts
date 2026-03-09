import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import {
  getAccountInsights,
  getCampaignInsights,
  parseInsightToMetrics,
  mapDatePreset,
  type MetaInsight,
} from '@/lib/meta-api'
import { getCached, setCache, getCacheKey } from '@/lib/redis'
import type { MetricsSummary, TimeSeriesDataPoint, Campaign } from '@/types'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const adAccountId = searchParams.get('adAccountId')
  const range = searchParams.get('range') || '30d'
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!adAccountId) {
    return NextResponse.json({ error: 'adAccountId required' }, { status: 400 })
  }

  const { data: adAccount } = await supabase
    .from('ad_accounts')
    .select(`
      id,
      ad_account_id,
      facebook_accounts!inner(access_token)
    `)
    .eq('id', adAccountId)
    .single()

  if (!adAccount) {
    return NextResponse.json({ error: 'Ad account not found' }, { status: 404 })
  }

  const fbAcc = adAccount.facebook_accounts as unknown as { access_token: string }
  const token = fbAcc.access_token
  const metaAdAccountId = (adAccount as { ad_account_id: string }).ad_account_id
  const datePreset = mapDatePreset(range, startDate || undefined, endDate || undefined)

  const cacheKey = getCacheKey('metrics', adAccountId, `${range}-${startDate}-${endDate}`)
  const cached = await getCached<{ summary: MetricsSummary; timeSeries: TimeSeriesDataPoint[]; campaigns: Campaign[] }>(cacheKey)
  if (cached) return NextResponse.json(cached)

  try {
    const [accountInsights, campaignInsights] = await Promise.all([
      getAccountInsights(token, metaAdAccountId, datePreset),
      getCampaignInsights(token, metaAdAccountId, datePreset),
    ])

    const accountMetrics = accountInsights.reduce(
      (acc, i) => {
        const m = parseInsightToMetrics(i)
        acc.spend += m.spend
        acc.impressions += m.impressions
        acc.reach += m.reach
        acc.clicks += m.clicks
        acc.conversions += m.conversions
        acc.purchase_value += m.purchase_value
        return acc
      },
      { spend: 0, impressions: 0, reach: 0, clicks: 0, conversions: 0, purchase_value: 0 }
    )

    const summary: MetricsSummary = {
      spend: accountMetrics.spend,
      revenue: accountMetrics.purchase_value,
      roas: accountMetrics.spend > 0 ? accountMetrics.purchase_value / accountMetrics.spend : 0,
      clicks: accountMetrics.clicks,
      ctr: accountMetrics.impressions > 0 ? (accountMetrics.clicks / accountMetrics.impressions) * 100 : 0,
      cpc: accountMetrics.clicks > 0 ? accountMetrics.spend / accountMetrics.clicks : 0,
      conversions: accountMetrics.conversions,
      impressions: accountMetrics.impressions,
    }

    const timeSeriesMap = new Map<string, TimeSeriesDataPoint>()
    accountInsights.forEach((i: MetaInsight) => {
      const date = i.date_start || i.date_stop || 'unknown'
      const m = parseInsightToMetrics(i)
      const existing = timeSeriesMap.get(date) || {
        date,
        spend: 0,
        revenue: 0,
        clicks: 0,
        conversions: 0,
        roas: 0,
        impressions: 0,
      }
      existing.spend += m.spend
      existing.revenue += m.purchase_value
      existing.clicks += m.clicks
      existing.conversions += m.conversions
      existing.impressions += m.impressions
      existing.roas = m.spend > 0 ? m.purchase_value / m.spend : 0
      timeSeriesMap.set(date, existing)
    })

    const timeSeries = Array.from(timeSeriesMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const campaignMetricsMap = new Map<string, { spend: number; clicks: number; conversions: number; revenue: number; impressions: number; campaign_name?: string }>()
    campaignInsights.forEach((i: MetaInsight & { campaign_id?: string; campaign_name?: string }) => {
      const cid = i.campaign_id || 'unknown'
      const m = parseInsightToMetrics(i)
      const existing = campaignMetricsMap.get(cid) || {
        spend: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        impressions: 0,
        campaign_name: i.campaign_name,
      }
      existing.spend += m.spend
      existing.clicks += m.clicks
      existing.conversions += m.conversions
      existing.revenue += m.purchase_value
      existing.impressions += m.impressions
      if (i.campaign_name) existing.campaign_name = i.campaign_name
      campaignMetricsMap.set(cid, existing)
    })

    const { data: dbCampaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('ad_account_id', adAccountId)

    const campaignIds = Array.from(campaignMetricsMap.keys())
    const campaignsWithMetrics: Campaign[] = campaignIds.map((cid) => {
      const m = campaignMetricsMap.get(cid)!
      const dbCampaign = (dbCampaigns || []).find((c) => c.campaign_id === cid || c.campaign_id === cid.replace('act_', ''))
      return {
        id: dbCampaign?.id || cid,
        campaign_id: cid,
        campaign_name: m.campaign_name || dbCampaign?.campaign_name || cid,
        status: dbCampaign?.status || 'ACTIVE',
        objective: dbCampaign?.objective || null,
        daily_budget: dbCampaign?.daily_budget ?? null,
        lifetime_budget: dbCampaign?.lifetime_budget ?? null,
        start_time: dbCampaign?.start_time ?? null,
        stop_time: dbCampaign?.stop_time ?? null,
        metrics: {
          spend: m.spend,
          impressions: m.impressions,
          reach: 0,
          clicks: m.clicks,
          ctr: m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0,
          cpc: m.clicks > 0 ? m.spend / m.clicks : 0,
          cpm: m.impressions > 0 ? (m.spend / m.impressions) * 1000 : 0,
          conversions: m.conversions,
          purchase_value: m.revenue,
          roas: m.spend > 0 ? m.revenue / m.spend : 0,
          frequency: 0,
        },
      }
    })

    const result = { summary, timeSeries, campaigns: campaignsWithMetrics }
    await setCache(cacheKey, result)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Metrics API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
