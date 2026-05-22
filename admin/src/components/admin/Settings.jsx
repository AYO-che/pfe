import React, { useState, useEffect } from 'react'
import { Shield, Settings as Ico, Activity, Eye, EyeOff, Save, CheckCircle, Sun, Moon, Mail, Calendar, Loader, Users, CreditCard, FileText, MessageSquare } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const BASE_URL = 'https://chrysalise-server.onrender.com'

const apiFetch = (path, opts = {}) =>
  fetch(`${BASE_URL}${path}`, { credentials: 'include', ...opts })

const fmtDate    = iso => iso ? new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
const fmtRelTime = iso => {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hrs   = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs  < 24) return `${hrs}h ago`
  return `${days}d ago`
}

const TABS = [
  { id:'security', label:'Security',     icon:Shield   },
  { id:'general',  label:'General',      icon:Ico      },
  { id:'activity', label:'Activity Log', icon:Activity },
]

/* ── Toast ── */
const Toast = ({ msg, isError }) => (
  <div style={{ position:'fixed', bottom:24, right:24, background: isError?'#EF4444':'#2C6E3F', color:'white', padding:'12px 20px', borderRadius:10, display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, zIndex:9999, boxShadow:`0 4px 20px ${isError?'rgba(239,68,68,0.4)':'rgba(44,110,63,0.4)'}`, animation:'slideUp 0.2s ease' }}>
    <CheckCircle size={16}/> {msg}
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>
)

/* ── Password field ── */
const PwField = ({ label, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position:'relative' }}>
        <input type={show?'text':'password'} className="form-input" value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight:40 }}/>
        <button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
          {show ? <EyeOff size={14}/> : <Eye size={14}/>}
        </button>
      </div>
    </div>
  )
}

/* ── Toggle switch ── */
const Toggle = ({ on, onClick }) => (
  <button onClick={onClick} style={{ width:44, height:24, background:on?'#2C6E3F':'var(--border)', borderRadius:12, border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
    <div style={{ width:18, height:18, borderRadius:'50%', background:'white', position:'absolute', top:3, left:on?23:3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
  </button>
)

/* ══════════════════════════════════════
   SECURITY TAB
══════════════════════════════════════ */
const Security = ({ onSave }) => {
  const [f,      setF]      = useState({ cur:'', nw:'', con:'' })
  const [err,    setErr]    = useState('')
  const [saving, setSaving] = useState(false)

  const [me,        setMe]        = useState(null)
  const [meLoading, setMeLoading] = useState(true)

  useEffect(() => {
    apiFetch('/me')
      .then(r => r.json())
      .then(data => setMe(data.user ?? data))
      .catch(() => {})
      .finally(() => setMeLoading(false))
  }, [])

  const sub = async (e) => {
    e.preventDefault()
    setErr('')
    if (!f.cur)          { setErr('Current password is required');           return }
    if (f.nw !== f.con)  { setErr('New passwords do not match');             return }
    if (f.nw.length < 6) { setErr('Password must be at least 6 characters'); return }

    setSaving(true)
    try {
      const res  = await apiFetch('/change-password', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currentPassword: f.cur, newPassword: f.nw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to change password')
      onSave('Password updated successfully!')
      setF({ cur:'', nw:'', con:'' })
    } catch (err) {
      setErr(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth:480 }}>

      {/* Account Info */}
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>Account Info</div>
        {meLoading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'20px 0' }}>
            <Loader size={20} className="spin" style={{ color:'#2C6E3F' }}/>
          </div>
        ) : me ? (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--bg-main)', borderRadius:10, border:'1px solid var(--border)' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#2C6E3F20', color:'#2C6E3F', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, flexShrink:0 }}>
                {`${me.firstName?.[0]??''}${me.lastName?.[0]??''}`.toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>{me.firstName} {me.lastName}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Administrator</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--bg-main)', borderRadius:10, border:'1px solid var(--border)' }}>
              <Mail size={15} color="#2C6E3F"/>
              <div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom:2 }}>Email</div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{me.email}</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--bg-main)', borderRadius:10, border:'1px solid var(--border)' }}>
              <Calendar size={15} color="#2C6E3F"/>
              <div>
                <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom:2 }}>Admin Since</div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{fmtDate(me.createdAt)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize:13, color:'var(--text-muted)' }}>Could not load account info</div>
        )}
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:20 }}>
          <div style={{ width:38, height:38, borderRadius:8, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Shield size={18} color="#EF4444"/>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:2 }}>Change Password</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Update your admin account password</div>
          </div>
        </div>
        <form onSubmit={sub}>
          <PwField label="CURRENT PASSWORD"    value={f.cur} onChange={e=>setF({...f,cur:e.target.value})} placeholder="Current password"/>
          <PwField label="NEW PASSWORD"         value={f.nw}  onChange={e=>setF({...f,nw:e.target.value})}  placeholder="New password (min 6 chars)"/>
          <PwField label="CONFIRM NEW PASSWORD" value={f.con} onChange={e=>setF({...f,con:e.target.value})} placeholder="Confirm new password"/>
          {err && (
            <div style={{ color:'#EF4444', fontSize:13, marginBottom:14, background:'#FEF2F2', padding:'10px 12px', borderRadius:8 }}>{err}</div>
          )}
          <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={saving}>
            <Save size={14}/> {saving ? 'Saving…' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   GENERAL TAB
══════════════════════════════════════ */
const General = ({ onSave }) => {
  const { isDark, toggleTheme } = useTheme()
  const [f, setF] = useState({ name:'FITWISE', email:'support@fitwise.com', phone:'+966 XX XXX XXXX', lang:'English', tz:'Asia/Riyadh' })
  const sub = (e) => { e.preventDefault(); onSave('General settings saved!') }

  return (
    <div style={{ maxWidth:480 }}>
      <form className="card" style={{ padding:24, marginBottom:16 }} onSubmit={sub}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:20 }}>Platform Settings</div>
        <div className="form-group">
          <label className="form-label">Platform Name</label>
          <input className="form-input" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
        </div>
        <div className="form-group">
          <label className="form-label">Support Email</label>
          <input className="form-input" type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
        </div>
        <div className="form-group">
          <label className="form-label">Contact Phone</label>
          <input className="form-input" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select className="form-input" value={f.lang} onChange={e=>setF({...f,lang:e.target.value})}>
              <option>English</option><option>Arabic</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select className="form-input" value={f.tz} onChange={e=>setF({...f,tz:e.target.value})}>
              <option>Asia/Riyadh</option><option>UTC</option><option>Europe/London</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>
          <Save size={14}/> Save Changes
        </button>
      </form>

      <div className="card" style={{ padding:24 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>Appearance</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
              {isDark ? <Moon size={14} color="#4CAF50"/> : <Sun size={14} color="#F59E0B"/>}
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Switch between light and dark interface</div>
          </div>
          <Toggle on={isDark} onClick={toggleTheme}/>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   ACTIVITY LOG TAB
══════════════════════════════════════ */
const ActivityLog = () => {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchActivity = async () => {
    setLoading(true); setError(null)
    try {
      const res  = await apiFetch('/admin/activity')
      if (!res.ok) throw new Error('Failed to load activity')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchActivity() }, [])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}>
      <Loader size={24} className="spin" style={{ color:'#2C6E3F' }}/>
    </div>
  )

  if (error) return (
    <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
      <p style={{ marginBottom:12 }}>⚠️ {error}</p>
      <button className="btn-primary" onClick={fetchActivity}>Retry</button>
    </div>
  )

  const sections = [
    {
      title: 'New Users', icon: Users, color: '#2C6E3F',
      items: (data?.recentUsers ?? []).map(u => ({
        label:    `${u.firstName??''} ${u.lastName??''}`.trim() || u.email,
        sub:      u.role,
        time:     u.createdAt,
        dotColor: u.role === 'NUTRITION' ? '#3B82F6' : '#2C6E3F',
      })),
    },
    {
      title: 'Recent Subscriptions', icon: CreditCard, color: '#3B82F6',
      items: (data?.recentSubs ?? []).map(s => ({
        label:    `${s.patient?.firstName??''} ${s.patient?.lastName??''}`.trim() || '—',
        sub:      s.offer?.name ?? '—',
        time:     s.startDate,
        dotColor: s.status === 'ACTIVE' ? '#16A34A' : '#F59E0B',
      })),
    },
    {
      title: 'Blog Posts', icon: FileText, color: '#8B5CF6',
      items: (data?.recentPosts ?? []).map(p => ({
        label:    p.title,
        sub:      `${p.author?.firstName??''} ${p.author?.lastName??''}`.trim() || '—',
        time:     p.updatedAt,
        dotColor: p.status === 'APPROVED' ? '#16A34A' : p.status === 'REJECTED' ? '#EF4444' : '#F59E0B',
      })),
    },
    {
      title: 'Inquiries', icon: MessageSquare, color: '#F59E0B',
      items: (data?.recentInquiries ?? []).map(i => ({
        label:    i.name,
        sub:      i.resolved ? 'Resolved' : 'Pending',
        time:     i.createdAt,
        dotColor: i.resolved ? '#16A34A' : '#EF4444',
      })),
    },
  ]

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {sections.map(({ title, icon: Icon, color, items }) => (
          <div key={title} className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={15} color={color}/>
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>{title}</div>
            </div>
            {items.length === 0 ? (
              <div style={{ fontSize:13, color:'var(--text-muted)', textAlign:'center', padding:'12px 0' }}>No recent activity</div>
            ) : items.map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 0', borderBottom: i < items.length-1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:item.dotColor, marginTop:5, flexShrink:0 }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{item.sub}</div>
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap', flexShrink:0 }}>{fmtRelTime(item.time)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ textAlign:'right', marginTop:12 }}>
        <button className="btn-secondary" onClick={fetchActivity} style={{ fontSize:12 }}>↻ Refresh</button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
const Settings = () => {
  const [tab,     setTab]    = useState('security')
  const [toast,   setToast]  = useState('')
  const [isError, setIsError] = useState(false)

  const showToast = (msg, error = false) => {
    setToast(msg); setIsError(error)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, marginBottom:4, color:'var(--text-primary)' }}>Settings</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Platform configuration and admin preferences</p>
      </div>

      <div style={{ display:'flex', background:'var(--bg-card)', borderRadius:8, border:'1px solid var(--border)', padding:4, width:'fit-content', marginBottom:24, gap:2 }}>
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:6, border:'none', background:tab===t.id?'#2C6E3F':'transparent', color:tab===t.id?'white':'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
              <Icon size={14}/> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'security' && <Security  onSave={showToast}/>}
      {tab === 'general'  && <General   onSave={showToast}/>}
      {tab === 'activity' && <ActivityLog/>}

      {toast && <Toast msg={toast} isError={isError}/>}
    </div>
  )
}

export default Settings;
