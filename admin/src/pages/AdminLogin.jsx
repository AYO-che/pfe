import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import logoImg from '../assets/logo.jpg'

const AdminLogin = () => {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:5000/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Invalid credentials')

      if (data.user?.role !== 'ADMIN') {
        setError('Access denied. Admin accounts only.')
        return
      }

      login(data.user, data.token ?? 'admin_token')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:   '100vh',
      background:  'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #F5F6FA 100%)',
      display:     'flex',
      alignItems:  'center',
      justifyContent: 'center',
      fontFamily:  'Plus Jakarta Sans, sans-serif',
    }}>
      <div style={{
        background:   '#FFFFFF',
        borderRadius: '20px',
        border:       '1px solid #E5E7EB',
        boxShadow:    '0 20px 60px rgba(0,0,0,0.1)',
        padding:      '40px',
        width:        '400px',
        maxWidth:     '92vw',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', overflow: 'hidden' }}>
          <img
            src={logoImg}
            alt="Chrysalis Logo"
            style={{
              width:      '180px',
              height:     '140px',
              objectFit:  'cover',
              transform:  'scale(1.25)',
            }}
          />
        </div>

        <h2 style={{
          fontFamily:   'Syne, sans-serif',
          fontSize:     '22px',
          textAlign:    'center',
          marginBottom: '6px',
          color:        '#1A1A2E',
        }}>
          Admin Dashboard
        </h2>
        <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', marginBottom: '28px' }}>
          Sign in to your admin account
        </p>

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@chrysalis.com"
                required
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2C6E3F'}
                onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '10px 40px 10px 36px',
                  border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#2C6E3F'}
                onBlur={e  => e.target.style.borderColor = '#E5E7EB'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer',
                }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#DC2626', padding: '10px 14px',
              borderRadius: '8px', fontSize: '13px', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background:    loading ? '#9CA3AF' : '#2C6E3F',
              color:         '#fff',
              border:        'none',
              borderRadius:  '8px',
              fontSize:      '14px',
              fontWeight:    600,
              cursor:        loading ? 'not-allowed' : 'pointer',
              transition:    'all 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default AdminLogin