import { apiFetch } from './client'
import type { ChatResponse, CreateTicketResponse } from './types'

/** Sends one message. Leave conversationId out to start a new conversation. */
export function sendMessage(message: string, conversationId?: string) {
  return apiFetch<ChatResponse>('/chat', {
    method: 'POST',
    // JSON.stringify drops keys whose value is undefined, so a new chat simply omits conversationId.
    body: JSON.stringify({ message, conversationId }),
  })
}

/** The "Create ticket" button: raises a ticket from everything said so far in this conversation. */
export function createTicketFromChat(conversationId: string) {
  return apiFetch<CreateTicketResponse>(`/chat/${conversationId}/ticket`, { method: 'POST' })
}
