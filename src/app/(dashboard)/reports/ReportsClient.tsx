'use client'

import { useState } from 'react'
import { subDays, format } from 'date-fns'
import { useStore } from '@/store/useStore'
import { DateFilter } from '@/components/ui/DateFilter'
import { AccountSelector } from '@/components/AccountSelector'
import { FileText, Download, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorWithRetry } from '@/components/ui/ErrorWithRetry'
import type { AdAccount, MetricsSummary, TimeSeriesDataPoint, Campaign, DateRange } from '@/types'

function getDateRangeLabel(range: DateRange, startDate?: string, endDate?: string): { start: string; end: string } {
  const today = new Date()
  if (range === 'custom' && startDate && endDate) return { start: startDate, end: endDate }
  if (range === 'today') return { start: format(today, 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
  if (range === 'yesterday') {
    const y = subDays(today, 1)
    return { start: format(y, 'yyyy-MM-dd'), end: format(y, 'yyyy-MM-dd') }
  }
  if (range === '7d') {
    return { start: format(subDays(today, 7), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
  }
  return { start: format(subDays(today, 30), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') }
}

interface ReportsClientProps {
  adAccounts: AdAccount[]
}

export function ReportsClient({ adAccounts }: ReportsClientProps) {
  const { selectedAdAccount, dateFilter } = useStore()
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf')
  const [error, setError] = useState<string | null>(null)

  const validAccount = adAccounts.find((a) => a.id === selectedAdAccount?.id) ?? adAccounts[0]
  const account = validAccount

  async function generateReport() {
    if (!account) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        adAccountId: account.id,
        range: dateFilter.range,
      })
      if (dateFilter.startDate) params.set('startDate', dateFilter.startDate)
      if (dateFilter.endDate) params.set('endDate', dateFilter.endDate)

      const metricsRes = await fetch(`/api/metrics?${params}`)
      const metrics = await metricsRes.json()

      if (!metricsRes.ok) {
        throw new Error(metrics?.error || 'Erro ao carregar métricas')
      }
      if (!metrics.summary) {
        throw new Error('Dados de métricas não disponíveis')
      }

      const { start, end } = getDateRangeLabel(dateFilter.range, dateFilter.startDate, dateFilter.endDate)
      const reportRes = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          summary: metrics.summary,
          campaigns: metrics.campaigns || [],
          timeSeries: metrics.timeSeries || [],
          dateRange: { start, end },
          adAccountId: account.id,
        }),
      })
      const report = await reportRes.json()

      if (!reportRes.ok) {
        throw new Error(report?.error || 'Erro ao gerar relatório')
      }

      if (report.data) {
        const blob = format === 'pdf'
          ? new Blob(
              [Uint8Array.from(atob(report.data), (c) => c.charCodeAt(0))],
              { type: 'application/pdf' }
            )
          : new Blob([atob(report.data)], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `adinsight-report-${new Date().toISOString().slice(0, 10)}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  if (adAccounts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Conecte uma conta para gerar relatórios"
        description="Exporte métricas e campanhas em PDF ou CSV. Primeiro, conecte sua conta do Facebook Ads."
        action={{ label: 'Conectar conta', href: '/ad-accounts' }}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {error && (
        <ErrorWithRetry
          error={new Error(error)}
          onRetry={generateReport}
          title="Erro ao gerar relatório"
        />
      )}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <AccountSelector accounts={adAccounts} />
          <div className="flex flex-wrap gap-2 items-center">
          <DateFilter />
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'pdf' | 'csv')}
            className="px-4 py-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)]"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
          <button
            onClick={generateReport}
            disabled={loading}
            className="btn btn-primary btn-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Gerar Relatório
          </button>
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[var(--radius)] p-6 sm:p-8 text-center">
        <FileText className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
        <h3 className="font-semibold mb-2">Relatórios Automatizados</h3>
        <p className="text-sm text-[var(--muted)] mb-6 max-w-md mx-auto">
          Gere relatórios com resumo de performance, comparação de campanhas e métricas principais.
          Exporte em PDF ou CSV.
        </p>
        <button
          onClick={generateReport}
          disabled={loading}
          className="btn btn-primary btn-lg"
        >
          {loading ? 'Gerando...' : 'Gerar Relatório Agora'}
        </button>
      </div>
    </div>
  )
}
