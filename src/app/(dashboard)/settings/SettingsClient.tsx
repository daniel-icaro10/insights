'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface SettingsClientProps {
  tier: string
  status: string
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    adAccounts: 1,
    features: ['1 conta de anúncio', 'Dashboard básico', 'Relatórios PDF'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    adAccounts: 5,
    features: ['5 contas de anúncio', 'Insights de IA', 'Alertas', 'Suporte prioritário'],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    adAccounts: 999,
    features: ['Contas ilimitadas', 'Tudo do Pro', 'API access', 'Gerente dedicado'],
  },
]

export function SettingsClient({ tier, status }: SettingsClientProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(planId: string) {
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data?.error || 'Erro ao iniciar checkout.')
      }
    } catch {
      alert('Erro ao conectar com Stripe.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold mb-2">Configurações</h2>
        <p className="text-[var(--muted)]">Gerencie sua assinatura e preferências.</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-[var(--radius)] p-6">
        <h3 className="font-semibold mb-4">Plano Atual</h3>
        <p className="text-sm">
          Plano: <span className="font-medium capitalize">{tier}</span> • Status:{' '}
          <span className={status === 'active' ? 'text-[var(--success)]' : 'text-[var(--muted)]'}>
            {status}
          </span>
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Planos</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = tier === plan.id
            return (
              <div
                key={plan.id}
                className={`rounded-[var(--radius)] border p-6 ${
                  isCurrent
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--card-border)] bg-[var(--card)]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">{plan.name}</h4>
                  {isCurrent && (
                    <span className="text-xs text-[var(--success)] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Atual
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1">
                  ${plan.price}<span className="text-sm font-normal text-[var(--muted)]">/mês</span>
                </p>
                <p className="text-sm text-[var(--muted)] mb-4">
                  {plan.adAccounts === 999 ? 'Contas ilimitadas' : `${plan.adAccounts} conta(s)`}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm flex items-center gap-2">
                      <Check className="w-4 h-4 text-[var(--success)] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || loading !== null}
                  className="btn btn-primary w-full disabled:cursor-not-allowed"
                >
                  {loading === plan.id ? 'Processando...' : isCurrent ? 'Plano Atual' : 'Assinar'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Configure STRIPE_SECRET_KEY, STRIPE_STARTER_PRICE_ID, STRIPE_PRO_PRICE_ID e
        STRIPE_AGENCY_PRICE_ID no ambiente para habilitar checkouts.
      </p>
    </div>
  )
}
