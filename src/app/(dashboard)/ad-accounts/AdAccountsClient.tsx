'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, Check, AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { AdAccount } from '@/types'

interface AdAccountsClientProps {
  adAccounts: AdAccount[]
  limit: number
  tier: string
}

const ERROR_MESSAGES: Record<string, string> = {
  facebook_auth_failed: 'Falha na autenticação do Facebook.',
  token_exchange_failed: 'Erro ao trocar o token. Tente novamente.',
  meta_not_configured: 'Meta/Facebook não configurado. Configure META_APP_ID e META_APP_SECRET no .env.local',
  limit_reached: 'Limite de contas atingido no seu plano. Faça upgrade para conectar mais.',
}

export function AdAccountsClient({ adAccounts, limit, tier }: AdAccountsClientProps) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const success = params.get('success')
    if (error) {
      setFeedback({
        type: 'error',
        msg: ERROR_MESSAGES[error] || 'Erro ao conectar.',
      })
    }
    if (success === 'connected') {
      setFeedback({ type: 'success', msg: 'Conta do Facebook conectada com sucesso!' })
      window.history.replaceState({}, '', '/ad-accounts')
    }
  }, [])

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(t)
    }
  }, [feedback])

  const canAddMore = adAccounts.length < limit

  return (
    <div className="space-y-6 animate-fade-in">
      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            feedback.type === 'success'
              ? 'bg-[var(--success)]/10 text-[var(--success)]'
              : 'bg-[var(--danger)]/10 text-[var(--danger)]'
          }`}
        >
          {feedback.msg}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Contas de Anúncio</h2>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="text-sm text-[var(--muted)]">
            Plano {tier} • {adAccounts.length}/{limit === 999 ? '∞' : limit} contas
          </span>
          {canAddMore && (
            <a href="/api/facebook/connect" className="btn-link">
              Conectar Facebook
            </a>
          )}
        </div>
      </div>

      {!canAddMore && (
        <div className="p-4 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/30 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
          <p className="text-sm">
            Limite de contas atingido no plano {tier}.{' '}
            <Link href="/settings" className="text-[var(--accent)] hover:underline">
              Faça upgrade
            </Link>
          </p>
        </div>
      )}

      {adAccounts.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma conta conectada"
          description="Conecte sua conta do Facebook Ads para começar a acompanhar métricas, campanhas e receber insights com IA."
          action={{ label: 'Conectar Facebook Ads', href: '/api/facebook/connect' }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adAccounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-[var(--card)] border border-[var(--card-border)] rounded-[var(--radius)] p-6 hover:border-[var(--accent)]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <Building2 className="w-10 h-10 text-[var(--accent)]" />
                <span className="flex items-center gap-1 text-xs text-[var(--success)]">
                  <Check className="w-4 h-4" /> Conectado
                </span>
              </div>
              <h3 className="mt-4 font-semibold truncate">
                {acc.account_name || acc.ad_account_id}
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">
                {acc.ad_account_id} • {acc.currency}
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
              >
                Ver dashboard →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
