import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getCampaigns } from '@/lib/meta-api'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { adAccountId } = await request.json()
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

  try {
    const campaigns = await getCampaigns(token, metaAdAccountId)

    for (const c of campaigns) {
      await supabase.from('campaigns').upsert(
        {
          ad_account_id: adAccount.id,
          campaign_id: c.id,
          campaign_name: c.name,
          status: c.status,
          objective: c.objective,
          daily_budget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : null,
          lifetime_budget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : null,
          start_time: c.start_time || null,
          stop_time: c.stop_time || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'ad_account_id,campaign_id' }
      )
    }

    return NextResponse.json({ success: true, count: campaigns.length })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 }
    )
  }
}
