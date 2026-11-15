// Checks done in the browser BEFORE uploading, so the user gets an instant, friendly message instead of
// waiting for the server to say no. The backend checks again (never trust only the browser), so these
// are for convenience, not security.

export const MAX_FILE_SIZE_MB = 10 // matches the limit in the backend
const ALLOWED_EXTENSIONS = ['.pdf', '.docx']

/** The file's extension in lower case, e.g. "Policy.PDF" -> ".pdf". */
function extensionOf(filename: string) {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot).toLowerCase()
}

/** Returns a message describing what is wrong with the file, or null if it is fine. */
export function validateDocumentFile(file: File): string | null {
  const extension = extensionOf(file.name)

  if (extension === '.doc') {
    return 'Old Word files (.doc) are not supported. Save it as .docx and try again.'
  }
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Only PDF (.pdf) and Word (.docx) files are supported.'
  }
  if (file.size === 0) {
    return 'This file is empty.'
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `This file is larger than ${MAX_FILE_SIZE_MB} MB.`
  }
  return null
}

/** "Policy.pdf" -> "PDF", "Policy.docx" -> "Word", anything else -> "File". */
export function fileKind(filename: string): 'PDF' | 'Word' | 'File' {
  const extension = extensionOf(filename)
  if (extension === '.pdf') return 'PDF'
  if (extension === '.docx' || extension === '.doc') return 'Word'
  return 'File'
}
