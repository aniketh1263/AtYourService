import type { Ticket, TicketPriority } from '../../api/types'

// Colour for each priority. Whole class names are written out in full on purpose: Tailwind finds
// classes by scanning the text of our files, so it could not find something built like "bg-" + colour.
const priorityStyle: Record<TicketPriority, string> = {
  Critical: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  High: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300',
  Medium: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300',
  Low: 'bg-surface-3 text-ink',
}

// A compact summary of the ticket that was just created.
export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Ticket #{ticket.id}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[ticket.priority]}`}>
          {ticket.priority}
        </span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft">
          {ticket.status}
        </span>
        <span className="text-xs text-ink-soft">{ticket.category}</span>
      </div>
      <p className="mt-1 text-sm text-ink">{ticket.summary}</p>
    </div>
  )
}
