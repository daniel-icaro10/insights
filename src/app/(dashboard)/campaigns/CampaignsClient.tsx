'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { DateFilter } from '@/components/ui/DateFilter'
import { AccountSelector } from '@/components/AccountSelector'
import { Target } from 'lucide-react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorWithRetry } from '@/components/ui/ErrorWithRetry'
import type { AdAccount, Campaign } from '@/types'

interface CampaignsClientProps {
  adAccounts: AdAccount[]
}

export function CampaignsClient({ adAccounts }: CampaignsClientProps) {
  const { selectedAdAccount, dateFilter } = useStore()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string>('campaign_name')
  const [sortAsc, setSortAsc] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const validAccount = adAccounts.find((a) => a.id === selectedAdAccount?.id) ?? adAccounts[0]
  const account = validAccount

  useEffect(() => {
    if (!account) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      adAccountId: account.id,
      range: dateFilter.range,
    })
    if (dateFilter.startDate) params.set('startDate', dateFilter.startDate)
    if (dateFilter.endDate) params.set('endDate', dateFilter.endDate)

    fetch(`/api/metrics?${params}`)
      .then(async (res) => {
        const d = await res.json()
        if (!res.ok) throw new Error(d?.error || `Erro ${res.status}`)
        return d
      })
      .then((data) => {
        setCampaigns(data.campaigns || [])
      })
      .catch((err) => {
        setCampaigns([])
        setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas')
      })
      .finally(() => setLoading(false))
  }, [account?.id, dateFilter, retryKey])

  const getSortValue = (c: Campaign, key: string) => {
    if (key.startsWith('metrics.')) {
      const subKey = key.replace('metrics.', '') as keyof NonNullable<Campaign['metrics']>
      return c.metrics?.[subKey]
    }
    return (c as unknown as Record<string, unknown>)[key]
  }

  const filtered = campaigns
    .filter((c) =>
      c.campaign_name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = getSortValue(a, sortBy)
      const bv = getSortValue(b, sortBy)
      const cmp = typeof av === 'string'
        ? String(av).localeCompare(String(bv))
        : (Number(av ?? 0) - Number(bv ?? 0))
      return sortAsc ? cmp : -cmp
    })

  const toggleSort = (key: string) => {
    if (sortBy === key) setSortAsc(!sortAsc)
    else setSortBy(key)
  }

  if (adAccounts.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Conecte uma conta para ver campanhas"
        description="As campanhas do Facebook Ads aparecem aqui após conectar sua conta. É rápido e seguro."
        action={{ label: 'Conectar conta', href: '/ad-accounts' }}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AccountSelector accounts={adAccounts} />
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Buscar campanha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
          <DateFilter />
        </div>
      </div>

      {error && (
        <ErrorWithRetry
          error={new Error(error)}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      )}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[var(--radius)] overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={10} />
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="block md:hidden divide-y divide-[var(--card-border)]">
              {filtered.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-medium truncate flex-1 min-w-0">{c.campaign_name}</p>
                    <span
                      className={`flex-shrink-0 px-2 py-0.5 rounded text-xs ${
                        c.status === 'ACTIVE' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                        c.status === 'PAUSED' ? 'bg-[var(--warning)]/20 text-[var(--warning)]' :
                        'bg-[var(--muted)]/20'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[var(--muted)]">
                    <span>Gasto: ${(c.metrics?.spend ?? 0).toFixed(2)}</span>
                    <span>Cliques: {c.metrics?.clicks ?? 0}</span>
                    <span>CTR: {(c.metrics?.ctr ?? 0).toFixed(2)}%</span>
                    <span>CPC: ${(c.metrics?.cpc ?? 0).toFixed(2)}</span>
                    <span>Conversões: {c.metrics?.conversions ?? 0}</span>
                    <span>ROAS: {(c.metrics?.roas ?? 0).toFixed(2)}x</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--card-border)] bg-[var(--background)]/50">
                  <th className="px-4 lg:px-6 py-4 font-medium cursor-pointer" onClick={() => toggleSort('campaign_name')}>
                    Campanha {sortBy === 'campaign_name' && (sortAsc ? ' ↑' : ' ↓')}
                  </th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Status</th>
                  <th className="px-4 lg:px-6 py-4 font-medium cursor-pointer" onClick={() => toggleSort('metrics.spend')}>Gasto {sortBy === 'metrics.spend' && (sortAsc ? '↑' : '↓')}</th>
                  <th className="px-4 lg:px-6 py-4 font-medium cursor-pointer" onClick={() => toggleSort('metrics.clicks')}>Cliques</th>
                  <th className="px-4 lg:px-6 py-4 font-medium cursor-pointer" onClick={() => toggleSort('metrics.ctr')}>CTR</th>
                  <th className="px-4 lg:px-6 py-4 font-medium cursor-pointer" onClick={() => toggleSort('metrics.cpc')}>CPC</th>
                  <th className="px-4 lg:px-6 py-4 font-medium cursor-pointer" onClick={() => toggleSort('metrics.conversions')}>Conversões</th>
                  <th className="px-4 lg:px-6 py-4 font-medium cursor-pointer" onClick={() => toggleSort('metrics.roas')}>ROAS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--card-border)]/20">
                    <td className="px-4 lg:px-6 py-4 font-medium truncate max-w-[200px] lg:max-w-[250px]">{c.campaign_name}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          c.status === 'ACTIVE' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                          c.status === 'PAUSED' ? 'bg-[var(--warning)]/20 text-[var(--warning)]' :
                          'bg-[var(--muted)]/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">${(c.metrics?.spend ?? 0).toFixed(2)}</td>
                    <td className="px-4 lg:px-6 py-4">{c.metrics?.clicks ?? 0}</td>
                    <td className="px-4 lg:px-6 py-4">{(c.metrics?.ctr ?? 0).toFixed(2)}%</td>
                    <td className="px-4 lg:px-6 py-4">${(c.metrics?.cpc ?? 0).toFixed(2)}</td>
                    <td className="px-4 lg:px-6 py-4">{c.metrics?.conversions ?? 0}</td>
                    <td className="px-4 lg:px-6 py-4">{(c.metrics?.roas ?? 0).toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
