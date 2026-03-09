import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertsClient } from './AlertsClient'
import type { Alert } from '@/types'

export default async function AlertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <AlertsClient alerts={(alerts || []) as Alert[]} />
}
