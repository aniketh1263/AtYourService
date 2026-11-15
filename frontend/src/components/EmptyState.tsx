import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  hint?: string
  children?: ReactNode // optional extra content, such as a button or link
}

// Shown when there is simply nothing to list yet. Better than a blank screen, because it says what to do next.
export default function EmptyState({ title, hint, children }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface/70 p-8 text-center backdrop-blur">
      <p className="font-medium">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      {/* "children" is whatever is written between <EmptyState> and </EmptyState> */}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
