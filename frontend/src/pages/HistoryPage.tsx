import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listConversations } from '../api/conversations'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import IntentBadge from '../components/IntentBadge'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { formatDate } from '../utils/format'

export default function HistoryPage() {
  // Our custom hook loads the list when the page opens. We rename "data" to "conversations" while taking it out.
  const { data: conversations, loading, error, reload } = useApi(listConversations)

  // What the user typed in the search box. Filtering happens right here in the browser.
  const [search, setSearch] = useState('')

  // DERIVED DATA: not stored in state, simply calculated from state on every draw.
  // (If we stored it too, we would have to keep two copies in sync.)
  const visible = (conversations ?? []).filter((conversation) =>
    conversation.title.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <>
      <PageHeader title="History" description="Your past conversations with the assistant." />

      {/* Exactly one of these is drawn, depending on where loading is. */}
      {loading && <LoadingState text="Loading your conversations..." />}

      {error && <ErrorState message={error} onRetry={reload} />}

      {conversations && conversations.length === 0 && (
        <EmptyState title="No conversations yet" hint="Your chats will show up here.">
          <Link
            to="/"
            className="rounded-lg bg-blue-900 dark:bg-blue-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 dark:hover:bg-blue-800"
          >
            Start a chat
          </Link>
        </EmptyState>
      )}

      {conversations && conversations.length > 0 && (
        <>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search your conversations..."
            className="mb-4 w-full rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
          />

          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">No conversation matches "{search}".</p>
          ) : (
            <ul className="space-y-2">
              {visible.map((conversation) => (
                <li key={conversation.id}>
                  {/* The whole card is a link to /history/<id>, which shows that conversation. */}
                  <Link
                    to={`/history/${conversation.id}`}
                    className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-blue-300 dark:hover:border-blue-500/40 hover:bg-blue-50/40 dark:hover:bg-blue-500/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate font-medium">{conversation.title}</p>
                      {conversation.intent && <IntentBadge intent={conversation.intent} />}
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">{formatDate(conversation.createdAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}
