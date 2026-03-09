export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton h-4 rounded ${className}`} />
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 shadow-sm animate-fade-in">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-9 w-28 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-[var(--card-border)]/50 last:border-0">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ height = 256 }: { height?: number }) {
  return (
    <div
      className="skeleton rounded-xl w-full"
      style={{ height }}
    />
  )
}

export function MetricsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  )
}
