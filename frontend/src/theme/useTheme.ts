import { useCallback, useSyncExternalStore } from 'react'

// The theme is a class on <html> ("dark" or nothing). index.html sets it before the first paint; this hook
// lets the UI read it and flip it. The choice is remembered in localStorage (wrapped in try/catch: browsers
// can block storage, and the switch must still work for the current visit).

const KEY = 'atyourservice.theme'
const root = document.documentElement

// useSyncExternalStore is React's tool for "state that lives OUTSIDE React" (here: a class on <html>).
// subscribe: tell React when it changes. getSnapshot: read the current value.
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const isDark = () => root.classList.contains('dark')

export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark)

  const toggle = useCallback(() => {
    const next = !isDark()
    root.classList.toggle('dark', next)
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light')
    } catch {
      // ignore: see note at the top
    }
    listeners.forEach((listener) => listener())
  }, [])

  return { dark, toggle }
}
