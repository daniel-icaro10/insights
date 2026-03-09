import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-10 sm:p-12 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
        <Icon className="w-7 h-7 text-[var(--accent)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--muted)] max-w-md mx-auto mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <a href={action.href} className="btn-link">
            {action.label}
          </a>
        )}
        {secondaryAction && (
          <a href={secondaryAction.href} className="btn-link-outline">
            {secondaryAction.label}
          </a>
        )}
      </div>
    </div>
  )
}
