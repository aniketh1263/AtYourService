import { apiFetch } from './client'
import type { AuthResponse, User } from './types'

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(name: string, email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

/** Who am I? Used on page load to restore the session from the stored token. */
export function getMe() {
  return apiFetch<User>('/auth/me')
}
