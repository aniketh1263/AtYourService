import type { TicketStatus } from '../../api/types'
import { STATUSES, statusStyle } from '../../utils/tickets'

type StatusSelectProps = {
  status: TicketStatus
  onChange: (status: TicketStatus) => void
  disabled: boolean // true while this ticket's change is being saved
}

// A dropdown that shows the current status (coloured) and lets support staff change it.
export default function StatusSelect({ status, onChange, disabled }: StatusSelectProps) {
  return (
    <select
      value={status} // controlled, like a text input: the shown value always comes from the data
      // event.target.value is plain text; "as TicketStatus" tells TypeScript it is one of our three statuses
      // (safe, because the only options in the list are our statuses).
      onChange={(event) => onChange(event.target.value as TicketStatus)}
      disabled={disabled}
      aria-label="Ticket status"
      className={`rounded-lg border px-2 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 disabled:cursor-wait disabled:opacity-60 ${statusStyle[status]}`}
    >
      {STATUSES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
