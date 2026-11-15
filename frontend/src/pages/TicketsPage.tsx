import { useState } from 'react'
import { ApiError } from '../api/client'
import { listTickets, updateTicketStatus } from '../api/tickets'
import type { Ticket, TicketStatus } from '../api/types'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import TicketFilters from '../components/tickets/TicketFilters'
import TicketTable from '../components/tickets/TicketTable'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../auth/AuthContext'
import { priorityRank } from '../utils/tickets'
import type { SortOrder, StatusFilter } from '../utils/tickets'

export default function TicketsPage() {
  // Agents see every ticket and can change its status. Employees only see (and watch) their own.
  const isAgent = useAuth().user?.role === 'agent'
  // All tickets, loaded once when the page opens. setTickets lets us change the list in place later.
  const { data: tickets, setData: setTickets, loading, error, reload } = useApi(listTickets)

  // What the user has chosen on the dashboard. These are the only pieces of "view" state.
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [sort, setSort] = useState<SortOrder>('newest')
  const [expandedId, setExpandedId] = useState<number | null>(null) // which row shows its description

  // State for saving a status change.
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // ---- DERIVED DATA: everything below is calculated from the state above on every draw ----
  const all = tickets ?? []

  // How many tickets each filter chip would show.
  const counts: Record<StatusFilter, number> = {
    All: all.length,
    Open: all.filter((ticket) => ticket.status === 'Open').length,
    'In Progress': all.filter((ticket) => ticket.status === 'In Progress').length,
    Resolved: all.filter((ticket) => ticket.status === 'Resolved').length,
  }

  // "#12" and "12" should both find ticket 12.
  const query = search.trim().toLowerCase().replace(/^#/, '')

  const visible = all
    .filter((ticket) => statusFilter === 'All' || ticket.status === statusFilter)
    .filter(
      (ticket) =>
        !query || // an empty search matches everything
        `${ticket.id} ${ticket.summary} ${ticket.description} ${ticket.category} ${ticket.priority}`
          .toLowerCase()
          .includes(query),
    )
    // .filter() returns a new array, so .sort() (which rearranges the array it is called on) is safe here.
    .sort((a, b) => {
      if (sort === 'priority') {
        // More urgent first; for equal urgency, the newer ticket first.
        return priorityRank[a.priority] - priorityRank[b.priority] || b.id - a.id
      }
      // Ticket ids grow over time, so comparing ids is the same as comparing creation order.
      return sort === 'newest' ? b.id - a.id : a.id - b.id
    })

  // Save a new status, then replace that one ticket in the list with the server's updated version.
  async function handleStatusChange(ticket: Ticket, status: TicketStatus) {
    if (status === ticket.status) return

    setUpdatingId(ticket.id)
    setUpdateError(null)
    try {
      const updated = await updateTicketStatus(ticket.id, status)
      // map() builds a new list where the changed ticket is swapped for the updated one.
      // Because "visible" is derived, a ticket that no longer matches the active chip simply drops out of view.
      setTickets((previous) => previous?.map((t) => (t.id === updated.id ? updated : t)) ?? previous)
    } catch (err) {
      setUpdateError(err instanceof ApiError ? err.message : 'Could not update the ticket.')
    } finally {
      setUpdatingId(null)
    }
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('All')
  }

  return (
    <>
      <PageHeader
        title={isAgent ? 'All tickets' : 'My tickets'}
        description={
          isAgent
            ? 'Search, filter and update support tickets from every employee.'
            : 'Track the tickets you have raised. IT support updates their status.'
        }
      />

      {/* Show the full-page spinner only on the first load, so a Refresh does not make the table vanish. */}
      {loading && !tickets && <LoadingState text="Loading tickets..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {tickets && (
        <>
          <TicketFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            counts={counts}
            sort={sort}
            onSortChange={setSort}
            onRefresh={reload}
            refreshing={loading}
          />

          {updateError && (
            <p className="mb-3 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/50 px-4 py-2 text-sm text-red-800 dark:text-red-200">
              {updateError}
            </p>
          )}

          {all.length === 0 ? (
            <EmptyState
              title="No tickets yet"
              hint="Tickets are created from the chat when the assistant cannot solve a problem."
            />
          ) : visible.length === 0 ? (
            <EmptyState title="No tickets match your filters">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-3"
              >
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <>
              <TicketTable
                tickets={visible}
                expandedId={expandedId}
                updatingId={updatingId}
                // Clicking the open row closes it; clicking another row opens that one instead.
                onToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
                onStatusChange={handleStatusChange}
                canEdit={isAgent}
                showRequester={isAgent}
              />
              <p className="mt-2 text-xs text-ink-soft">
                Showing {visible.length} of {all.length} tickets. Click a summary to read the full description.
              </p>
            </>
          )}
        </>
      )}
    </>
  )
}
