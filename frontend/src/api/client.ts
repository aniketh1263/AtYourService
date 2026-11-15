// The one place that knows how to talk to the backend. Pages never call fetch() directly: they call
// small functions (see chat.ts) built on top of apiFetch. Benefits: one spot for error handling,
// and if the API address ever changes we edit a single line.

import { clearToken, getToken } from '../auth/token'

/** Fired when the server rejects our token, so the AuthProvider can log the user out. */
export const UNAUTHORIZED_EVENT = 'atyourservice:unauthorized'

/** An error with the HTTP status attached, so the UI can show a helpful message. */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/**
 * Calls the backend and returns the JSON as type T.
 *   apiFetch<ChatResponse>('/chat', { method: 'POST', body: ... })
 * "<T>" is a generic: the caller says what shape it expects back, and TypeScript trusts that.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response

  // Build the headers in one place.
  const headers = new Headers(init.headers)
  // Label the body as JSON only when it IS a JSON string. A file upload sends a FormData object instead,
  // and for that the browser must set the Content-Type itself (it adds a special "boundary" marker that
  // tells the server where each part of the form starts). Setting it by hand would break uploads.
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  // Prove who we are on every call. The server checks this token before doing anything.
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  try {
    response = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    // fetch only throws when the request never reached a server (backend down, no network).
    throw new ApiError('Cannot reach the server. Is the backend running?', 0)
  }

  // 401 = the token is missing, expired or no longer valid. Forget it and tell the app to show the login page.
  // (A wrong password on the login form is also a 401, but there is no token then, so we skip this.)
  if (response.status === 401 && token) {
    clearToken()
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  if (!response.ok) {
    // NestJS errors look like { statusCode, message, error }, where message is text or a list of texts.
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (Array.isArray(body.message)) message = body.message.join(', ')
      else if (typeof body.message === 'string') message = body.message
    } catch {
      // the error response was not JSON: keep the generic message
    }
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}
