import React, { useState, useEffect } from 'react'
import { Search, Plus, Eye, Trash2, Star, X, Mail, Calendar, Lock, Loader, RefreshCw } from 'lucide-react'

const BASE_URL = 'http://localhost:5000'
const COLORS = ['#2C6E3F', '#2196F3', '#9C27B0', '#FF9800']

const TYPE_COLORS = {
  PLAN:         { bg: '#10B98118', color: '#10B981' },
  PACKAGE:      { bg: '#3B82F618', color: '#3B82F6' },
  AI_CALORIES:  { bg: '#F59E0B18', color: '#F59E0B' },
}

const getInitials = (f = '', l = '') => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
const fmtDate     = iso => iso ? new Date(iso).toISOString().split('T')[0] : '—'

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include', ...opts })

/* ── Reset Password Modal ── */
const ResetPasswordModal = ({ user, onClose }) => {
  const [pw,      setPw]     = useState('')
  const [saving,  setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]  = useState(null)

  const handleReset = async () => {
    if (!pw.trim()) return
    setSaving(true); setError(null)
    try {
      const res = await apiFetch(`/users/${user.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ password: pw }),
      })
      if (!res.ok) throw new Error('Failed to reset password')
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: 380 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Reset Password — {user.firstName}</h3>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>
        <div style={{ padding: 24 }}>
          {success ? (
            <div style={{ textAlign: 'center', color: '#2C6E3F', fontWeight: 600, padding: '12px 0' }}>✓ Password updated!</div>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="text"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Enter new password..."
                />
              </div>
              {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={onClose} className="btn-secondary">Cancel</button>
                <button onClick={handleReset} className="btn-primary" disabled={!pw.trim() || saving}>
                  {saving ? <Loader size={13} className="spin" /> : <Lock size={13} />}
                  {' '}{saving ? 'Saving…' : 'Reset Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Profile Modal ── */
const ProfileModal = ({ doc, color, onClose, onResetPassword }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: 500 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${color},${color}bb)`, padding: 28, borderRadius: '14px 14px 0 0', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: 'white' }}><X size={16} /></button>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', border: '3px solid rgba(255,255,255,0.4)' }}>
            {getInitials(doc.firstName, doc.lastName)}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'Syne,sans-serif' }}>{doc.firstName} {doc.lastName}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(doc.resume?.offersTypes ?? []).length > 0
                ? doc.resume.offersTypes.map(t => (
                    <span key={t} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{t}</span>
                  ))
                : <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 10px', borderRadius: 20, fontSize: 12 }}>No offers yet</span>
              }
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'Syne,sans-serif' }}>{fmtDate(doc.createdAt)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Joined</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'white', fontFamily: 'Syne,sans-serif' }}>{doc.resume?.offersTypes?.length ?? 0}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Offer Types</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: 24 }}>
        <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
          <div style={{ background: 'var(--bg-main)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
              <Mail size={13} color={color} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email Address</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{doc.email}</div>
          </div>
          <div style={{ background: 'var(--bg-main)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
              <Calendar size={13} color={color} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Member Since</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{fmtDate(doc.createdAt)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => onResetPassword(doc)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Lock size={13} /> Reset Password
          </button>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
)

/* ── Add Modal ── */
const AddModal = ({ onClose, onAdd }) => {
  const [f,       setF]      = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [saving,  setSaving] = useState(false)
  const [error,   setError]  = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const res = await apiFetch('/nutritionists', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(f),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create nutritionist')
      onAdd(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: 450 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 17, color: 'var(--text-primary)' }}>Add New Expert</h3>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" required value={f.firstName} onChange={e => setF({ ...f, firstName: e.target.value })} placeholder="John" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" required value={f.lastName} onChange={e => setF({ ...f, lastName: e.target.value })} placeholder="Doe" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="john@example.com" />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="text" required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} placeholder="Set a strong password..." />
            </div>
          </div>
          {error && <div style={{ color: '#EF4444', fontSize: 13, marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader size={13} className="spin" /> : <Plus size={13} />}
              {' '}{saving ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main ── */
const Nutritionists = () => {
  const [docs,        setDocs]       = useState([])
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState(null)
  const [search,      setSearch]     = useState('')
  const [view,        setView]       = useState(null)   // { doc, color }
  const [resetTarget, setResetTarget] = useState(null)  // user to reset pw
  const [addOpen,     setAdd]        = useState(false)

  useEffect(() => { fetchNutritionists() }, [])

  const fetchNutritionists = async () => {
    setLoading(true); setError(null)
    try {
      const res = await apiFetch('/nutritionists')
      if (!res.ok) throw new Error('Failed to load nutritionists')
      const data = await res.json()
      setDocs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this nutritionist?')) return
    try {
      const res = await apiFetch(`/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setDocs(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const filtered = docs.filter(n =>
    `${n.firstName} ${n.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    n.email.toLowerCase().includes(search.toLowerCase()) ||
    (n.resume?.offersTypes ?? []).join(' ').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Loader size={28} className="spin" style={{ color: '#2C6E3F' }} />
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
      <p style={{ marginBottom: 12 }}>⚠️ {error}</p>
      <button className="btn-primary" onClick={fetchNutritionists}>Retry</button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Nutritionists Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{docs.length} expert{docs.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={fetchNutritionists}><RefreshCw size={14} /> Refresh</button>
          <button className="btn-primary" onClick={() => setAdd(true)}><Plus size={14} /> Add Expert</button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div className="search-box" style={{ width: 320 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or offer type..." />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>EXPERT NAME</th>
              <th>OFFER TYPES</th>
              <th>JOINED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No nutritionists found</td></tr>
            ) : filtered.map((n, i) => (
              <tr key={n.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                      {getInitials(n.firstName, n.lastName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{n.firstName} {n.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(n.resume?.offersTypes ?? []).length > 0
                      ? n.resume.offersTypes.map(t => {
                          const c = TYPE_COLORS[t] ?? { bg: '#6B728018', color: '#6B7280' }
                          return <span key={t} style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{t}</span>
                        })
                      : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                    }
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmtDate(n.createdAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-btn" onClick={() => setView({ doc: n, color: COLORS[i % COLORS.length] })} title="View Profile"><Eye size={14} /></button>
                    <button className="icon-btn danger" onClick={() => handleDelete(n.id)} title="Delete Account"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view && (
        <ProfileModal
          doc={view.doc}
          color={view.color}
          onClose={() => setView(null)}
          onResetPassword={(user) => { setView(null); setResetTarget(user) }}
        />
      )}
      {resetTarget && <ResetPasswordModal user={resetTarget} onClose={() => setResetTarget(null)} />}
      {addOpen && <AddModal onClose={() => setAdd(false)} onAdd={n => setDocs(prev => [n, ...prev])} />}
    </div>
  )
}

export default Nutritionists