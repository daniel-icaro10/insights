'use client'

import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Alert } from '@/types'

interface AlertsClientProps {
  alerts: Alert[]
}

const ALERT_LABELS: Record<string, string> = {
  ctr_drop: 'Queda de CTR',
  cpc_increase: 'CPC Alto',
  roas_drop: 'Queda de ROAS',
  spend_spike: 'Pico de Gasto',
  custom: 'Alerta',
}

export function AlertsClient({ alerts: initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts)

  async function markAsRead(alertId: string, isRead: boolean) {
    const res = await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, isRead }),
    })
    if (res.ok) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: isRead } : a))
      )
    }
  }

  const unreadCount = alerts.filter((a) => !a.is_read).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="w-6 h-6 text-[var(--accent)]" />
          Alertas
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--danger)] text-white text-sm">
              {unreadCount}
            </span>
          )}
        </h2>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhum alerta no momento"
          description="Os alertas aparecem automaticamente quando detectamos variações significativas: quedas de CTR, CPC alto, ROAS ou picos de gasto. Continue acessando o dashboard para gerarmos comparações."
          action={{ label: 'Ir para Dashboard', href: '/dashboard' }}
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-[var(--card)] border rounded-[var(--radius)] p-4 transition-colors ${
                alert.is_read
                  ? 'border-[var(--card-border)] opacity-75'
                  : 'border-[var(--accent)]/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 rounded text-xs bg-[var(--accent)]/20 text-[var(--accent)] mb-2">
                    {ALERT_LABELS[alert.alert_type] || alert.alert_type}
                  </span>
                  <p className="text-sm">{alert.message}</p>
                  {alert.threshold_value != null && (
                    <p className="text-xs text-[var(--muted)] mt-2">
                      Valor anterior: {alert.threshold_value} → Atual: {alert.current_value ?? '-'}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted)] mt-1">
                    {new Date(alert.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead(alert.id, true)}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/30"
                  >
                    <Check className="w-4 h-4" />
                    Marcar lido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
