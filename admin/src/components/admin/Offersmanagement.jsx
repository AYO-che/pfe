import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, RefreshCw, ChevronDown } from 'lucide-react'

const BASE_URL = 'http://localhost:5000'
const api = (path, opts) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include', ...opts })

// ── Types & constants ────────────────────────────────────────────────────────

const OFFER_TYPES = ['AI_CALORIES', 'PACKAGE']

const TYPE_META = {
  PLAN:        { bg: '#EAF3DE', color: '#3B6D11', label: 'Plan' },
  PACKAGE:     { bg: '#E6F1FB', color: '#185FA5', label: 'Package' },
  AI_CALORIES: { bg: '#EEEDFE', color: '#3C3489', label: 'AI Calories' },
}

const EMPTY_FORM = {
  name: '', type: '', description: '',
  price: '', durationDays: '',
  hasFreeTrial: false,
  sessionsCount: '', chatDays: '',
}

// ── Small UI helpers ─────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60, gap: 6 }}>
    {[0, 150, 300].map(d => (
      <div key={d} style={{
        width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)',
        animation: 'bounce 1.2s infinite', animationDelay: `${d}ms`,
      }} />
    ))}
  </div>
)

const Badge = ({ type }) => {
  const m = TYPE_META[type] ?? { bg: '#F1EFE8', color: '#5F5E5A', label: type }
  return (
    <span style={{
      background: m.bg, color: m.color,
      padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    }}>
      {m.label}
    </span>
  )
}

const StatusPill = ({ active }) => (
  <span style={{
    background: active ? '#EAF3DE' : '#F3F4F6',
    color: active ? '#3B6D11' : '#6B7280',
    padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
  }}>
    {active ? 'Active' : 'Inactive'}
  </span>
)

const Toggle = ({ checked, onChange }) => (
  <label style={{ position: 'relative', display: 'inline-block', width: 36, height: 20, cursor: 'pointer', flexShrink: 0 }}>
    <input
      type="checkbox" checked={checked} onChange={onChange}
      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
    />
    <span style={{
      position: 'absolute', inset: 0, borderRadius: 20,
      background: checked ? '#1D9E75' : '#B4B2A9',
      transition: '0.2s',
    }}>
      <span style={{
        position: 'absolute', width: 14, height: 14,
        left: checked ? 19 : 3, top: 3,
        background: '#fff', borderRadius: '50%', transition: '0.2s',
      }} />
    </span>
  </label>
)

const Toast = ({ msg, type, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: type === 'success' ? '#EAF3DE' : '#FCEBEB',
      color: type === 'success' ? '#3B6D11' : '#A32D2D',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
      marginBottom: 16,
    }}>
      {type === 'success' ? '✓' : '⚠'} {msg}
    </div>
  )
}

// ── StatCard (matches Dashboard) ─────────────────────────────────────────────

const StatCard = ({ label, value, color = 'var(--text-primary)', loading }) => (
  <div className="card" style={{ padding: 18 }}>
    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
    {loading
      ? <Spinner />
      : <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Syne,sans-serif', color, marginTop: 8 }}>{value}</div>
    }
  </div>
)

// ── Form field wrapper ────────────────────────────────────────────────────────

const Field = ({ label, children, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}`, display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</label>
    {children}
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────

export default function OffersManagement() {
  const [offers,    setOffers]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [toast,     setToast]     = useState(null)   // { msg, type }
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [filterType,   setFilterType]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadOffers = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await api('/offers')
      const d = await r.json()
      setOffers(Array.isArray(d) ? d : (d.offers ?? []))
      setOffers(Array.isArray(d) ? d.filter(o => o.type !== 'PLAN') : (d.offers ?? []).filter(o => o.type !== 'PLAN'))

      setUpdatedAt(new Date())
    } catch {
      setError('Failed to load offers. Check API connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadOffers() }, [loadOffers])

  // ── Derived ───────────────────────────────────────────────────────────────

 const filtered = offers.filter(o => {
  if (o.type === 'PLAN')                           return false
  if (filterType   && o.type     !== filterType)  return false
  if (filterStatus === 'active'   && !o.isActive)  return false
  if (filterStatus === 'inactive' && o.isActive)   return false
  return true
})

  const activeCount = offers.filter(o => o.isActive).length

  // ── Handlers ──────────────────────────────────────────────────────────────

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  const handleFormChange = (k, v) =>
    setForm(p => ({ ...p, [k]: v }))

  const resetForm = () => { setForm(EMPTY_FORM); setFormError(null) }

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    const payload = {
      name:         form.name.trim(),
      type:         form.type,
      description:  form.description.trim() || undefined,
      price:        parseFloat(form.price),
      durationDays: parseInt(form.durationDays),
      hasFreeTrial: form.hasFreeTrial,
    }

    if (form.type === 'PACKAGE') {
      if (!form.sessionsCount || parseInt(form.sessionsCount) < 1) {
        setFormError('Sessions count must be at least 1 for Package offers.')
        setSubmitting(false); return
      }
      payload.sessionsCount = parseInt(form.sessionsCount)
      payload.chatDays      = parseInt(form.chatDays || '0')
    }

    try {
      const r = await api('/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message ?? 'Failed to create offer')

      setOffers(prev => [d.offer, ...prev])
      resetForm()
      showToast(`"${d.offer.name}" created successfully`)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id, val) => {
    // Optimistic
    setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: val } : o))
    try {
      const r = await api(`/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: val }),
      })
      if (!r.ok) throw new Error()
      showToast(`Offer ${val ? 'activated' : 'deactivated'}`)
    } catch {
      // Rollback
      setOffers(prev => prev.map(o => o.id === id ? { ...o, isActive: !val } : o))
      showToast('Failed to update offer', 'error')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      const r = await api(`/offers/${id}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message ?? 'Delete failed')
      setOffers(prev => prev.filter(o => o.id !== id))
      showToast(`"${name}" deleted`)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Offer management</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {loading ? 'Loading…' : updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : ''}
          </p>
        </div>
        <button className="btn-secondary" onClick={loadOffers} disabled={loading}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
        <StatCard label="Total offers"  value={offers.length}  loading={loading} />
        <StatCard label="Active offers" value={activeCount}    color="#1D9E75" loading={loading} />
        <StatCard label="Offer types"   value={OFFER_TYPES.length} color="#378ADD" loading={loading} />
      </div>

      {/* ── Table ── */}
      <div className="table-container" style={{ marginBottom: 24 }}>
        <div style={{
          padding: '16px 20px 10px', borderBottom: '1px solid var(--border-light)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>All offers</h3>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Type filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={filterType} onChange={e => setFilterType(e.target.value)}
                style={{ fontSize: 12, padding: '5px 28px 5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', appearance: 'none' }}
              >
                <option value="">All types</option>
                {OFFER_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>

            {/* Status filter */}
            <div style={{ position: 'relative' }}>
              <select
                value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ fontSize: 12, padding: '5px 28px 5px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', appearance: 'none' }}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {loading ? <Spinner /> : error ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#A32D2D', fontSize: 13 }}>⚠️ {error}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Package details</th>
                <th>Free trial</th>
                <th>Status</th>
                <th>Active</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                    No offers match the current filter.
                  </td>
                </tr>
              ) : filtered.map(offer => (
                <tr key={offer.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{offer.name}</div>
                    {offer.description && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {offer.description.slice(0, 50)}{offer.description.length > 50 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td><Badge type={offer.type} /></td>
                  <td style={{ fontWeight: 600 }}>
                    {offer.price === 0
                      ? <span style={{ color: 'var(--text-muted)' }}>Free</span>
                      : `SAR ${Number(offer.price).toFixed(2)}`}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{offer.durationDays}d</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {offer.type === 'PACKAGE'
                      ? `${offer.sessionsCount} session${offer.sessionsCount !== 1 ? 's' : ''} · ${offer.chatDays}d chat`
                      : '—'}
                  </td>
                  <td>
                    {offer.hasFreeTrial
                      ? <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Yes</span>
                      : <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No</span>}
                  </td>
                  <td><StatusPill active={offer.isActive} /></td>
                  <td>
                    <Toggle
                      checked={offer.isActive}
                      onChange={e => handleToggleActive(offer.id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(offer.id, offer.name)}
                      style={{
                        background: 'none', border: '1px solid var(--border-light)',
                        borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
                        color: '#A32D2D', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12,
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && offers.length > 0 && (
          <div className="table-footer">
            Showing {filtered.length} of {offers.length} offers
          </div>
        )}
      </div>

      {/* ── Create form ── */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 18 }}>
          Create new offer
        </h3>

        {formError && (
          <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 14 }}>

            <Field label="Offer name *">
              <input
                value={form.name} onChange={e => handleFormChange('name', e.target.value)}
                placeholder="e.g. Pro Plan" required
                style={inputStyle}
              />
            </Field>

            <Field label="Offer type *">
              <select
                value={form.type} onChange={e => handleFormChange('type', e.target.value)}
                required style={inputStyle}
              >
                <option value="">Select type…</option>
                {OFFER_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>)}
              </select>
            </Field>

          </div>

          <Field label="Description" span={2}>
            <textarea
              value={form.description} onChange={e => handleFormChange('description', e.target.value)}
              placeholder="Short description shown to users…"
              rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, margin: '14px 0' }}>

            <Field label="Price (SAR) *">
              <input
                type="number" min="0" step="0.01"
                value={form.price} onChange={e => handleFormChange('price', e.target.value)}
                placeholder="0.00" required style={inputStyle}
              />
            </Field>

            <Field label="Duration (days) *">
              <input
                type="number" min="1"
                value={form.durationDays} onChange={e => handleFormChange('durationDays', e.target.value)}
                placeholder="e.g. 30" required style={inputStyle}
              />
            </Field>

            <Field label="Free trial">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 36 }}>
                <Toggle
                  checked={form.hasFreeTrial}
                  onChange={e => handleFormChange('hasFreeTrial', e.target.checked)}
                />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {form.hasFreeTrial ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </Field>

          </div>

          {/* Package-only fields */}
          {form.type === 'PACKAGE' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14, marginBottom: 14 }}>
              <Field label="Sessions count *">
                <input
                  type="number" min="1"
                  value={form.sessionsCount} onChange={e => handleFormChange('sessionsCount', e.target.value)}
                  placeholder="e.g. 2" required style={inputStyle}
                />
              </Field>
              <Field label="Chat access (days)">
                <input
                  type="number" min="0"
                  value={form.chatDays} onChange={e => handleFormChange('chatDays', e.target.value)}
                  placeholder="e.g. 30" style={inputStyle}
                />
              </Field>
            </div>
          )}

          {/* Type hint */}
          {form.type === 'AI_CALORIES' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              AI_CALORIES offers are platform-wide. Free plans don't require Stripe.
            </p>
          )}
          {form.type === 'PACKAGE' && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Package offers require the nutritionist to have Stripe connected before creating.
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="submit" disabled={submitting}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#1D9E75', color: '#fff', border: 'none',
                borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <Plus size={14} />
              {submitting ? 'Creating…' : 'Create offer'}
            </button>
            <button
              type="button" onClick={resetForm}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', fontSize: 13,
  padding: '7px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
}