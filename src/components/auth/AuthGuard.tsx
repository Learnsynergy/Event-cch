import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requireRole?: 'organizer' | 'admin'
}

export function AuthGuard({ children, requireRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireRole && profile?.role !== requireRole) {
    return <Navigate to="/\" replace />
  }

  return <>{children}</>
}