import { apiFetch } from './client'
import type { DocumentRecord, DocumentScope, UploadedDocument } from './types'

/** Documents of one kind, newest first: the shared company policies, or the caller's own personal files. */
export function listDocuments(scope: DocumentScope) {
  return apiFetch<DocumentRecord[]>(`/documents?scope=${scope}`)
}

/** Uploads one PDF or Word file. The backend reads it, splits it into sections and stores them. */
export function uploadDocument(file: File) {
  // FormData is how browsers send files: a list of named parts, like a classic HTML form.
  // The part must be named "file" because that is the name the backend looks for.
  const form = new FormData()
  form.append('file', file)

  return apiFetch<UploadedDocument>('/documents', { method: 'POST', body: form })
}

/** Deletes a document and all its stored sections. */
export function deleteDocument(id: string) {
  return apiFetch<{ deleted: boolean }>(`/documents/${id}`, { method: 'DELETE' })
}
