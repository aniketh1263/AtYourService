import type { TicketPriority } from '../../api/types'
import { priorityStyle } from '../../utils/tickets'

// A small coloured pill: Critical (red), High (orange), Medium (amber), Low (grey).
export default function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[priority]}`}>
      {priority}
    </span>
  )
}
