import { useState } from 'react'
import { ApiError } from '../api/client'
import { deleteDocument, listDocuments, uploadDocument } from '../api/documents'
import type { DocumentRecord } from '../api/types'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/PageHeader'
import DocumentList from '../components/upload/DocumentList'
import DropZone from '../components/upload/DropZone'
import { useAuth } from '../auth/AuthContext'
import { useApi } from '../hooks/useApi'
import { validateDocumentFile } from '../utils/files'

// The result of trying to upload ONE file, for the message list under the drop zone.
type UploadOutcome = { filename: string; ok: boolean; message: string }

export default function UploadPage() {
  // Only admins (agents) can upload or delete company policies. Employees get a read-only list.
  // The server enforces this too; this just shapes the page.
  const isAgent = useAuth().user?.role === 'agent'

  const { data: documents, loading, error, reload } = useApi(() => listDocuments('company'), [])

  const [uploading, setUploading] = useState(false)
  const [outcomes, setOutcomes] = useState<UploadOutcome[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Called with the files the user dropped or picked. They are uploaded ONE AFTER ANOTHER.
  async function handleFiles(files: File[]) {
    if (files.length === 0) return

    setUploading(true)
    setOutcomes([])
    setDeleteError(null)

    const results: UploadOutcome[] = []

    // "for...of" with "await" inside waits for each upload to finish before starting the next one.
    for (const file of files) {
      // 1. Check in the browser first: instant feedback and no wasted upload.
      const problem = validateDocumentFile(file)
      if (problem) {
        results.push({ filename: file.name, ok: false, message: problem })
        continue // skip to the next file
      }

      // 2. Upload. The server reads the text, so this can take a moment for big files.
      try {
        const uploaded = await uploadDocument(file)
        results.push({
          filename: file.name,
          ok: true,
          message: `Added and split into ${uploaded.chunkCount} ${uploaded.chunkCount === 1 ? 'section' : 'sections'}.`,
        })
      } catch (err) {
        results.push({
          filename: file.name,
          ok: false,
          message: err instanceof ApiError ? err.message : 'Upload failed. Please try again.',
        })
      }
    }

    setOutcomes(results)
    setUploading(false)
    reload() // refresh the list so the new documents appear
  }

  async function handleDelete(document: DocumentRecord) {
    if (!window.confirm(`Delete "${document.filename}"? The assistant will no longer answer from it.`)) return

    setDeletingId(document.id)
    setDeleteError(null)
    setOutcomes([]) // hide old upload messages to keep the page tidy
    try {
      await deleteDocument(document.id)
      reload()
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete the document.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Company policies"
        description={
          isAgent
            ? 'Upload company policy documents (PDF or Word). The assistant answers every employee from them.'
            : 'Company policy documents (read-only). The assistant answers your policy questions from them.'
        }
      />

      {isAgent && (
        <>
          <DropZone onFiles={handleFiles} disabled={uploading} />

          <p className="mt-2 text-xs text-ink-soft">
            Uploading a file with the same name replaces the old version. Scanned PDFs (pictures of pages) cannot be read.
          </p>
        </>
      )}

      {uploading && (
        <div className="mt-4">
          <LoadingState text="Uploading and reading your file(s)..." />
        </div>
      )}

      {/* One line per file, green for success and red for a problem. */}
      {outcomes.length > 0 && (
        <ul className="mt-4 space-y-2">
          {outcomes.map((outcome, index) => (
            <li
              key={`${outcome.filename}-${index}`}
              className={`rounded-lg border px-4 py-2 text-sm ${
                outcome.ok
                  ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                  : 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200'
              }`}
            >
              <span className="font-medium">{outcome.filename}</span>: {outcome.message}
            </li>
          ))}
        </ul>
      )}

      <h3 className="mb-3 mt-8 text-lg font-semibold">Company policies</h3>

      {deleteError && <p className="mb-3 text-sm text-red-700 dark:text-red-300">{deleteError}</p>}

      {/* While re-loading after an upload we keep showing the current list instead of flashing a spinner. */}
      {loading && !documents && <LoadingState text="Loading documents..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {documents && documents.length === 0 && (
        <EmptyState
          title="No documents yet"
          hint={
            isAgent
              ? 'Upload a policy file above. Policy questions in the chat cannot be answered until you do.'
              : 'No company policies have been published yet.'
          }
        />
      )}

      {documents && documents.length > 0 && (
        <DocumentList
          documents={documents}
          deletingId={deletingId}
          onDelete={isAgent ? handleDelete : undefined}
        />
      )}
    </>
  )
}
