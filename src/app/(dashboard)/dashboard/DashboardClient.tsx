'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  MousePointer,
  Target,
  BarChart3,
  Building2,
} from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorWithRetry } from '@/components/ui/ErrorWithRetry'
import { ChartSkeleton } from '@/components/ui/Skeleton'
import { MetricCard } from '@/components/ui/MetricCard'
import { DateFilter } from '@/components/ui/DateFilter'
import { AccountSelector } from '@/components/AccountSelector'
import { OnboardingChecklist } from '@/components/OnboardingChecklist'
import { useStore } from '@/store/useStore'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { AdAccount, MetricsSummary, TimeSeriesDataPoint, Campaign } from '@/types'

interface DashboardClientProps {
  adAccounts: AdAccount[]
}

export function DashboardClient({ adAccounts }: DashboardClientProps) {
  const { selectedAdAccount, dateFilter } = useStore()
  const [data, setData] = useState<{
    summary: MetricsSummary
    timeSeries: TimeSeriesDataPoint[]
    campaigns: Campaign[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryKey, setRetryKey] = useState(0)

  const validAccount = adAccounts.find((a) => a.id === selectedAdAccount?.id) ?? adAccounts[0]
  const account = validAccount

  useEffect(() => {
    if (!account) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    const params = new URLSearchParams({
      adAccountId: account.id,
      range: dateFilter.range,
    })
    if (dateFilter.startDate) params.set('startDate', dateFilter.startDate)
    if (dateFilter.endDate) params.set('endDate', dateFilter.endDate)

    fetch(`/api/metrics?${params}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Falha ao carregar métricas')
        return json
      })
      .then((metrics) => {
        setData(metrics)
        if (metrics?.summary) {
          fetch('/api/alerts/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adAccountId: account.id, summary: metrics.summary }),
          }).catch(() => {})
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [account?.id, dateFilter, retryKey])

  if (adAccounts.length === 0) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={Building2}
          title="Conecte sua conta Facebook"
          description="Para ver métricas, campanhas e insights, conecte pelo menos uma conta de anúncios do Facebook Ads."
          action={{ label: 'Conectar Facebook Ads', href: '/ad-accounts' }}
        />
      </div>
    )
  }

  const summary = data?.summary
  const totalSpend = summary?.spend ?? 0

  return (
    <div className="space-y-8 animate-fade-in">
      <OnboardingChecklist
        hasAdAccounts={adAccounts.length > 0}
        hasMetrics={!!(data?.summary && !loading)}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <AccountSelector accounts={adAccounts} />
        </div>
        <DateFilter />
      </div>

      {error && (
        <ErrorWithRetry
          error={new Error(error)}
          onRetry={() => setRetryKey((k) => k + 1)}
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Gasto Total"
          value={loading ? '-' : `$${(summary?.spend ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          loading={loading}
          dotColor="#f97316"
        />
        <MetricCard
          title="Receita"
          value={loading ? '-' : `$${(summary?.revenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          loading={loading}
          dotColor="#22c55e"
        />
        <MetricCard
          title="ROAS"
          value={loading ? '-' : `${(summary?.roas ?? 0).toFixed(2)}x`}
          icon={BarChart3}
          loading={loading}
        />
        <MetricCard
          title="Cliques"
          value={loading ? '-' : (summary?.clicks ?? 0).toLocaleString()}
          icon={MousePointer}
          loading={loading}
        />
        <MetricCard
          title="CTR"
          value={loading ? '-' : `${(summary?.ctr ?? 0).toFixed(2)}%`}
          icon={Target}
          loading={loading}
        />
        <MetricCard
          title="CPC"
          value={loading ? '-' : `$${(summary?.cpc ?? 0).toFixed(2)}`}
          icon={DollarSign}
          loading={loading}
        />
        <MetricCard
          title="Conversões"
          value={loading ? '-' : (summary?.conversions ?? 0).toLocaleString()}
          icon={Target}
          loading={loading}
        />
        <MetricCard
          title="Impressões"
          value={loading ? '-' : (summary?.impressions ?? 0).toLocaleString()}
          icon={BarChart3}
          loading={loading}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
            <ChartSkeleton height={256} />
          </div>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
            <ChartSkeleton height={256} />
          </div>
        </div>
      ) : data?.timeSeries && data.timeSeries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--chart-orange)]" />
              Gasto ao longo do tempo
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeSeries}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Gasto']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    stroke="#f97316"
                    fill="url(#spendGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--chart-cyan)]" />
              Receita ao longo do tempo
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeSeries}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
                  <YAxis stroke="var(--muted)" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--card-border)',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Receita']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#06b6d4"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : null}

      {data?.campaigns && data.campaigns.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            Top Campanhas
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {data.campaigns.slice(0, 5).map((c) => {
                const pct = totalSpend > 0 ? ((c.metrics?.spend ?? 0) / totalSpend) * 100 : 0
                return (
                  <div key={c.id} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate max-w-[180px]">{c.campaign_name}</span>
                      <span className="text-[var(--muted)]">${(c.metrics?.spend ?? 0).toFixed(0)}</span>
                    </div>
                    <div className="h-2 bg-[var(--card-border)]/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent)]/60 transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="hidden lg:block" />
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--card-border)]">
                  <th className="pb-3 font-medium">Campanha</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Gasto</th>
                  <th className="pb-3 font-medium">Cliques</th>
                  <th className="pb-3 font-medium">CTR</th>
                  <th className="pb-3 font-medium">CPC</th>
                  <th className="pb-3 font-medium">Conversões</th>
                  <th className="pb-3 font-medium">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {data.campaigns.slice(0, 10).map((c) => (
                  <tr key={c.id} className="border-b border-[var(--card-border)]/50 hover:bg-[var(--card-border)]/20">
                    <td className="py-3 font-medium truncate max-w-[200px]">{c.campaign_name}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          c.status === 'ACTIVE'
                            ? 'bg-[var(--success)]/20 text-[var(--success)]'
                            : c.status === 'PAUSED'
                            ? 'bg-[var(--warning)]/20 text-[var(--warning)]'
                            : 'bg-[var(--muted)]/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3">${(c.metrics?.spend ?? 0).toFixed(2)}</td>
                    <td className="py-3">{c.metrics?.clicks ?? 0}</td>
                    <td className="py-3">{(c.metrics?.ctr ?? 0).toFixed(2)}%</td>
                    <td className="py-3">${(c.metrics?.cpc ?? 0).toFixed(2)}</td>
                    <td className="py-3">{c.metrics?.conversions ?? 0}</td>
                    <td className="py-3">{(c.metrics?.roas ?? 0).toFixed(2)}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href="/campaigns"
            className="inline-block mt-4 text-sm text-[var(--accent)] hover:underline touch-manipulation"
          >
            Ver todas as campanhas →
          </a>
        </div>
      )}
    </div>
  )
}
