import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { Header } from './components/layout/Header'
import { Events } from './pages/Events'
import { EventDetail } from './pages/EventDetail'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { Dashboard } from './pages/Dashboard'
import { CreateEvent } from './pages/CreateEvent'
import { Admin } from './pages/Admin'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              } 
            />
            <Route 
              path="/create-event" 
              element={
                <AuthGuard>
                  <CreateEvent />
                </AuthGuard>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AuthGuard requireRole="admin">
                  <Admin />
                </AuthGuard>
              } 
            />
          </Routes>
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App