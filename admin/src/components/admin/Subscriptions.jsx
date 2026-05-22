import React, { useState, useEffect } from 'react'
import { DollarSign, Activity, Calendar, TrendingUp, Trash2, Loader, RefreshCw } from 'lucide-react'

const BASE_URL = 'https://chrysalise-server.onrender.com'

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include', ...opts })

const fmtDate = iso => iso ? new Date(iso).toISOString().split('T')[0] : '—'

const Badge = ({ s }) => {
  const m = {
    ACTIVE:    ['#DCFCE7', '#16A34A'],
    PENDING:   ['#EDE9FE', '#7C3AED'],
    EXPIRED:   ['#FEE2E2', '#DC2626'],
    CANCELLED: ['#F3F4F6', '#6B7280'],
  }
  const [bg, c] = m[s] ?? ['#F3F4F6', '#6B7280']
  return <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
}

const Subscriptions = () => {
  const [subs,    setSubs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [filter,  setFilter]  = useState('All')

  useEffect(() => { fetchSubs() }, [])

  const fetchSubs = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await apiFetch('/subscriptions/all')
      if (!res.ok) throw new Error('Failed to load subscriptions')
      const data = await res.json()
      setSubs(data.subscriptions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return
    try {
      const res = await apiFetch(`/subscriptions/${id}/cancel`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to cancel')
      const data = await res.json()
      setSubs(prev => prev.map(s => s.id === id ? data.subscription : s))
    } catch (err) {
      alert(err.message)
    }
  }

  // derived stats
  const active    = subs.filter(s => s.status === 'ACTIVE')
  const expired   = subs.filter(s => s.status === 'EXPIRED')
  const pending   = subs.filter(s => s.status === 'PENDING')
  const cancelled = subs.filter(s => s.status === 'CANCELLED')

  // total revenue from completed payments only
  const totalRev = subs.reduce((acc, s) => {
    const paid = (s.payments ?? [])
      .filter(p => p.status === 'SUCCESS')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0)
    return acc + paid
  }, 0)

  const CARDS = [
    { l: 'Total Revenue', v: `SAR ${totalRev.toLocaleString()}`, icon: DollarSign, c: '#2C6E3F' },
    { l: 'Active',        v: String(active.length),              icon: Activity,   c: '#3B82F6' },
    { l: 'Expired',       v: String(expired.length),             icon: Calendar,   c: '#EF4444' },
    { l: 'Pending',       v: String(pending.length),             icon: TrendingUp, c: '#F59E0B' },
  ]

  const filtered =
    filter === 'All'       ? subs :
    filter === 'ACTIVE'    ? active :
    filter === 'EXPIRED'   ? expired :
    filter === 'PENDING'   ? pending :
    filter === 'CANCELLED' ? cancelled :
    subs

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Loader size={28} className="spin" style={{ color: '#2C6E3F' }} />
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
      <p style={{ marginBottom: 12 }}>⚠️ {error}</p>
      <button className="btn-primary" onClick={fetchSubs}>Retry</button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Subscriptions & Payments</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Monitor plans and track revenue</p>
        </div>
        <button className="btn-secondary" onClick={fetchSubs}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.l} className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: card.c + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={card.c} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{card.l}</div>
                <div style={{ fontSize: card.l === 'Total Revenue' ? 16 : 22, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: card.l === 'Total Revenue' ? '#2C6E3F' : 'var(--text-primary)' }}>{card.v}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['All', 'ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>CLIENT</th>
              <th>OFFER</th>
              <th>NUTRITIONIST</th>
              <th>START</th>
              <th>END</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No subscriptions found</td></tr>
            ) : filtered.map(s => {
              const paid = (s.payments ?? [])
                .filter(p => p.status === 'SUCCESS')
                .reduce((sum, p) => sum + (p.amount ?? 0), 0)

              return (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                      {s.patient?.firstName} {s.patient?.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.patient?.email}</div>
                  </td>
                  <td>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.offer?.name ?? '—'}</div>
                    {s.offer?.type && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.offer.type}</div>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {s.nutrition ? `${s.nutrition.firstName} ${s.nutrition.lastName}` : '—'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmtDate(s.startDate)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmtDate(s.endDate)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {paid > 0 ? `SAR ${paid.toLocaleString()}` : '—'}
                  </td>
                  <td><Badge s={s.status} /></td>
                  <td>
                    {s.status !== 'CANCELLED' && s.status !== 'EXPIRED' && (
                      <button
                        className="icon-btn danger"
                        onClick={() => handleCancel(s.id)}
                        title="Cancel Subscription"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="table-footer">Showing {filtered.length} of {subs.length} subscriptions</div>
      </div>
    </div>
  )
}

export default Subscriptions
