import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdAccountsClient } from './AdAccountsClient'

export default async function AdAccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const tier = profile?.subscription_tier || 'starter'
  const limits = { starter: 1, pro: 5, agency: 999 }
  const limit = limits[tier as keyof typeof limits] ?? 1

  const { data: fbAccounts } = await supabase
    .from('facebook_accounts')
    .select('id')
    .eq('user_id', user.id)

  const { data: adAccounts } = fbAccounts?.length
    ? await supabase
        .from('ad_accounts')
        .select('*')
        .in('facebook_account_id', fbAccounts.map((f) => f.id))
    : { data: [] }

  return (
    <AdAccountsClient
      adAccounts={adAccounts ?? []}
      limit={limit}
      tier={tier}
    />
  )
}
