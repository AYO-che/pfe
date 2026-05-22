import React, { useState, useEffect, useRef } from 'react'
import { CheckCheck, Send, X, MessageSquare, Clock, CheckCircle, Loader } from 'lucide-react'

const BASE_URL = 'http://localhost:5000'
const COLORS   = ['#2C6E3F', '#2196F3', '#FF9800', '#EF4444']
const QUICK = [
  'Thank you for contacting us. We are looking into your issue.',
  'Your issue has been resolved. Please check your account.',
  'We have escalated this to our technical team.',
  'Please try again and contact us if the problem persists.',
]

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

const fmtDate = iso => new Date(iso).toLocaleString('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
})

/* ── Reply Modal — now shows conversation as chat ── */
const ReplyModal = ({ inq, onClose, onReply }) => {
  const [text, setText]     = useState('')
  const [saving, setSaving] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const send = async () => {
    if (!text.trim()) return
    setSaving(true)
    await onReply(inq.id, text.trim())
    setSaving(false)
    onClose()
  }

  // build chat timeline
  const timeline = [
    { from: 'user', text: inq.message, time: inq.createdAt },
    ...(inq.adminReply ? [{ from: 'admin', text: inq.adminReply, time: inq.updatedAt }] : []),
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          height: '85vh', maxHeight: 700,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
      >
        {/* HEADER */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--bg-main)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: '#2C6E3F20', color: '#2C6E3F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>
            {getInitials(inq.name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{inq.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inq.email}</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
            background: inq.resolved ? '#2C6E3F20' : '#F59E0B20',
            color: inq.resolved ? '#2C6E3F' : '#D97706',
            border: `1px solid ${inq.resolved ? '#2C6E3F40' : '#F59E0B40'}`,
          }}>
            {inq.resolved ? '✓ resolved' : '⏳ pending'}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* CONVERSATION */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: 14,
          background: 'var(--bg-main)',
        }}>
          {timeline.map((msg, i) => {
            const isAdmin = msg.from === 'admin'
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isAdmin ? 'flex-end' : 'flex-start', gap: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '0 4px' }}>
                  {isAdmin ? 'You (Admin)' : inq.name} · {fmtDate(msg.time)}
                </div>
                <div style={{
                  maxWidth: '80%', padding: '11px 15px', borderRadius: 18,
                  fontSize: 13.5, lineHeight: 1.55, wordBreak: 'break-word',
                  background: isAdmin ? '#2C6E3F' : 'var(--bg-card)',
                  color: isAdmin ? '#fff' : 'var(--text-primary)',
                  borderBottomRightRadius: isAdmin ? 4 : 18,
                  borderBottomLeftRadius: isAdmin ? 18 : 4,
                  border: isAdmin ? 'none' : '1px solid var(--border)',
                  boxShadow: isAdmin
                    ? '0 4px 12px rgba(44,110,63,0.25)'
                    : '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  {msg.text}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* QUICK REPLIES DRAWER */}
        {showQuick && (
          <div style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-main)',
            padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: 180, overflowY: 'auto',
          }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
              Quick Replies
            </div>
            {QUICK.map((q, i) => (
              <button key={i}
                onClick={() => { setText(q); setShowQuick(false); }}
                style={{
                  textAlign: 'left', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  padding: '8px 12px', fontSize: 12.5,
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2C6E3F'; e.currentTarget.style.color = '#2C6E3F' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >{q}</button>
            ))}
          </div>
        )}

        {/* INPUT */}
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: '1.5px solid var(--border)', borderRadius: 12,
              padding: '10px 14px', fontSize: 13.5,
              background: 'var(--bg-main)', color: 'var(--text-primary)',
              resize: 'none', outline: 'none',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
            onFocus={e => e.target.style.borderColor = '#2C6E3F'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setShowQuick(v => !v)}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', fontSize: 12,
                color: 'var(--text-muted)', cursor: 'pointer',
              }}
            >
              ⚡ Quick replies
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 8, padding: '7px 16px', fontSize: 13,
                color: 'var(--text-secondary)', cursor: 'pointer',
              }}>Cancel</button>
              <button
                onClick={send}
                disabled={!text.trim() || saving}
                style={{
                  background: '#2C6E3F', border: 'none',
                  borderRadius: 8, padding: '7px 18px', fontSize: 13,
                  color: '#fff', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  opacity: (!text.trim() || saving) ? 0.55 : 1,
                }}
              >
                {saving ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={13} />}
                {saving ? 'Sending…' : 'Send & Resolve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main ── */
const Inquiries = () => {
  const [inquiries, setInquiries] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [filter,    setFilter]    = useState('All')
  const [target,    setTarget]    = useState(null)

  useEffect(() => { fetchInquiries() }, [])

  const fetchInquiries = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${BASE_URL}/inquiries`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load inquiries')
      const data = await res.json()
      setInquiries(data.inquiries)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (id, adminReply) => {
    try {
      const res = await fetch(`${BASE_URL}/inquiries/${id}/resolve`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply }),
      })
      if (!res.ok) throw new Error('Failed to resolve inquiry')
      const { inquiry } = await res.json()
      setInquiries(prev => prev.map(i => i.id === id ? inquiry : i))
    } catch (err) {
      alert(err.message)
    }
  }

  const pending  = inquiries.filter(i => !i.resolved).length
  const resolved = inquiries.filter(i =>  i.resolved).length
  const filtered =
    filter === 'Pending'  ? inquiries.filter(i => !i.resolved) :
    filter === 'Resolved' ? inquiries.filter(i =>  i.resolved) :
    inquiries

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Loader size={28} style={{ color: '#2C6E3F', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
      <p style={{ marginBottom: 12 }}>⚠️ {error}</p>
      <button className="btn-primary" onClick={fetchInquiries}>Retry</button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Inquiries</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{pending} unresolved messages</p>
        </div>
        <button onClick={fetchInquiries} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <CheckCheck size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Total',    v: inquiries.length, icon: MessageSquare, c: '#6B7280' },
          { l: 'Pending',  v: pending,           icon: Clock,        c: '#F59E0B' },
          { l: 'Resolved', v: resolved,          icon: CheckCircle,  c: '#2C6E3F' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.l} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.c + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} color={s.c} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: 'var(--text-primary)' }}>{s.v}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.l}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['All', 'Pending', 'Resolved'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((inq, i) => (
          <div key={inq.id}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${!inq.resolved ? '#2C6E3F40' : 'var(--border)'}`,
              borderRadius: 12, padding: '18px 20px',
              boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: COLORS[i % COLORS.length] + '20',
                color: COLORS[i % COLORS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>
                {getInitials(inq.name)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{inq.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {inq.email}</span>
                    {!inq.resolved && !inq.adminReply && (
                      <span style={{ background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>NEW</span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: inq.resolved ? '#2C6E3F20' : '#F59E0B20',
                      color: inq.resolved ? '#2C6E3F' : '#D97706',
                      border: `1px solid ${inq.resolved ? '#2C6E3F40' : '#F59E0B40'}`,
                    }}>
                      {inq.resolved ? '✓ resolved' : '⏳ pending'}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {fmtDate(inq.createdAt)}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
                  {inq.message}
                </div>

                {inq.adminReply && (
                  <div style={{
                    background: '#2C6E3F08', border: '1px solid #2C6E3F25',
                    borderRadius: 8, padding: '10px 12px', marginBottom: 10,
                  }}>
                    <div style={{ fontSize: 11, color: '#2C6E3F', fontWeight: 600, marginBottom: 4 }}>Your reply</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inq.adminReply}</div>
                  </div>
                )}

                <button
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  onClick={() => setTarget(inq)}
                >
                  <Send size={12} />
                  {inq.resolved ? 'View / Update' : inq.adminReply ? 'Update Reply' : 'Reply & Resolve'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
            <div>No inquiries in this category</div>
          </div>
        )}
      </div>

      {target && <ReplyModal inq={target} onClose={() => setTarget(null)} onReply={handleReply} />}
    </div>
  )
}

export default Inquiries