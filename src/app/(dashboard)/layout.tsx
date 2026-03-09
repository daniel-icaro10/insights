import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { count } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  return (
    <div className="min-h-screen min-h-dvh safe-area-inset">
      <Sidebar />
      <main className="min-h-screen lg:ml-56">
        <Header
          title="AdInsight AI"
          userEmail={user.email ?? undefined}
          alertsCount={count ?? 0}
        />
        <div className="p-4 sm:p-6 lg:p-8 pb-safe w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
