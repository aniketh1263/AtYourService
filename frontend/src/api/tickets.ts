import { apiFetch } from './client'
import type { Ticket, TicketPriority, TicketStatus } from './types'

/** Admins only: changes a ticket's priority. */
export function updateTicketPriority(id: number, priority: TicketPriority) {
  return apiFetch<Ticket>(`/tickets/${id}/priority`, {
    method: 'PATCH',
    body: JSON.stringify({ priority }),
  })
}

/** All tickets, newest first. (Searching and filtering are done in the browser, on this list.) */
export function listTickets() {
  return apiFetch<Ticket[]>('/tickets')
}

/** Moves a ticket to a new status. The backend answers with the updated ticket. */
export function updateTicketStatus(id: number, status: TicketStatus) {
  return apiFetch<Ticket>(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
