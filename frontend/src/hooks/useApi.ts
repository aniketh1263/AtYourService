import { useEffect, useState } from 'react'
import { ApiError } from '../api/client'

/**
 * A CUSTOM HOOK: our own reusable "use..." function, built from React's hooks.
 * It loads data when a component appears and tracks the three things every page needs:
 *   data    the result (null until it arrives), and setData to change it locally
 *   loading true while waiting
 *   error   a message if it failed (null otherwise)
 * plus reload() to run the request again (e.g. a "Try again" button).
 *
 * Usage:
 *   const { data, loading, error, reload } = useApi(() => getConversation(id), [id])
 *
 * `deps` is the list of values the request depends on. When one changes, the data is loaded again.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Changing this number is how reload() re-runs the effect below.
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // If the page is left (or deps change) before the server answers, we must ignore that late answer.
    // Otherwise a slow old response could overwrite newer data, or update a component that is gone.
    let cancelled = false

    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Something went wrong.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true // cleanup: runs when deps change or the component disappears
    }
    // We deliberately depend on the caller's `deps`, not on `fetcher` (a new function on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount])

  // setData is handed out too, so a page can update the loaded list in place (for example after changing
  // one ticket's status) without asking the server for the whole list again.
  return { data, setData, loading, error, reload: () => setReloadCount((count) => count + 1) }
}
