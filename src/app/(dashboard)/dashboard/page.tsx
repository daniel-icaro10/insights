import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: fbAccounts } = await supabase
    .from('facebook_accounts')
    .select('id')
    .eq('user_id', user.id)

  const fbIds = fbAccounts?.map((f) => f.id) ?? []
  const { data: adAccounts } = fbIds.length
    ? await supabase.from('ad_accounts').select('*').in('facebook_account_id', fbIds)
    : { data: [] }

  return <DashboardClient adAccounts={adAccounts ?? []} />
}
