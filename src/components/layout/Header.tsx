import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="w-8 h-8 text-violet-600" />
            <span className="text-xl font-bold text-gray-900">EventPro</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-violet-600 transition-colors"
            >
              Événements
            </Link>
            {user && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-violet-600 transition-colors"
                >
                  Tableau de bord
                </Link>
                {profile?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-violet-600 transition-colors"
                  >
                    Administration
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{profile?.full_name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-violet-600 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}