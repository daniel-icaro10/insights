'use client'

import { useStore } from '@/store/useStore'
import type { DateRange } from '@/types'

const PRESETS: { value: DateRange; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'yesterday', label: 'Ontem' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'custom', label: 'Personalizado' },
]

export function DateFilter() {
  const { dateFilter, setDateFilter } = useStore()

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => setDateFilter({ ...dateFilter, range: p.value })}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 touch-manipulation ${
            dateFilter.range === p.value
              ? 'bg-gradient-to-r from-[var(--accent)] to-[#7c3aed] text-white shadow-md shadow-[var(--accent)]/20'
              : 'bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)] hover:bg-[var(--accent)]/5'
          }`}
        >
          {p.label}
        </button>
      ))}
      {dateFilter.range === 'custom' && (
        <div className="flex flex-wrap gap-2 ml-2 items-center">
          <input
            type="date"
            value={dateFilter.startDate || ''}
            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          />
          <input
            type="date"
            value={dateFilter.endDate || ''}
            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
            className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"
          />
          {(!dateFilter.startDate || !dateFilter.endDate) && (
            <span className="text-xs text-[var(--warning)]">Selecione início e fim</span>
          )}
        </div>
      )}
    </div>
  )
}
