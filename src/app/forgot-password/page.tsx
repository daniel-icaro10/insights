'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="bg-[var(--card)]/80 backdrop-blur-sm border border-[var(--card-border)] rounded-2xl p-8 text-center shadow-xl">
          <p className="text-[var(--success)] font-medium mb-4">
            Enviamos um link para redefinir sua senha no email informado.
          </p>
          <Link href="/login" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
            Voltar ao login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="bg-[var(--card)]/80 backdrop-blur-sm border border-[var(--card-border)] rounded-2xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-xl font-semibold mb-2">Redefinir senha</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          Informe seu email e enviaremos um link para criar uma nova senha.
        </p>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 rounded-xl"
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium">
            ← Voltar ao login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
