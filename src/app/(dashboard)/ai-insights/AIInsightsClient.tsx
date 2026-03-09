'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { DateFilter } from '@/components/ui/DateFilter'
import { AccountSelector } from '@/components/AccountSelector'
import { Sparkles, Loader2, Lightbulb } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorWithRetry } from '@/components/ui/ErrorWithRetry'
import type { AdAccount } from '@/types'

interface AIInsightsClientProps {
  adAccounts: AdAccount[]
}

export function AIInsightsClient({ adAccounts }: AIInsightsClientProps) {
  const { selectedAdAccount, dateFilter, setHasGeneratedInsight } = useStore()
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validAccount = adAccounts.find((a) => a.id === selectedAdAccount?.id) ?? adAccounts[0]
  const account = validAccount

  async function analyze() {
    if (!account) return
    setLoading(true)
    setError('')
    setInsights([])
    try {
      const params = new URLSearchParams({
        adAccountId: account.id,
        range: dateFilter.range,
      })
      if (dateFilter.startDate) params.set('startDate', dateFilter.startDate)
      if (dateFilter.endDate) params.set('endDate', dateFilter.endDate)

      const metricsRes = await fetch(`/api/metrics?${params}`)
      const metrics = await metricsRes.json()

      if (!metricsRes.ok || !metrics.summary) {
        throw new Error(metrics?.error || 'Erro ao carregar métricas')
      }

      const insightsRes = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adAccountId: account.id,
          summary: metrics.summary,
          campaigns: metrics.campaigns,
        }),
      })

      if (!insightsRes.ok) {
        const err = await insightsRes.json()
        throw new Error(err.error || 'Falha ao gerar insights')
      }

      const data = await insightsRes.json()
      setInsights(Array.isArray(data.insights) ? data.insights : [data.insights || 'Nenhum insight gerado.'])
      setHasGeneratedInsight(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar campanhas.')
    } finally {
      setLoading(false)
    }
  }

  if (adAccounts.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Conecte uma conta para insights com IA"
        description="Nossa IA analisa suas campanhas e sugere otimizações. Conecte sua conta do Facebook Ads para começar."
        action={{ label: 'Conectar conta', href: '/ad-accounts' }}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AccountSelector accounts={adAccounts} />
        <div className="flex flex-wrap gap-2">
          <DateFilter />
          <button
            onClick={analyze}
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Analisar com IA
          </button>
        </div>
      </div>

      {error && (
        <ErrorWithRetry
          error={new Error(error)}
          onRetry={analyze}
          title="Erro na análise"
        />
      )}

      {loading && insights.length === 0 ? (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="skeleton h-5 w-5 rounded" />
            <div className="skeleton h-4 w-32" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg">
                <div className="skeleton h-4 w-4 rounded shrink-0" />
                <div className="skeleton h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ) : insights.length > 0 ? (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[var(--accent)]" />
            Insights de IA
          </h3>
          <ul className="space-y-3">
            {insights.map((insight, i) => (
              <li
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-[var(--background)]/50 border border-[var(--card-border)]/50"
              >
                <span className="text-[var(--accent)]">•</span>
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-12 text-center shadow-sm">
          <Sparkles className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
          <h3 className="font-semibold mb-2">Análise com IA</h3>
          <p className="text-sm text-[var(--muted)] mb-6 max-w-md mx-auto">
            Use IA para analisar suas campanhas e obter insights sobre CTR, CPC, ROAS e performance.
          </p>
          <button
            onClick={analyze}
            disabled={loading}
            className="btn btn-primary btn-lg"
          >
            {loading ? 'Analisando...' : 'Gerar Insights'}
          </button>
        </div>
      )}
    </div>
  )
}
