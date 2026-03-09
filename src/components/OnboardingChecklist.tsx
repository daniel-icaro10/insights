'use client'

import Link from 'next/link'
import { Check, ChevronRight, X } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface OnboardingChecklistProps {
  hasAdAccounts: boolean
  hasMetrics: boolean
}

const STEPS = [
  {
    id: 'connect',
    label: 'Conectar conta Facebook',
    href: '/ad-accounts',
    done: (hasAdAccounts: boolean) => hasAdAccounts,
  },
  {
    id: 'dashboard',
    label: 'Ver métricas no dashboard',
    href: '/dashboard',
    done: (hasAdAccounts: boolean, hasMetrics: boolean) => hasAdAccounts && hasMetrics,
  },
  {
    id: 'insight',
    label: 'Gerar primeiro insight com IA',
    href: '/ai-insights',
    done: (_: boolean, __: boolean, hasGenerated: boolean) => hasGenerated,
  },
] as const

export function OnboardingChecklist({ hasAdAccounts, hasMetrics }: OnboardingChecklistProps) {
  const { onboardingDismissed, setOnboardingDismissed, hasGeneratedInsight } = useStore()

  const allDone =
    hasAdAccounts &&
    hasMetrics &&
    hasGeneratedInsight

  if (onboardingDismissed || allDone) return null

  const completedCount = [
    hasAdAccounts,
    hasAdAccounts && hasMetrics,
    hasGeneratedInsight,
  ].filter(Boolean).length

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 shadow-sm mb-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-1">
            Comece por aqui
            <span className="text-xs font-normal text-[var(--muted)]">
              {completedCount}/3 concluído
            </span>
          </h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Siga os passos para aproveitar ao máximo o AdInsight AI.
          </p>
          <ul className="space-y-2">
            {STEPS.map((step) => {
              const isDone =
                step.id === 'connect'
                  ? hasAdAccounts
                  : step.id === 'dashboard'
                  ? hasAdAccounts && hasMetrics
                  : hasGeneratedInsight
              return (
                <li key={step.id}>
                  <Link
                    href={step.href}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                      isDone
                        ? 'text-[var(--muted)]'
                        : 'hover:bg-[var(--background)]/50 text-[var(--foreground)]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--card-border)]'
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : null}
                    </span>
                    <span className={isDone ? 'line-through' : ''}>{step.label}</span>
                    {!isDone && <ChevronRight className="w-4 h-4 ml-auto text-[var(--muted)]" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <button
          onClick={() => setOnboardingDismissed(true)}
          className="p-2 rounded-lg hover:bg-[var(--card-border)]/50 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
