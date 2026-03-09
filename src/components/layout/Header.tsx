'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  title: string
  userEmail?: string
  alertsCount?: number
}

export function Header({ title, userEmail, alertsCount = 0 }: HeaderProps) {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--card-border)] safe-area-top shadow-sm">
      <div className="flex items-center justify-between gap-4 pl-14 lg:pl-6 pr-4 sm:pr-6 py-3 sm:py-4 min-w-0">
        <h1 className="text-lg sm:text-xl font-semibold truncate min-w-0 flex-1">{title}</h1>
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <Link
            href="/alerts"
            className="relative p-2.5 rounded-lg hover:bg-[var(--card)] active:bg-[var(--card)] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Bell className="w-5 h-5" />
            {alertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--danger)] text-[10px] text-white flex items-center justify-center">
                {alertsCount > 9 ? '9+' : alertsCount}
              </span>
            )}
          </Link>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--card)] active:bg-[var(--card)] transition-colors touch-manipulation min-h-[44px] min-w-[120px]"
            >
              <span className="text-sm text-[var(--muted)] truncate max-w-[180px]">
                {userEmail || 'Usuário'}
              </span>
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            </button>
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-lg shadow-xl z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--card-border)]/50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
