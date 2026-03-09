'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { getErrorMessage } from '@/lib/error-messages'

interface ErrorWithRetryProps {
  error: unknown
  onRetry?: () => void
  title?: string
}

export function ErrorWithRetry({ error, onRetry, title = 'Algo deu errado' }: ErrorWithRetryProps) {
  const message = getErrorMessage(error)

  return (
    <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-[var(--danger)]">{title}</p>
          <p className="text-sm text-[var(--muted)] mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-danger btn-sm shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
