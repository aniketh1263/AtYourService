import type { TicketPriority, TicketStatus } from '../api/types'

// The statuses in the order a ticket normally moves through them.
export const STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Resolved']

// The status filter on the dashboard: one of the statuses, or "All".
export type StatusFilter = 'All' | TicketStatus

export type SortOrder = 'newest' | 'oldest' | 'priority'

// Colours. Full class names are written out so Tailwind can find them (it cannot find "bg-" + colour).
export const priorityStyle: Record<TicketPriority, string> = {
  Critical: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  High: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
  Medium: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  Low: 'bg-surface-3 text-ink',
}

export const statusStyle: Record<TicketStatus, string> = {
  Open: 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200',
  'In Progress': 'border-sky-300 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200',
  Resolved: 'border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200',
}

// Used to sort by urgency: smaller number = more urgent = comes first.
export const priorityRank: Record<TicketPriority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
}
