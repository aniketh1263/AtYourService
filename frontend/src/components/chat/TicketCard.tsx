import type { Ticket } from '../../api/types'

// A compact summary of the ticket that was just created.
export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Ticket #{ticket.id}</span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft">
          {ticket.status}
        </span>
        <span className="text-xs text-ink-soft">{ticket.category}</span>
      </div>
      <p className="mt-1 text-sm text-ink">{ticket.summary}</p>
    </div>
  )
}
