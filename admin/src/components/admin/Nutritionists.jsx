import React, { useState } from 'react'
import { Search, Plus, Eye, Trash2, Star, X, Mail, Calendar, Lock, User } from 'lucide-react'

const COLORS = ['#2C6E3F','#2196F3','#9C27B0','#FF9800']

const SPEC_COLORS = {
  'Keto Specialist':'#F59E0B','Sports Nutrition':'#10B981',
  'Weight Loss':'#EF4444','Child Nutrition':'#8B5CF6',
  'Diabetes Diet':'#3B82F6','Vegan Nutrition':'#2C6E3F','General Nutrition':'#6B7280',
}
const SPECS = Object.keys(SPEC_COLORS)

// ملاحظة: قمت بتغيير النقاط هنا بكلمات مرور حقيقية لتظهر لك
const INIT = [
  { id:1, firstName:'Emily', lastName:'Watson', email:'emily@fitwise.com', specialty:'Keto Specialist', clients:45, rating:4.8, joined:'2024-06-01', password: 'Password123' },
  { id:2, firstName:'Marcus', lastName:'Chen', email:'marcus@fitwise.com', specialty:'Sports Nutrition', clients:32, rating:4.9, joined:'2024-08-15', password: 'Admin@Marcus99' },
]

const StarRating = ({ r }) => (
  <div style={{ display:'flex', alignItems:'center', gap:3 }}>
    {[1,2,3,4,5].map(s=><Star key={s} size={12} fill={s<=Math.round(r)?'#F59E0B':'none'} color={s<=Math.round(r)?'#F59E0B':'var(--border)'}/>)}
    <span style={{ fontSize:12, color:'var(--text-secondary)', marginLeft:4 }}>{r}</span>
  </div>
)

/* ── Profile Modal (واجهة العرض) ── */
const ProfileModal = ({ doc, color, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ width:500 }}>
      <div style={{ background:`linear-gradient(135deg,${color},${color}bb)`, padding:28, borderRadius:'14px 14px 0 0', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:6, padding:4, cursor:'pointer', color:'white' }}><X size={16}/></button>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'white', border:'3px solid rgba(255,255,255,0.4)' }}>{doc.firstName[0]}{doc.lastName[0]}</div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:'white', fontFamily:'Syne,sans-serif' }}>{doc.firstName} {doc.lastName}</div>
            <span style={{ background:'rgba(255,255,255,0.2)', color:'white', padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:600, marginTop:6, display:'inline-block' }}>{doc.specialty}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:24, marginTop:20 }}>
          {[{l:'Clients',v:doc.clients},{l:'Rating',v:doc.rating},{l:'Joined',v:doc.joined}].map(s=>(
            <div key={s.l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:'white', fontFamily:'Syne,sans-serif' }}>{s.v}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12, marginBottom:16 }}>
          <div style={{ background:'var(--bg-main)', borderRadius:8, padding:12, border:'1px solid var(--border)' }}>
             <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}><Mail size={13} color={color}/><span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>Email Address</span></div>
             <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{doc.email}</div>
          </div>
          
          {/* هنا تم التأكيد على أن النص يظهر صريحاً وليس نقاطاً */}
          <div style={{ background: color + '08', borderRadius:8, padding:12, border:'1px dashed ' + color }}>
             <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:4 }}><Lock size={13} color={color}/><span style={{ fontSize:11, color:color, fontWeight:700, textTransform:'uppercase' }}>Password </span></div>
             <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', fontFamily:'monospace' }}>{doc.password}</div>
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">Close View</button>
        </div>
      </div>
    </div>
  </div>
)

/* ── Add Modal (واجهة الإضافة) ── */
const AddModal = ({ onClose, onAdd }) => {
  const [f,setF] = useState({ firstName:'', lastName:'', email:'', password:'', specialty:'General Nutrition' })
  const sub = (e) => {
    e.preventDefault()
    onAdd({ ...f, id:Date.now(), clients:0, rating:0, joined:new Date().toISOString().split('T')[0] })
    onClose()
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ width:450 }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:17, color:'var(--text-primary)' }}>Add New Expert</h3>
          <button onClick={onClose} className="icon-btn"><X size={16}/></button>
        </div>
        <form onSubmit={sub} style={{ padding:24 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" required value={f.firstName} onChange={e=>setF({...f,firstName:e.target.value})} placeholder="John"/>
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" required value={f.lastName} onChange={e=>setF({...f,lastName:e.target.value})} placeholder="Doe"/>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" required value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="john@fitwise.com"/>
            </div>
            {/* النوع هنا text وليس password ليظهر ما تكتبه بوضوح */}
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Set Password</label>
              <input className="form-input" type="text" required value={f.password} onChange={e=>setF({...f,password:e.target.value})} placeholder="Enter password here..."/>
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Specialty</label>
              <select className="form-input" value={f.specialty} onChange={e=>setF({...f,specialty:e.target.value})}>
                {SPECS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Account</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Component ── */
const Nutritionists = () => {
  const [docs,setDocs] = useState(INIT)
  const [search,setSearch] = useState('')
  const [view,setView] = useState(null)
  const [addOpen,setAdd] = useState(false)

  const filtered = docs.filter(n => 
    n.firstName.toLowerCase().includes(search.toLowerCase()) || 
    n.lastName.toLowerCase().includes(search.toLowerCase()) ||
    n.specialty.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, marginBottom:4, color:'var(--text-primary)' }}>Nutritionists Management</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Admin Dashboard: Review and manage expert accounts</p>
        </div>
        <button className="btn-primary" onClick={()=>setAdd(true)}><Plus size={14}/> Add Expert</button>
      </div>

      <div className="card" style={{ padding:'16px 20px', marginBottom:16 }}>
        <div className="search-box" style={{ width:320 }}>
          <Search size={14} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or specialty..."/>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>EXPERT NAME</th>
              <th>SPECIALTY</th>
              <th>CLIENTS</th>
              <th>RATING</th>
              <th>JOINED DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n,i)=>(
              <tr key={n.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:COLORS[i%COLORS.length]+'20', color:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>{n.firstName[0]}{n.lastName[0]}</div>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>{n.firstName} {n.lastName}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{n.email}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{ background:(SPEC_COLORS[n.specialty]||'#6B7280')+'18', color:SPEC_COLORS[n.specialty]||'#6B7280', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{n.specialty}</span></td>
                <td style={{ color:'var(--text-secondary)' }}>{n.clients}</td>
                <td><StarRating r={n.rating}/></td>
                <td style={{ color:'var(--text-secondary)', fontSize:13 }}>{n.joined}</td>
                <td>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="icon-btn" onClick={()=>setView({doc:n,color:COLORS[i%COLORS.length]})} title="View Account Details"><Eye size={14}/></button>
                    <button className="icon-btn danger" onClick={()=>setDocs(prev=>prev.filter(x=>x.id!==n.id))} title="Delete Account"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view && <ProfileModal doc={view.doc} color={view.color} onClose={()=>setView(null)}/>}
      {addOpen && <AddModal onClose={()=>setAdd(false)} onAdd={n=>setDocs(prev=>[...prev,n])}/>}
    </div>
  )
}

export default Nutritionists