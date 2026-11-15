import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import { UNAUTHORIZED_EVENT } from '../api/client'
import type { AuthResponse, User } from '../api/types'
import { clearActiveChat } from '../utils/activeChat'
import { clearToken, getToken, setToken } from './token'

type AuthContextValue = {
  user: User | null // null = not logged in
  loading: boolean // true while we check a stored token on first load
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// A CONTEXT is React's way of sharing a value with every component below a provider,
// without passing it down through props. Any component can call useAuth() to read it.
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // If there is no stored token there is nothing to check, so we are not "loading".
  const [loading, setLoading] = useState(() => getToken() !== null)

  const logout = useCallback(() => {
    clearToken()
    clearActiveChat() // the next person must not inherit this user's open chat
    setUser(null)
  }, [])

  // On first load: if a token is stored, ask the server who it belongs to. An expired or invalid
  // token makes the call fail with 401, which apiFetch turns into a logout (see below).
  useEffect(() => {
    if (!getToken()) return
    authApi
      .getMe()
      .then(setUser)
      .catch(logout)
      .finally(() => setLoading(false))
  }, [logout])

  // apiFetch announces "the server rejected my token" (expired, or the account was removed).
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const startSession = useCallback((response: AuthResponse) => {
    clearActiveChat()
    setToken(response.accessToken)
    setUser(response.user)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => startSession(await authApi.login(email, password)),
      register: async (name, email, password) =>
        startSession(await authApi.register(name, email, password)),
      logout,
    }),
    [user, loading, startSession, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
