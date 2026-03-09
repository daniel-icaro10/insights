'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  Target,
  FileText,
  Sparkles,
  Bell,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { useTheme } from '@/components/ThemeProvider'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ad-accounts', label: 'Contas de Anúncio', icon: Building2 },
  { href: '/campaigns', label: 'Campanhas', icon: Target },
  { href: '/reports', label: 'Relatórios', icon: FileText },
  { href: '/ai-insights', label: 'Insights IA', icon: Sparkles },
  { href: '/alerts', label: 'Alertas', icon: Bell },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname, setSidebarOpen])

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    window.addEventListener('resize', handler)
    handler()
    return () => window.removeEventListener('resize', handler)
  }, [setSidebarOpen])

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-[var(--sidebar-bg)] text-white shadow-lg touch-manipulation"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full h-dvh w-56 max-w-[85vw] bg-[var(--sidebar-bg)] transition-transform duration-300 ease-out lg:translate-x-0 lg:max-w-none lg:shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-16 lg:pt-5 pb-safe">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-4 py-4"
          >
            <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shrink-0">
              AI
            </div>
            <span className="text-lg font-bold text-white tracking-tight">AdInsight</span>
          </Link>

          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)]">
                Dashboard
              </p>
              <div className="space-y-0.5">
                {navItems.slice(0, 4).map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all touch-manipulation min-h-[40px] ${
                        isActive
                          ? 'bg-[var(--sidebar-active-bg)] text-white'
                          : 'text-[var(--sidebar-text)] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)]">
                Ferramentas
              </p>
              <div className="space-y-0.5">
                {navItems.slice(4).map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all touch-manipulation min-h-[40px] ${
                        isActive
                          ? 'bg-[var(--sidebar-active-bg)] text-white'
                          : 'text-[var(--sidebar-text)] hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </nav>

          <div className="p-3 border-t border-white/10 space-y-3 shrink-0">
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)]">
                Tema
              </p>
              <div className="flex gap-1.5 px-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      theme === t
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-white/10 text-[var(--sidebar-text)] hover:bg-white/15'
                    }`}
                  >
                    {t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Auto'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 px-2">
              <Link href="/docs" className="text-xs text-[var(--sidebar-text-muted)] hover:text-white transition-colors">Docs</Link>
              <Link href="/suporte" className="text-xs text-[var(--sidebar-text-muted)] hover:text-white transition-colors">Suporte</Link>
              <Link href="/status" className="text-xs text-[var(--sidebar-text-muted)] hover:text-white transition-colors">Status</Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
