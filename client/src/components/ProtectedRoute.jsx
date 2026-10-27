import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from './States'

// Wraps routes that need a logged-in user (and optionally an admin).
// Guests are sent to /login and brought back here after logging in.
// Note: this only hides pages - the backend checks permissions on every request.
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, isAdmin, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <PageLoader label="Checking your session…" />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
