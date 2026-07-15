import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from '../lib/auth'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation()

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
