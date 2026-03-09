'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!posthogKey || typeof window === 'undefined') return

    import('posthog-js').then(({ default: posthog }) => {
      if (typeof posthog.init === 'function') {
        posthog.init(posthogKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          person_profiles: 'identified_only',
        })
      }
    })
  }, [])

  useEffect(() => {
    if (!pathname) return
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!posthogKey || typeof window === 'undefined') return

    import('posthog-js').then(({ default: posthog }) => {
      if (posthog.capture) posthog.capture('$pageview', { $current_url: window.location.href })
    })
  }, [pathname])

  return <>{children}</>
}
