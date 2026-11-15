import type { DocumentRecord } from '../../api/types'
import { formatDate } from '../../utils/format'
import { fileKind } from '../../utils/files'

// Colour for each kind of file. Full class names so Tailwind can find them.
const kindStyle = {
  PDF: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300',
  Word: 'bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300',
  File: 'bg-surface-3 text-ink',
}

type DocumentListProps = {
  documents: DocumentRecord[]
  deletingId: string | null // the document being deleted right now, if any
  onDelete?: (document: DocumentRecord) => void // leave out for a read-only list (no Delete button)
}

export default function DocumentList({ documents, deletingId, onDelete }: DocumentListProps) {
  return (
    <ul className="space-y-2">
      {documents.map((document) => {
        const kind = fileKind(document.filename)
        const deleting = deletingId === document.id

        return (
          <li
            key={document.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${kindStyle[kind]}`}>{kind}</span>
              <div className="min-w-0">
                <p className="truncate font-medium">{document.filename}</p>
                <p className="text-xs text-ink-soft">
                  {document.chunkCount} {document.chunkCount === 1 ? 'section' : 'sections'} &middot; uploaded{' '}
                  {formatDate(document.uploadedAt)}
                </p>
              </div>
            </div>

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(document)}
                disabled={deleting}
                className="shrink-0 rounded-lg border border-red-300 dark:border-red-500/40 bg-surface px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
