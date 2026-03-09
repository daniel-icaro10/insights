'use client'

import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--background)] relative overflow-hidden">
      {/* Subtle gradient orbs - modern SaaS background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-72 h-72 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <Link
        href="/"
        className="relative z-10 text-xl font-semibold text-[var(--foreground)] mb-8 hover:text-[var(--accent)] transition-colors"
      >
        AdInsight AI
      </Link>

      <div className="relative z-10 w-full max-w-[400px]">
        {children}
      </div>

      <p className="relative z-10 mt-8 text-xs text-[var(--muted)]">
        Analytics profissional para Facebook Ads
      </p>
    </div>
  )
}
