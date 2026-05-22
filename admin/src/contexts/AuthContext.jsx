//admin
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — verify session is still valid with the backend
useEffect(() => {
  const stored = localStorage.getItem('fitwise_user')
  if (!stored) { setLoading(false); return }

  fetch('http://localhost:5000/me', { credentials: 'include' })
    .then(r => r.json())
    .then(data => {
      if (data?.id && data?.role === 'ADMIN') {
        setUser(data)
      } else {
        localStorage.removeItem('fitwise_user')
        localStorage.removeItem('fitwise_token')
        setUser(null)
      }
    })
    .catch(() => {
      // ✅ Don't fall back to localStorage — just clear everything
      localStorage.removeItem('fitwise_user')
      localStorage.removeItem('fitwise_token')
      setUser(null)
    })
    .finally(() => setLoading(false))
}, [])

  const login = (userData, token) => {
    localStorage.setItem('fitwise_user', JSON.stringify(userData))
    localStorage.setItem('fitwise_token', token)
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/logout', {
        method:      'POST',
        credentials: 'include',
      })
    } catch { /* ignore */ }
    localStorage.removeItem('fitwise_user')
    localStorage.removeItem('fitwise_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext