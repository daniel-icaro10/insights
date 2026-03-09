const META_API_VERSION = 'v21.0'
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`

export interface MetaAdAccount {
  id: string
  account_id: string
  name: string
  currency: string
  timezone_name: string
}

export interface MetaCampaign {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: string
  lifetime_budget?: string
  start_time?: string
  stop_time?: string
}

export interface MetaInsight {
  spend?: string
  impressions?: string
  reach?: string
  clicks?: string
  ctr?: string
  cpc?: string
  cpm?: string
  actions?: Array<{ action_type: string; value: string }>
  action_values?: Array<{ action_type: string; value: string }>
  frequency?: string
  date_start?: string
  date_stop?: string
}

async function metaRequest(
  accessToken: string,
  path: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const url = new URL(`${META_GRAPH_URL}/${path}`)
  url.searchParams.set('access_token', accessToken)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `Meta API error: ${res.status}`)
  }
  return res.json()
}

export async function getAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const data = await metaRequest(accessToken, 'me/adaccounts', {
    fields: 'id,account_id,name,currency,timezone_name',
  }) as { data: MetaAdAccount[] }
  return data.data || []
}

export async function getCampaigns(
  accessToken: string,
  adAccountId: string,
  datePreset: string = 'last_30d'
): Promise<MetaCampaign[]> {
  const accountId = adAccountId.replace('act_', '')
  const data = await metaRequest(accessToken, `act_${accountId}/campaigns`, {
    fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time',
    filtering: JSON.stringify([{ field: 'effective_status', operator: 'IN', value: ['ACTIVE', 'PAUSED', 'ARCHIVED'] }]),
    limit: '500',
  }) as { data: MetaCampaign[] }
  return data.data || []
}

function buildInsightsParams(
  datePresetOrRange: string | { since: string; until: string },
  level: string
): Record<string, string> {
  const params: Record<string, string> = {
    fields: 'spend,impressions,reach,clicks,ctr,cpc,cpm,frequency,actions,action_values',
    level,
    limit: '500',
    time_increment: '1',
  }
  if (typeof datePresetOrRange === 'object') {
    params.time_range = JSON.stringify({
      since: datePresetOrRange.since,
      until: datePresetOrRange.until,
    })
  } else {
    params.date_preset = datePresetOrRange
    if (datePresetOrRange === 'today' || datePresetOrRange === 'yesterday') {
      params.time_increment = '1'
    }
  }
  return params
}

export async function getAccountInsights(
  accessToken: string,
  adAccountId: string,
  datePresetOrRange: string | { since: string; until: string },
  level: string = 'account'
): Promise<MetaInsight[]> {
  const accountId = adAccountId.replace('act_', '')
  const params = buildInsightsParams(datePresetOrRange, level)
  const data = await metaRequest(accessToken, `act_${accountId}/insights`, params) as { data: MetaInsight[] }
  return data.data || []
}

export async function getCampaignInsights(
  accessToken: string,
  adAccountId: string,
  datePresetOrRange: string | { since: string; until: string }
): Promise<(MetaInsight & { campaign_name?: string })[]> {
  const accountId = adAccountId.replace('act_', '')
  const params = buildInsightsParams(datePresetOrRange, 'campaign')
  params.fields = 'campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpc,cpm,frequency,actions,action_values'
  const data = await metaRequest(accessToken, `act_${accountId}/insights`, params) as { data: MetaInsight[] }
  return data.data || []
}

export function parseInsightToMetrics(insight: MetaInsight) {
  const getActionValue = (type: string) => {
    const actions = insight.actions || []
    const action = actions.find((a) => a.action_type === type)
    return action ? parseFloat(action.value) : 0
  }
  const getActionValuesSum = (type: string) => {
    const values = insight.action_values || []
    return values
      .filter((a) => a.action_type === type)
      .reduce((sum, a) => sum + parseFloat(a.value || '0'), 0)
  }

  return {
    spend: parseFloat(insight.spend || '0'),
    impressions: parseInt(insight.impressions || '0', 10),
    reach: parseInt(insight.reach || '0', 10),
    clicks: parseInt(insight.clicks || '0', 10),
    ctr: parseFloat(insight.ctr || '0'),
    cpc: parseFloat(insight.cpc || '0'),
    cpm: parseFloat(insight.cpm || '0'),
    frequency: parseFloat(insight.frequency || '0'),
    conversions: getActionValue('purchase') || getActionValue('omni_purchase') || getActionValue('lead'),
    purchase_value: getActionValuesSum('purchase') || getActionValuesSum('omni_purchase'),
  }
}

export function mapDatePreset(
  range: string,
  startDate?: string,
  endDate?: string
): string | { since: string; until: string } {
  switch (range) {
    case 'today':
      return 'today'
    case 'yesterday':
      return 'yesterday'
    case '7d':
      return 'last_7d'
    case '30d':
      return 'last_30d'
    case 'custom':
      if (startDate && endDate) {
        return { since: startDate, until: endDate }
      }
      return 'last_30d'
    default:
      return 'last_30d'
  }
}
