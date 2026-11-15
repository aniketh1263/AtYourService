import { apiFetch } from './client'
import type { ConversationDetail, ConversationSummary } from './types'

/** All past conversations, newest first. */
export function listConversations() {
  return apiFetch<ConversationSummary[]>('/conversations')
}

/** One conversation with all its messages. */
export function getConversation(id: string) {
  return apiFetch<ConversationDetail>(`/conversations/${id}`)
}

/** Deletes a conversation and its messages. */
export function deleteConversation(id: string) {
  return apiFetch<{ deleted: boolean }>(`/conversations/${id}`, { method: 'DELETE' })
}
