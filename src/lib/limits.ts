import { createClient } from '@/lib/supabase/server'
import { startOfDay, startOfMonth } from 'date-fns'

export async function getSubscriptionLimits(userId: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  const tier = profile?.subscription_tier || 'starter'

  const { data: limits } = await supabase
    .from('subscription_limits')
    .select('max_ad_accounts, max_ai_insights_per_day, max_reports_per_month')
    .eq('tier', tier)
    .single()

  return {
    tier,
    maxAdAccounts: limits?.max_ad_accounts ?? 1,
    maxAiInsightsPerDay: limits?.max_ai_insights_per_day ?? 5,
    maxReportsPerMonth: limits?.max_reports_per_month ?? 10,
  }
}

export async function checkAiInsightLimit(userId: string): Promise<{ ok: boolean; used: number; limit: number }> {
  const { maxAiInsightsPerDay } = await getSubscriptionLimits(userId)
  const supabase = await createClient()
  const today = startOfDay(new Date()).toISOString()

  const { count } = await supabase
    .from('ai_insights')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today)

  const used = count ?? 0
  return { ok: used < maxAiInsightsPerDay, used, limit: maxAiInsightsPerDay }
}

export async function checkReportLimit(userId: string): Promise<{ ok: boolean; used: number; limit: number }> {
  const { maxReportsPerMonth } = await getSubscriptionLimits(userId)
  const supabase = await createClient()
  const monthStart = startOfMonth(new Date()).toISOString()

  const { count } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart)

  const used = count ?? 0
  return { ok: used < maxReportsPerMonth, limit: maxReportsPerMonth, used }
}

export async function checkAdAccountLimit(userId: string): Promise<{ ok: boolean; used: number; limit: number }> {
  const { maxAdAccounts } = await getSubscriptionLimits(userId)
  const supabase = await createClient()

  const { data: fbAccounts } = await supabase
    .from('facebook_accounts')
    .select('id')
    .eq('user_id', userId)
  const fbIds = fbAccounts?.map((f) => f.id) ?? []

  const { count } = fbIds.length
    ? await supabase
        .from('ad_accounts')
        .select('*', { count: 'exact', head: true })
        .in('facebook_account_id', fbIds)
    : { count: 0 }

  const used = count ?? 0
  return { ok: used < maxAdAccounts, used, limit: maxAdAccounts }
}
