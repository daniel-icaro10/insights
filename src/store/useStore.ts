import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AdAccount, DateFilter, MetricsSummary } from '@/types'

interface AppState {
  // UI
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Onboarding
  onboardingDismissed: boolean
  setOnboardingDismissed: (dismissed: boolean) => void
  hasGeneratedInsight: boolean
  setHasGeneratedInsight: (v: boolean) => void

  // Selected account
  selectedAdAccount: AdAccount | null
  setSelectedAdAccount: (account: AdAccount | null) => void

  // Date filter
  dateFilter: DateFilter
  setDateFilter: (filter: DateFilter) => void

  // Metrics cache for current view
  metricsSummary: MetricsSummary | null
  setMetricsSummary: (summary: MetricsSummary | null) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),

      onboardingDismissed: false,
      setOnboardingDismissed: (dismissed) => set({ onboardingDismissed: dismissed }),
      hasGeneratedInsight: false,
      setHasGeneratedInsight: (v) => set({ hasGeneratedInsight: v }),

      selectedAdAccount: null,
      setSelectedAdAccount: (account) => set({ selectedAdAccount: account }),

      dateFilter: { range: '30d' },
      setDateFilter: (filter) => set({ dateFilter: filter }),

      metricsSummary: null,
      setMetricsSummary: (summary) => set({ metricsSummary: summary }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'adinsight-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        dateFilter: state.dateFilter,
        onboardingDismissed: state.onboardingDismissed,
        hasGeneratedInsight: state.hasGeneratedInsight,
      }),
    }
  )
)
