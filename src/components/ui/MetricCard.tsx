import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
  loading?: boolean
  dotColor?: string
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, loading, dotColor = 'var(--accent)' }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 animate-fade-in shadow-sm">
        <div className="skeleton h-4 w-24 mb-4 rounded" />
        <div className="skeleton h-9 w-28 mb-2 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    )
  }

  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[var(--accent)]/25 transition-all duration-200 animate-fade-in min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <p className="text-[var(--muted)] text-xs font-semibold uppercase tracking-wide truncate">{title}</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                trend.isPositive ? 'text-[var(--success)]' : 'text-[var(--danger)]'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
          {subtitle && !trend && <p className="text-xs text-[var(--muted)] mt-1">{subtitle}</p>}
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--accent)]/10 shrink-0">
          <Icon className="w-5 h-5 text-[var(--accent)]" />
        </div>
      </div>
    </div>
  )
}
