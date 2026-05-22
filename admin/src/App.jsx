import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import './styles/globals.css'

// ── Guard: shows login if not authenticated, dashboard if authenticated
function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #F5F6FA 100%)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(44,110,63,0.2)',
          borderTop: '3px solid #2C6E3F',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not logged in or not admin → show login
  if (!user || user.role !== 'ADMIN') {
    return <AdminLogin />
  }

  // Logged in as admin → show dashboard
  return <AdminDashboard />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
