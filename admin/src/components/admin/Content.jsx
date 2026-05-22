import React, { useState, useEffect } from 'react'
import { Plus, Trash2, X, Loader, RefreshCw } from 'lucide-react'

const BASE_URL = 'https://chrysalise-server.onrender.com'

const STATUS_COLORS = {
  APPROVED: ['#DCFCE7', '#16A34A'],
  PENDING:  ['#FEF3C7', '#D97706'],
  REJECTED: ['#FEE2E2', '#DC2626'],
}

const fmtDate  = iso => iso ? new Date(iso).toISOString().split('T')[0] : '—'
const apiFetch = (path, opts = {}) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include', ...opts })

/* ── Add Modal ── */
const AddModal = ({ onClose, onAdd }) => {
  const [f,      setF]      = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const res  = await apiFetch('/blog', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title: f.title, content: f.content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create post')
      onAdd(data.post)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ width: 460 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 17, color: 'var(--text-primary)' }}>New Blog Post</h3>
          <button onClick={onClose} className="icon-btn"><X size={16} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              required
              value={f.title}
              onChange={e => setF({ ...f, title: e.target.value })}
              placeholder="Enter title..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea
              className="form-input"
              required
              rows={6}
              value={f.content}
              onChange={e => setF({ ...f, content: e.target.value })}
              placeholder="Write your content here..."
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader size={13} className="spin" /> : <Plus size={13} />}
              {' '}{saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main ── */
const Content = () => {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [tab,     setTab]     = useState('All')
  const [add,     setAdd]     = useState(false)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await apiFetch('/blog/all')
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
    // PENDING → APPROVED, APPROVED → REJECTED, REJECTED → APPROVED
    const next = post.status === 'PENDING'   ? 'APPROVED'
               : post.status === 'APPROVED'  ? 'REJECTED'
               : 'APPROVED'
    try {
      const res  = await apiFetch(`/blog/${post.id}/status`, {
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
      const res = await apiFetch(`/blog/${id}`, { method: 'DELETE' })
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
          <h1 style={{ fontSize: 22, marginBottom: 4, color: 'var(--text-primary)' }}>Content Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Manage and moderate blog posts</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={fetchPosts}><RefreshCw size={14} /> Refresh</button>
          <button className="btn-primary" onClick={() => setAdd(true)}><Plus size={14} /> New Post</button>
        </div>
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
              <th>TITLE</th>
              <th>AUTHOR</th>
              <th>DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No posts in this category</td></tr>
            ) : filtered.map(post => {
              const [bg, c] = STATUS_COLORS[post.status] ?? ['#F3F4F6', '#6B7280']
              return (
                <tr key={post.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 300 }}>
                    <div>{post.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                      {post.content?.slice(0, 80)}…
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {post.author
                      ? `${post.author.firstName ?? ''} ${post.author.lastName ?? ''}`.trim() || '—'
                      : '—'}
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
                    <button className="icon-btn danger" onClick={() => handleDelete(post.id)} title="Delete post">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="table-footer">Showing {filtered.length} of {posts.length} posts</div>
      </div>

      {add && <AddModal onClose={() => setAdd(false)} onAdd={post => setPosts(prev => [post, ...prev])} />}
    </div>
  )
}

export default Content
