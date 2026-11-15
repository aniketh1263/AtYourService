import type { StatusFilter, SortOrder } from '../../utils/tickets'

type TicketFiltersProps = {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
  counts: Record<StatusFilter, number> // how many tickets each chip would show
  sort: SortOrder
  onSortChange: (value: SortOrder) => void
  onRefresh: () => void
  refreshing: boolean
}

// The filter chips, in display order.
const CHIPS: StatusFilter[] = ['All', 'Open', 'In Progress', 'Resolved']

// The bar above the table: search box, status chips, sort menu and a refresh button.
// It holds NO state of its own: the page owns it and passes values down, and this component
// reports changes back up through the on... functions ("data down, events up").
export default function TicketFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  counts,
  sort,
  onSortChange,
  onRefresh,
  refreshing,
}: TicketFiltersProps) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tickets by number, summary or description..."
          className="flex-1 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        />
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortOrder)}
          aria-label="Sort tickets"
          className="rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="priority">Highest priority first</option>
        </select>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-surface-3 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => onStatusFilterChange(chip)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              statusFilter === chip
                ? 'border-blue-600 bg-blue-900 dark:bg-blue-900 text-white'
                : 'border-line-strong bg-surface text-ink-soft hover:border-blue-300 dark:hover:border-blue-500/40 hover:text-blue-700 dark:hover:text-blue-300'
            }`}
          >
            {chip} <span className={statusFilter === chip ? 'text-blue-100' : 'text-ink-faint'}>{counts[chip]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
