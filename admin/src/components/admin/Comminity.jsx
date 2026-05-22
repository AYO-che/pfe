import React, { useState, useEffect } from 'react'
import { Trash2, X, Loader, RefreshCw, Eye } from 'lucide-react'

const BASE_URL = 'http://localhost:5000'

const STATUS_COLORS = {
  APPROVED: ['#DCFCE7', '#16A34A'],
  PENDING:  ['#FEF3C7', '#D97706'],
  REJECTED: ['#FEE2E2', '#DC2626'],
}

const TYPE_COLORS = {
  RECIPE:       ['#EDE9FE', '#7C3AED'],
  EXPERIENCE:   ['#E0F2FE', '#0369A1'],
  BEFORE_AFTER: ['#FEF3C7', '#D97706'],
}

const fmtDate  = iso => iso ? new Date(iso).toISOString().split('T')[0] : '—'
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include', ...opts })

const getInitials = (f = '', l = '') => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()

/* ── View Modal ── */
const ViewModal = ({ post, onClose }) => {
  if (!post) return null
  const [bg, c] = STATUS_COLORS[post.status] ?? ['#F3F4F6', '#6B7280']
  const [tbg, tc] = TYPE_COLORS[post.type] ?? ['#F3F4F6', '#6B7280']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: 560, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
          <h3 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Post Details</h3>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>
        <div style={{ padding: 24 }}>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2C6E3F20', color: '#2C6E3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
              {getInitials(post.author?.firstName, post.author?.lastName)}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                {post.author?.firstName} {post.author?.lastName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(post.createdAt)}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <span style={{ background: tbg, color: tc, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{post.type}</span>
              <span style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{post.status}</span>
            </div>
          </div>

          {/* Title */}
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{post.title}</div>

          {/* Images */}
          {post.images?.length > 0 && (
            <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {post.images.map((img, i) => (
                <img key={i} src={img} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 10 }} />
              ))}
            </div>
          )}

          {/* Content */}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main ── */
const CommunityPosts = () => {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('All')
  const [viewing, setViewing] = useState(null)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await apiFetch('/community/all')
      if (!res.ok) throw new Error('Failed to load posts')
      const data = await res.json()
      setPosts(data.posts)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (post) => {
    const next = post.status === 'PENDING'  ? 'APPROVED'
               : post.status === 'APPROVED' ? 'REJECTED'
               : 'APPROVED'
    try {
      const res  = await apiFetch(`/community/${post.id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update status')
      setPosts(prev => prev.map(p => p.id === post.id ? data.post : p))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return
    try {
      const res = await apiFetch(`/community/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const tabs     = ['All', 'PENDING', 'APPROVED', 'REJECTED']
  const filtered = tab === 'All' ? posts : posts.filter(p => p.status === tab)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <Loader size={28} className="spin" style={{ color: '#2C6E3F' }} />
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
      <p style={{ marginBottom: 12 }}>⚠️ {error}</p>
      <button className="btn-primary" onClick={fetchPosts}>Retry</button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Community Posts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Review and moderate client posts</p>
        </div>
        <button className="btn-secondary" onClick={fetchPosts}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="table-container">
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {tabs.map(t => {
            const count = t === 'All' ? posts.length : posts.filter(p => p.status === t).length
            return (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 16px', border: 'none', background: 'transparent', borderBottom: `2px solid ${tab === t ? '#2C6E3F' : 'transparent'}`, color: tab === t ? '#2C6E3F' : 'var(--text-secondary)', fontWeight: tab === t ? 600 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '-1px', transition: 'all 0.15s' }}>
                {t}{' '}
                <span style={{ background: 'var(--border)', padding: '1px 6px', borderRadius: 10, fontSize: 11, marginLeft: 4 }}>{count}</span>
              </button>
            )
          })}
        </div>

        <table>
          <thead>
            <tr>
              <th>POST</th>
              <th>AUTHOR</th>
              <th>TYPE</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No posts in this category</td></tr>
            ) : filtered.map(post => {
              const [bg, c]   = STATUS_COLORS[post.status] ?? ['#F3F4F6', '#6B7280']
              const [tbg, tc] = TYPE_COLORS[post.type]     ?? ['#F3F4F6', '#6B7280']
              return (
                <tr key={post.id}>
                  <td style={{ maxWidth: 300 }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>{post.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                      {post.content?.slice(0, 80)}…
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2C6E3F20', color: '#2C6E3F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                        {getInitials(post.author?.firstName, post.author?.lastName)}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {post.author?.firstName} {post.author?.lastName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: tbg, color: tc, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      {post.type}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{fmtDate(post.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleStatusToggle(post)}
                      style={{ background: bg, color: c, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                      title="Click to change status"
                    >
                      {post.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="icon-btn" onClick={() => setViewing(post)} title="View post"><Eye size={14} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(post.id)} title="Delete post"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="table-footer">Showing {filtered.length} of {posts.length} posts</div>
      </div>

      {viewing && <ViewModal post={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}

export default CommunityPosts