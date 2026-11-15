// Where the login token lives in the browser. localStorage survives closing the tab, so a refresh
// keeps you logged in. Every call is wrapped in try/catch because browsers can block storage
// (private mode, strict settings): the app then simply asks you to log in again.
//
// Trade-off worth knowing: any script running on the page can read localStorage, so an XSS bug
// would leak the token. The hardened alternative is an httpOnly cookie set by the server.

const KEY = 'atyourservice.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // ignore: see note at the top
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore: see note at the top
  }
}
