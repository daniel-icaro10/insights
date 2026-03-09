'use client'

import { useEffect, useState, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { ChevronDown } from 'lucide-react'
import type { AdAccount } from '@/types'

interface AccountSelectorProps {
  accounts: AdAccount[]
}

export function AccountSelector({ accounts }: AccountSelectorProps) {
  const { selectedAdAccount, setSelectedAdAccount } = useStore()

  useEffect(() => {
    if (accounts.length === 0) return
    const isValid = selectedAdAccount && accounts.some((a) => a.id === selectedAdAccount.id)
    if (!selectedAdAccount || !isValid) {
      setSelectedAdAccount(accounts[0])
    }
  }, [accounts, selectedAdAccount, setSelectedAdAccount])

  if (accounts.length === 0) return null

  const current = accounts.find((a) => a.id === selectedAdAccount?.id) ?? accounts[0]
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/50 active:border-[var(--accent)]/50 transition-colors w-full sm:w-auto min-w-[160px] sm:min-w-[200px] touch-manipulation shadow-sm"
      >
        <span className="text-sm font-medium truncate flex-1 min-w-0 text-left">
          {current?.account_name || current?.ad_account_id || 'Selecionar conta'}
        </span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] py-2 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-xl z-[100] max-h-[60vh] overflow-y-auto">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => {
                  setSelectedAdAccount(acc)
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-[var(--card-border)]/50 active:bg-[var(--card-border)]/50 touch-manipulation min-h-[44px] ${
                  current?.id === acc.id ? 'text-[var(--accent)] font-medium' : ''
                }`}
              >
                {acc.account_name || acc.ad_account_id}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
