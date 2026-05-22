import React, { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Activity, DollarSign, RefreshCw } from 'lucide-react'
import { UserChart, DonutChart } from './Charts/UserChart'

const BASE_URL = 'http://localhost:5000'
const api = (path) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include' }).then(r => r.json())

const fmtDate = iso => iso ? new Date(iso).toLocaleDateString() : '—'

const StatusBadge = ({ s }) => {
  const map = {
    ACTIVE:    { bg: '#EAF3DE', color: '#3B6D11' },
    PENDING:   { bg: '#EEEDFE', color: '#3C3489' },
    EXPIRED:   { bg: '#FCEBEB', color: '#A32D2D' },
    CANCELLED: { bg: '#F3F4F6', color: '#6B7280' },
  }
  const { bg, color } = map[s] ?? map.CANCELLED
  return (
    <span style={{ background: bg, color, padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
      {s}
    </span>
  )
}

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60, gap: 6 }}>
    {[0, 150, 300].map(d => (
      <div key={d} style={{
        width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)',
        animation: 'bounce 1.2s infinite', animationDelay: `${d}ms`
      }} />
    ))}
    <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>
  </div>
)

const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
    </div>
    {loading
      ? <Spinner />
      : <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Syne,sans-serif', color }}>{value}</div>
    }
  </div>
)

const TYPE_META = {
  PLAN:        { accent: '#1D9E75', bg: '#E1F5EE', label: 'Plan' },
  PACKAGE:     { accent: '#378ADD', bg: '#E6F1FB', label: 'Package' },
  AI_CALORIES: { accent: '#7F77DD', bg: '#EEEDFE', label: 'AI Calories' },
}

const Dashboard = () => {
  const [loading,   setLoading]   = useState(true)
  const [subs,      setSubs]      = useState([])
  const [clients,   setClients]   = useState([])
  const [nuts,      setNuts]      = useState([])
  const [inquiries, setInquiries] = useState([])
  const [offers,    setOffers]    = useState([])
  const [updatedAt, setUpdatedAt] = useState(null)
  const [error,     setError]     = useState(null)
  const [range,     setRange]     = useState('Last 7 Days')

  const loadAll = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [subsRes, clientsRes, nutsRes, inqRes, offersRes] = await Promise.allSettled([
        api('/subscriptions/all'),
        api('/clients'),
        api('/nutritionists'),
        api('/inquiries'),
        api('/offers'),
      ])

      setSubs(subsRes.status === 'fulfilled'
        ? (subsRes.value.subscriptions ?? []) : [])

      setClients(clientsRes.status === 'fulfilled'
        ? (Array.isArray(clientsRes.value) ? clientsRes.value : (clientsRes.value.users ?? clientsRes.value.clients ?? []))
        : [])

      setNuts(nutsRes.status === 'fulfilled'
        ? (Array.isArray(nutsRes.value) ? nutsRes.value : (nutsRes.value.users ?? nutsRes.value.nutritionists ?? []))
        : [])

      setInquiries(inqRes.status === 'fulfilled'
        ? (inqRes.value.inquiries ?? []) : [])

      setOffers(offersRes.status === 'fulfilled'
        ? (Array.isArray(offersRes.value) ? offersRes.value : (offersRes.value.offers ?? []))
        : [])

      setUpdatedAt(new Date())
    } catch {
      setError('Failed to load data. Check API connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  /* ── Derived ── */
  const activeCount = subs.filter(s => s.status === 'ACTIVE').length
  const totalRev    = subs.reduce((acc, s) =>
    acc + (s.payments ?? []).filter(p => p.status === 'SUCCESS').reduce((sum, p) => sum + (p.amount ?? 0), 0)
  , 0)

  /* Filter subs for line chart based on range selector */
  const filteredSubs = (() => {
    const days = range === 'Last 7 Days' ? 7 : range === 'Last 30 Days' ? 30 : 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return subs.filter(s => s.startDate && new Date(s.startDate) >= cutoff)
  })()

  /* Revenue by offer type — seeds ALL offers first so 0-revenue ones still appear */
  const revenueByType = ['PLAN', 'PACKAGE', 'AI_CALORIES'].map(type => {
    const typeOffers = offers.filter(o => o.type === type)
    const typeSubs   = subs.filter(s => s.offer?.type === type)

    const offerMap = {}

    // seed every offer with 0
    typeOffers.forEach(o => {
      offerMap[o.id] = { name: o.name, revenue: 0, count: 0 }
    })

    // overlay real subscription data
    typeSubs.forEach(s => {
      const key = s.offer?.id
      if (!key) return
      if (!offerMap[key]) offerMap[key] = { name: s.offer?.name ?? 'Unknown', revenue: 0, count: 0 }
      const paid = (s.payments ?? [])
        .filter(p => p.status === 'SUCCESS')
        .reduce((acc, p) => acc + (p.amount ?? 0), 0)
      offerMap[key].revenue += paid
      offerMap[key].count   += 1
    })

    const offersList  = Object.values(offerMap)
    const typeRevenue = offersList.reduce((acc, o) => acc + o.revenue, 0)
    return { type, typeSubs, offers: offersList, typeRevenue, ...TYPE_META[type] }
  })

  const recentSubs = subs.slice(0, 6)
  const recentInqs = inquiries.slice(0, 5)

  return (
    <div>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {loading ? 'Loading live data…' : updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : ''}
          </p>
        </div>
        <button className="btn-secondary" onClick={loadAll} disabled={loading}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total clients"        value={clients.length}                     icon={Users}      color="#1D9E75" loading={loading} />
        <StatCard label="Nutritionists"         value={nuts.length}                        icon={UserPlus}   color="#378ADD" loading={loading} />
        <StatCard label="Active subscriptions" value={activeCount}                        icon={Activity}   color="#BA7517" loading={loading} />
        <StatCard label="Total revenue"        value={`SAR ${totalRev.toLocaleString()}`} icon={DollarSign} color="#A32D2D" loading={loading} />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, marginBottom: 20 }}>

        {/* Line Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              New Subscriptions — {range}
            </h3>
            <select
              value={range}
              onChange={e => setRange(e.target.value)}
              style={{
                fontSize: 12, border: '1px solid var(--border)', borderRadius: 6,
                padding: '4px 10px', color: 'var(--text-secondary)',
                background: 'var(--bg-card)', cursor: 'pointer'
              }}
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          {loading ? <Spinner /> : <UserChart subs={filteredSubs} range={range} />}
        </div>

        {/* Donut Chart */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Status Distribution
          </h3>
          {loading ? <Spinner /> : <DonutChart subs={subs} />}
        </div>
      </div>

      {/* ── Inquiries + Breakdown Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>

        {/* Recent Inquiries */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Recent Inquiries</h3>
          {loading ? <Spinner /> : recentInqs.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No inquiries yet</p>
            : recentInqs.map((inq, i) => {
              const initials = (inq.name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <div key={inq.id ?? i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 0', borderBottom: i < recentInqs.length - 1 ? '1px solid var(--border-light)' : 'none'
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', background: '#E6F1FB',
                      color: '#185FA5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600, flexShrink: 0
                    }}>{initials}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {inq.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>
                        {(inq.message ?? '').slice(0, 50)}{inq.message?.length > 50 ? '…' : ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    {!inq.resolved && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E24B4A' }} />}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(inq.createdAt)}</span>
                  </div>
                </div>
              )
            })
          }
        </div>

        {/* Subscription Breakdown bars */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>Subscription Breakdown</h3>
          {loading ? <Spinner /> : (() => {
            const statuses     = ['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']
            const statusColors = { ACTIVE: '#639922', PENDING: '#7F77DD', EXPIRED: '#E24B4A', CANCELLED: '#888780' }
            const counts       = Object.fromEntries(statuses.map(s => [s, subs.filter(x => x.status === s).length]))
            const max          = Math.max(...Object.values(counts), 1)
            return (
              <>
                {statuses.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 80, flexShrink: 0 }}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </span>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.round((counts[s] / max) * 100)}%`,
                        height: '100%', background: statusColors[s], borderRadius: 3,
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 20, textAlign: 'right' }}>{counts[s]}</span>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Total: {subs.length} subscriptions</p>
              </>
            )
          })()}
        </div>
      </div>

      {/* ── Latest Subscriptions Table ── */}
      <div className="table-container" style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Latest Subscriptions</h3>
        </div>
        {loading ? <Spinner /> : (
          <table>
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>OFFER</th>
                <th>NUTRITIONIST</th>
                <th>START</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentSubs.length === 0
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No subscriptions yet</td></tr>
                : recentSubs.map(s => {
                  const paid = (s.payments ?? [])
                    .filter(p => p.status === 'SUCCESS')
                    .reduce((acc, p) => acc + (p.amount ?? 0), 0)
                  return (
                    <tr key={s.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                          {s.patient?.firstName} {s.patient?.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.patient?.email}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.offer?.name ?? '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {s.nutrition ? `${s.nutrition.firstName} ${s.nutrition.lastName}` : '—'}
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtDate(s.startDate)}</td>
                      <td style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                        {paid > 0 ? `SAR ${paid.toLocaleString()}` : '—'}
                      </td>
                      <td><StatusBadge s={s.status} /></td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        )}
        {!loading && subs.length > 6 && (
          <div className="table-footer">Showing 6 of {subs.length} — view all in the Subscriptions tab</div>
        )}
      </div>

      {/* ── Revenue Summary by Offer Type ── */}
      {!loading && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>
            Revenue Summary by Offer
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {revenueByType.map(({ type, typeSubs, offers: offersList, typeRevenue, accent, bg, label }) => (
              <div key={type} className="card" style={{ padding: 20 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ background: bg, color: accent, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: accent }}>
                    SAR {typeRevenue.toLocaleString()}
                  </span>
                </div>

                {offersList.length === 0
                  ? <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No offers yet</p>
                  : offersList.map((o, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '9px 0',
                      borderBottom: i < offersList.length - 1 ? '1px solid var(--border-light)' : 'none'
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{o.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {o.count} subscription{o.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: o.revenue > 0 ? accent : 'var(--text-muted)' }}>
                        {o.revenue > 0 ? `SAR ${o.revenue.toLocaleString()}` : '—'}
                      </div>
                    </div>
                  ))
                }

                <div style={{
                  marginTop: 12, paddingTop: 10,
                  borderTop: '1px solid var(--border-light)',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{typeSubs.length} total</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {typeSubs.filter(s => s.status === 'ACTIVE').length} active
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard