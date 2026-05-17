import React, { useState } from 'react'
import { Shield, Settings as Ico, Cpu, Eye, EyeOff, Save, CheckCircle, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const TABS = [
  { id:'security', label:'Security', icon:Shield },
  { id:'general',  label:'General',  icon:Ico   },
  { id:'ai',       label:'AI Config', icon:Cpu  },
]

/* ── Toast ── */
const Toast = ({ msg }) => (
  <div style={{ position:'fixed', bottom:24, right:24, background:'#2C6E3F', color:'white', padding:'12px 20px', borderRadius:10, display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, zIndex:9999, boxShadow:'0 4px 20px rgba(44,110,63,0.4)', animation:'slideUp 0.2s ease' }}>
    <CheckCircle size={16}/> {msg}
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>
)

/* ── Password field ── */
const PwField = ({ label, value, onChange, placeholder }) => {
  const [show,setShow] = useState(false)
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position:'relative' }}>
        <input type={show?'text':'password'} className="form-input" value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight:40 }}/>
        <button type="button" onClick={()=>setShow(!show)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
          {show?<EyeOff size={14}/>:<Eye size={14}/>}
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

/* ── Security ── */
const Security = ({ onSave }) => {
  const [f,setF]   = useState({ cur:'', nw:'', con:'' })
  const [err,setErr] = useState('')
  const [toggles,setToggles] = useState([true,true,false])

  const sub = (e) => {
    e.preventDefault(); setErr('')
    if(f.nw!==f.con){ setErr('New passwords do not match'); return }
    if(f.nw.length<6){ setErr('Password must be at least 6 characters'); return }
    onSave('Password updated successfully!')
    setF({cur:'',nw:'',con:''})
  }

  return (
    <div style={{ maxWidth:480 }}>
      <div className="card" style={{ padding:24, marginBottom:16 }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:20 }}>
          <div style={{ width:38, height:38, borderRadius:8, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Shield size={18} color="#EF4444"/></div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:2 }}>Change Password</div>
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>Update your admin account password</div>
          </div>
        </div>
        <form onSubmit={sub}>
          <PwField label="CURRENT PASSWORD" value={f.cur} onChange={e=>setF({...f,cur:e.target.value})} placeholder="Current password"/>
          <PwField label="NEW PASSWORD"      value={f.nw}  onChange={e=>setF({...f,nw:e.target.value})}  placeholder="New password (min 6 chars)"/>
          <PwField label="CONFIRM NEW PASSWORD" value={f.con} onChange={e=>setF({...f,con:e.target.value})} placeholder="Confirm new password"/>
          {err&&<div style={{ color:'#EF4444', fontSize:13, marginBottom:14, background:'#FEF2F2', padding:'10px 12px', borderRadius:8 }}>{err}</div>}
          <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }}><Save size={14}/> Change Password</button>
        </form>
      </div>

      <div className="card" style={{ padding:24 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>Security Options</div>
        {['Email verification on login','Session timeout (30 min)','Login activity notifications'].map((item,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:i<2?'1px solid var(--border-light)':'none' }}>
            <span style={{ fontSize:13, color:'var(--text-primary)' }}>{item}</span>
            <Toggle on={toggles[i]} onClick={()=>setToggles(prev=>{const n=[...prev];n[i]=!n[i];return n})}/>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── General ── */
const General = ({ onSave }) => {
  const { isDark, toggleTheme } = useTheme()
  const [f,setF] = useState({ name:'FITWISE', email:'support@fitwise.com', phone:'+966 XX XXX XXXX', lang:'English', tz:'Asia/Riyadh' })
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
        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }}><Save size={14}/> Save Changes</button>
      </form>

      {/* Appearance */}
      <div className="card" style={{ padding:24 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:16 }}>Appearance</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'4px 0' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
              {isDark?<Moon size={14} color="#4CAF50"/>:<Sun size={14} color="#F59E0B}"/>}
              {isDark?'Dark Mode':'Light Mode'}
            </div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Switch between light and dark interface</div>
          </div>
          <Toggle on={isDark} onClick={toggleTheme}/>
        </div>
      </div>
    </div>
  )
}

/* ── AI Config ── */
const AIConfig = ({ onSave }) => {
  const [f,setF]    = useState({ key:'', model:'gpt-4', temp:0.7, tokens:1000 })
  const [showKey,setShowKey] = useState(false)
  const sub = (e) => { e.preventDefault(); onSave('AI configuration saved!') }

  return (
    <div style={{ maxWidth:480 }}>
      <form className="card" style={{ padding:24 }} onSubmit={sub}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)', marginBottom:20 }}>AI Configuration</div>

        <div className="form-group">
          <label className="form-label">API Key</label>
          <div style={{ position:'relative' }}>
            <input type={showKey?'text':'password'} className="form-input" value={f.key} onChange={e=>setF({...f,key:e.target.value})} placeholder="sk-..." style={{ paddingRight:40 }}/>
            <button type="button" onClick={()=>setShowKey(!showKey)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
              {showKey?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Model</label>
          <select className="form-input" value={f.model} onChange={e=>setF({...f,model:e.target.value})}>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3">Claude 3</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Temperature: {f.temp}</label>
          <input type="range" min="0" max="1" step="0.1" value={f.temp} onChange={e=>setF({...f,temp:parseFloat(e.target.value)})} style={{ width:'100%', accentColor:'#2C6E3F', marginBottom:4 }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)' }}>
            <span>Precise (0)</span><span>Creative (1)</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Max Tokens: {f.tokens.toLocaleString()}</label>
          <input type="range" min="100" max="4000" step="100" value={f.tokens} onChange={e=>setF({...f,tokens:parseInt(e.target.value)})} style={{ width:'100%', accentColor:'#2C6E3F', marginBottom:4 }}/>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)' }}>
            <span>100</span><span>4,000</span>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }}><Save size={14}/> Save AI Config</button>
      </form>
    </div>
  )
}

/* ── Main ── */
const Settings = () => {
  const [tab,  setTab]  = useState('security')
  const [toast,setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(''), 3000) }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, marginBottom:4, color:'var(--text-primary)' }}>Settings</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Platform configuration and admin preferences</p>
      </div>

      {/* Tab switcher */}
      <div style={{ display:'flex', background:'var(--bg-card)', borderRadius:8, border:'1px solid var(--border)', padding:4, width:'fit-content', marginBottom:24, gap:2 }}>
        {TABS.map(t=>{
          const Icon=t.icon
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:6, border:'none', background:tab===t.id?'#2C6E3F':'transparent', color:tab===t.id?'white':'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
              <Icon size={14}/> {t.label}
            </button>
          )
        })}
      </div>

      {tab==='security' && <Security  onSave={showToast}/>}
      {tab==='general'  && <General   onSave={showToast}/>}
      {tab==='ai'       && <AIConfig  onSave={showToast}/>}

      {toast && <Toast msg={toast}/>}
    </div>
  )
}

export default Settings
