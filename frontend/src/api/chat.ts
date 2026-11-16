import { apiFetch } from './client'
import type { ChatResponse, CreateTicketResponse } from './types'

/** Sends one message (and optionally a screenshot). Leave conversationId out to start a new conversation. */
export function sendMessage(message: string, conversationId?: string, image?: File) {
  if (image) {
    // A file must travel as multipart/form-data; the browser sets the Content-Type (see apiFetch).
    const form = new FormData()
    form.append('message', message)
    if (conversationId) form.append('conversationId', conversationId)
    form.append('image', image)
    return apiFetch<ChatResponse>('/chat', { method: 'POST', body: form })
  }
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
