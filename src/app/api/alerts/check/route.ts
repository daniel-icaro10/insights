import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { MetricsSummary } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { adAccountId, summary } = await request.json() as { adAccountId?: string; summary?: MetricsSummary }
  if (!summary) {
    return NextResponse.json({ error: 'summary required' }, { status: 400 })
  }
  if (!adAccountId) {
    return NextResponse.json({ error: 'adAccountId required' }, { status: 400 })
  }

  // Verificar se a conta pertence ao usuário
  const { data: adAccount } = await supabase
    .from('ad_accounts')
    .select('id')
    .eq('id', adAccountId)
    .single()
  if (!adAccount) {
    return NextResponse.json({ error: 'Ad account not found' }, { status: 404 })
  }

  // Buscar snapshot anterior
  const { data: snapshot } = await supabase
    .from('metric_snapshots')
    .select('summary')
    .eq('ad_account_id', adAccountId)
    .single()

  const previousSummary = snapshot?.summary as MetricsSummary | null

  const alerts: Array<{ alert_type: string; message: string; threshold_value?: number; current_value?: number }> = []

  if (previousSummary) {
  const ctrChange = summary.ctr - previousSummary.ctr
  if (ctrChange < -0.5 && summary.ctr < 1) {
    alerts.push({
      alert_type: 'ctr_drop',
      message: `CTR dropped ${Math.abs(ctrChange).toFixed(2)}% (now ${summary.ctr.toFixed(2)}%). Consider optimizing ad creative.`,
      threshold_value: previousSummary.ctr,
      current_value: summary.ctr,
    })
  }

  const cpcChange = summary.cpc - previousSummary.cpc
  if (cpcChange > 0.2 && summary.cpc > 1) {
    alerts.push({
      alert_type: 'cpc_increase',
      message: `CPC increased by $${cpcChange.toFixed(2)} (now $${summary.cpc.toFixed(2)}). Monitor audience targeting.`,
      threshold_value: previousSummary.cpc,
      current_value: summary.cpc,
    })
  }

  const roasChange = summary.roas - previousSummary.roas
  if (roasChange < -0.5 && summary.roas < 2) {
    alerts.push({
      alert_type: 'roas_drop',
      message: `ROAS dropped ${(roasChange * 100).toFixed(0)}% (now ${summary.roas.toFixed(2)}x). Review conversion campaigns.`,
      threshold_value: previousSummary.roas,
      current_value: summary.roas,
    })
  }

  const spendChange = summary.spend - previousSummary.spend
  const spendIncreasePct = previousSummary.spend > 0 ? (spendChange / previousSummary.spend) * 100 : 0
  if (spendIncreasePct > 50 && spendChange > 50) {
    alerts.push({
      alert_type: 'spend_spike',
      message: `Spend spiked ${spendIncreasePct.toFixed(0)}% ($${spendChange.toFixed(2)} increase). Verify campaigns are on target.`,
      threshold_value: previousSummary.spend,
      current_value: summary.spend,
    })
  }
  }

  for (const a of alerts) {
    await supabase.from('alerts').insert({
      user_id: user.id,
      ad_account_id: adAccountId,
      alert_type: a.alert_type,
      message: a.message,
      threshold_value: a.threshold_value,
      current_value: a.current_value,
    })
  }

  // Salvar snapshot atual para próxima comparação
  await supabase
    .from('metric_snapshots')
    .upsert({ ad_account_id: adAccountId, summary }, { onConflict: 'ad_account_id' })

  return NextResponse.json({ alerts, count: alerts.length })
}
