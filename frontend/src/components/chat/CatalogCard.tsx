import type { CatalogItem } from '../../api/types'

// One service-catalog item shown as a card, with a button to the request portal.
export default function CatalogCard({ item }: { item: CatalogItem }) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{item.name}</h4>
        <span className="rounded-full bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-900 dark:text-blue-200">
          {item.category}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">{item.description}</p>
      <a
        href={item.portalUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block rounded-lg bg-blue-900 dark:bg-blue-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 dark:hover:bg-blue-800"
      >
        Open request portal
      </a>
    </div>
  )
}
