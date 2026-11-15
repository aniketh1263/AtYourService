import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteConversation, getConversation } from '../api/conversations'
import { ApiError } from '../api/client'
import ErrorState from '../components/ErrorState'
import IntentBadge from '../components/IntentBadge'
import LoadingState from '../components/LoadingState'
import MessageBubble from '../components/chat/MessageBubble'
import { toUiMessage } from '../components/chat/mappers'
import { useApi } from '../hooks/useApi'
import { clearActiveChat, getActiveChat, setActiveChat } from '../utils/activeChat'
import { formatDate } from '../utils/format'

// A read-only view of one past conversation: the page for the URL /history/:conversationId
export default function ConversationPage() {
  // useParams reads the ":conversationId" part of the URL. It is text, or undefined if missing.
  const { conversationId } = useParams()
  // useNavigate gives us a function to move to another page from code (not from a link click).
  const navigate = useNavigate()

  // Loaded again whenever the id in the URL changes.
  const { data: conversation, loading, error, reload } = useApi(
    () => getConversation(conversationId ?? ''),
    [conversationId],
  )

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // "Continue": tell the chat page which conversation to open, then go there.
  function handleContinue() {
    if (!conversation) return
    setActiveChat(conversation.id)
    navigate('/')
  }

  async function handleDelete() {
    if (!conversation) return
    // window.confirm shows the browser's standard OK / Cancel question. Returns false on Cancel.
    if (!window.confirm('Delete this conversation? This cannot be undone.')) return

    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteConversation(conversation.id)
      // If this was the conversation the chat page had open, forget it.
      if (getActiveChat() === conversation.id) clearActiveChat()
      navigate('/history')
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete the conversation.')
      setDeleting(false)
    }
  }

  return (
    <>
      <Link to="/history" className="mb-4 inline-block text-sm font-medium text-blue-900 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200">
        &larr; Back to history
      </Link>

      {loading && <LoadingState text="Loading conversation..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {conversation && (
        <>
          <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold">{conversation.title}</h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
                <span>{formatDate(conversation.createdAt)}</span>
                {conversation.intent && <IntentBadge intent={conversation.intent} />}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-lg bg-blue-900 dark:bg-blue-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 dark:hover:bg-blue-800"
              >
                Continue this chat
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-300 dark:border-red-500/40 bg-surface px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </header>

          {deleteError && <p className="mb-4 text-sm text-red-700 dark:text-red-300">{deleteError}</p>}

          <div className="space-y-4 pb-4">
            {conversation.messages.map((record) => (
              <MessageBubble
                key={record.id}
                message={toUiMessage(record)}
                showTicketButton={false} // this page is read-only: no ticket button
                ticketLoading={false}
                onCreateTicket={() => {}} // required by the component but never used here
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
