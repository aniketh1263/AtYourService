import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAuth } from './AuthContext'

// A "route guard": wraps every page that needs a login. Not logged in -> redirect to /login,
// remembering where you were going so we can send you back afterwards.
export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Still checking the stored token: do not flash the login page at someone who IS logged in.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState text="Loading..." />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <Outlet />
}
