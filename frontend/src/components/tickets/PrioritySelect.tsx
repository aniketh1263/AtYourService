import type { TicketPriority } from '../../api/types'
import { PRIORITIES, priorityStyle } from '../../utils/tickets'

type PrioritySelectProps = {
  priority: TicketPriority
  onChange: (priority: TicketPriority) => void
  disabled: boolean
}

// Admin-only dropdown to change a ticket's priority.
export default function PrioritySelect({ priority, onChange, disabled }: PrioritySelectProps) {
  return (
    <select
      value={priority}
      onChange={(event) => onChange(event.target.value as TicketPriority)}
      disabled={disabled}
      aria-label="Ticket priority"
      className={`rounded-lg px-2 py-1 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 disabled:cursor-wait disabled:opacity-60 ${priorityStyle[priority]}`}
    >
      {PRIORITIES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
