import React, { useState, useEffect } from 'react'
import { Search, Eye, Trash2, X, CreditCard, Mail, Loader, RefreshCw, Calendar, User } from 'lucide-react'

const BASE_URL = 'https://chrysalise-server.onrender.com'
const COLORS = ['#2C6E3F', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3']

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include', ...opts })

const getInitials = (f = '', l = '') => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
const fmtDate     = iso => iso ? new Date(iso).toISOString().split('T')[0] : '—'

const SubBadge = ({ s }) => {
  const m = { ACTIVE: ['#DCFCE7', '#16A34A'], CANCELLED: ['#FEE2E2', '#DC2626'], EXPIRED: ['#FEF3C7', '#D97706'] }
  const [bg, c] = m[s] ?? ['#F3F4F6', '#6B7280']
  return <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s}</span>
}

/* ── Profile Modal — fetches subscriptions on open ── */
const ProfileModal = ({ client, onClose }) => {
  const [subs,    setSubs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true); setError(null)
      try {
const res = await apiFetch(`/subscriptions/patient/${client.id}`)
        if (!res.ok) throw new Error('Failed to load subscriptions')
        const data = await res.json()
        // handle both array and { subscriptions: [] } shapes
        setSubs(Array.isArray(data) ? data : data.subscriptions ?? [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchSubs()
  }, [client.id])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: 420 }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#2C6E3F,#4CAF50)', padding: 28, borderRadius: '14px 14px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: 'white' }}>
            <X size={16} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', border: '3px solid rgba(255,255,255,0.4)' }}>
              {getInitials(client.firstName, client.lastName)}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'Syne,sans-serif' }}>
                {client.firstName} {client.lastName}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{client.email}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>

            {/* Email */}
            <div style={{ background: 'var(--bg-main)', borderRadius: 8, padding: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={16} color="#2C6E3F" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Email</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{client.email}</div>
              </div>
            </div>

            {/* Joined */}
            <div style={{ background: 'var(--bg-main)', borderRadius: 8, padding: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Calendar size={16} color="#2C6E3F" />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Member Since</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{fmtDate(client.createdAt)}</div>
              </div>
            </div>

            {/* Subscriptions */}
            <div style={{ background: 'var(--bg-main)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <CreditCard size={16} color="#2C6E3F" />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Subscriptions</div>
              </div>

              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
                  <Loader size={18} className="spin" style={{ color: '#2C6E3F' }} />
                </div>
              ) : error ? (
                <div style={{ fontSize: 13, color: '#EF4444' }}>{error}</div>
              ) : subs.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No subscriptions found</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {subs.map(sub => (
                    <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {sub.offer?.name ?? `Subscription #${sub.id.slice(0, 6)}`}                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                       <span>{fmtDate(sub.startDate)} → {fmtDate(sub.endDate)}</span>
{sub.offer?.type && <span style={{ background: '#6B728018', color: '#6B7280', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{sub.offer.type}</span>}
{sub.nutrition && <span>· {sub.nutrition.firstName} {sub.nutrition.lastName}</span>}
                        </div>
                      </div>
                      <SubBadge s={sub.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main ── */
const Clients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState('')
  const [view,    setView]    = useState(null)

  useEffect(() => { fetchClients() }, [])

  const fetchClients = async () => {
    setLoading(true); setError(null)
    try {
      const res = await apiFetch('/clients')
      if (!res.ok) throw new Error('Failed to load clients')
      const data = await res.json()
      setClients(Array.isArray(data) ? data : data.clients ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return
    try {
      const res = await apiFetch(`/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setClients(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const filtered = clients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Loader size={28} className="spin" style={{ color: '#2C6E3F' }} />
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
      <p style={{ marginBottom: 12 }}>⚠️ {error}</p>
      <button className="btn-primary" onClick={fetchClients}>Retry</button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Client Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{clients.length} client{clients.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn-secondary" onClick={fetchClients}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div className="search-box" style={{ width: 300 }}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>CLIENT INFO</th>
              <th>JOINED DATE</th>
              <th>PROFILE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No clients found</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                      {getInitials(c.firstName, c.lastName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{c.firstName} {c.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmtDate(c.createdAt)}</td>
                <td>
                  {c.profile ? (
                    <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Complete</span>
                  ) : (
                    <span style={{ background: '#FEF3C7', color: '#D97706', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Incomplete</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="icon-btn" onClick={() => setView(c)} title="View Profile"><Eye size={14} /></button>
                    <button className="icon-btn danger" onClick={() => handleDelete(c.id)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-footer">Showing {filtered.length} of {clients.length} clients</div>
      </div>

      {view && <ProfileModal client={view} onClose={() => setView(null)} />}
    </div>
  )
}

export default Clients
