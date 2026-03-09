'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error)
    }
  }, [error])

  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui', padding: '2rem', background: '#0f0f12', color: '#fafafa' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Algo deu errado</h1>
          <p style={{ color: '#71717a', marginBottom: '1.5rem' }}>
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#6366f1',
              color: 'white',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Voltar ao início
          </Link>
        </div>
      </body>
    </html>
  )
}
