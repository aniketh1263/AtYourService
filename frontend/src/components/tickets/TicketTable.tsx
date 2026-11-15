import { Fragment } from 'react'
import type { Ticket, TicketStatus } from '../../api/types'
import { formatDate } from '../../utils/format'
import { statusStyle } from '../../utils/tickets'
import PriorityBadge from './PriorityBadge'
import StatusSelect from './StatusSelect'

type TicketTableProps = {
  tickets: Ticket[]
  expandedId: number | null // the ticket whose description is open, if any
  updatingId: number | null // the ticket whose status is being saved, if any
  onToggle: (id: number) => void
  onStatusChange: (ticket: Ticket, status: TicketStatus) => void
  canEdit: boolean // agents can change a ticket's status; employees can only watch it
  showRequester: boolean // agents also see who raised each ticket
}

// The table itself. overflow-x-auto lets it scroll sideways on a narrow phone instead of breaking the page.
export default function TicketTable({
  tickets,
  expandedId,
  updatingId,
  onToggle,
  onStatusChange,
  canEdit,
  showRequester,
}: TicketTableProps) {
  const columns = showRequester ? 7 : 6

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Summary</th>
            {showRequester && <th className="px-4 py-3 font-medium">Requester</th>}
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tickets.map((ticket) => {
            const expanded = expandedId === ticket.id

            return (
              // A Fragment groups the row and its (optional) details row. The key goes on the Fragment,
              // because it is the outermost element of each list item.
              <Fragment key={ticket.id}>
                <tr className="hover:bg-surface-2">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-soft">#{ticket.id}</td>
                  <td className="max-w-md px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onToggle(ticket.id)}
                      aria-expanded={expanded} // tells screen readers whether the details are open
                      className="text-left font-medium text-ink hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {ticket.summary}
                    </button>
                  </td>
                  {showRequester && (
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{ticket.user?.name ?? 'Unknown'}</td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{ticket.category}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {canEdit ? (
                      <StatusSelect
                        status={ticket.status}
                        onChange={(status) => onStatusChange(ticket, status)}
                        disabled={updatingId === ticket.id}
                      />
                    ) : (
                      // Employees see the status as a plain badge: no dropdown, nothing to click.
                      <span className={`inline-block rounded-lg border px-2 py-1 text-xs font-medium ${statusStyle[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatDate(ticket.createdAt)}</td>
                </tr>

                {expanded && (
                  <tr className="bg-surface-2">
                    {/* colSpan: this one cell stretches across every column */}
                    <td colSpan={columns} className="px-4 py-4">
                      <p className="whitespace-pre-wrap text-sm text-ink">{ticket.description}</p>
                      <p className="mt-2 text-xs text-ink-faint">Last updated {formatDate(ticket.updatedAt)}</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
