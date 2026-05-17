import React, { useState } from 'react'
import { Search, Eye, Trash2, X, CreditCard, Mail } from 'lucide-react'

const COLORS = ['#2C6E3F','#4CAF50','#FF9800','#9C27B0','#2196F3']

// تم تحويل الـ plan إلى plans (مصفوفة) لدعم الخطط المتعددة لكل عميل
const INIT = [
  { id:1, name:'Ahmed Mohamed',  email:'ahmed@fitwise.com',  initials:'AM', plans:['Premium Annual', 'Summer Seasonal'],  subscription:'Active' },
  { id:2, name:'Sara Khalil',    email:'sara.k@fitwise.com', initials:'SK', plans:['Free Plan'],                          subscription:'Free' },
  { id:3, name:'Lina Jaber',     email:'lina.j@fitwise.com', initials:'LJ', plans:['Premium Monthly'],                    subscription:'Expired' },
  { id:4, name:'Omar Hassan',    email:'omar.h@fitwise.com', initials:'OH', plans:['Ramadan Plan', 'Premium Monthly'],    subscription:'Active' },
  { id:5, name:'Nour Al-Rashid', email:'nour.r@fitwise.com', initials:'NA', plans:['Premium Annual'],                    subscription:'Active' },
]

const SubBadge = ({ s }) => {
  const m = { Active:['#DCFCE7','#16A34A'], Free:['#DBEAFE','#2563EB'], Expired:['#FEE2E2','#DC2626'] }
  const [bg,c] = m[s]||['#F3F4F6','#6B7280']
  return <span style={{ background:bg, color:c, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{s}</span>
}

/* ── Profile Modal (يستعرض كل الخطط) ── */
const ProfileModal = ({ p, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ width:400 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#2C6E3F,#4CAF50)', padding:28, borderRadius:'14px 14px 0 0', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.2)', border:'none', borderRadius:6, padding:4, cursor:'pointer', color:'white' }}><X size={16}/></button>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'white', border:'3px solid rgba(255,255,255,0.4)' }}>{p.initials}</div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:'white', fontFamily:'Syne,sans-serif' }}>{p.name}</div>
            <SubBadge s={p.subscription}/>
          </div>
        </div>
      </div>

      <div style={{ padding:24 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
          <div style={{ background:'var(--bg-main)', borderRadius:8, padding:12, border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
            <Mail size={18} color="#2C6E3F"/>
            <div>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>Email</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{p.email}</div>
            </div>
          </div>
          
          {/* هنا نقوم بعمل Loop لعرض كافة الخطط داخل الـ Modal */}
          <div style={{ background:'var(--bg-main)', borderRadius:8, padding:12, border:'1px solid var(--border)', display:'flex', alignItems:'flex-start', gap:12 }}>
            <CreditCard size={18} color="#2C6E3F" style={{ marginTop: 2 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom: 4 }}>Purchased Plans</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {p.plans.map((pl, idx) => (
                  <div key={idx} style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>
                    • {pl}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
)

/* ── Main Clients Component ── */
const Clients = () => {
  const [clients, setClients] = useState(INIT)
  const [search, setSearch]     = useState('')
  const [view,   setView]       = useState(null)

  const filtered = clients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, marginBottom:4, color:'var(--text-primary)' }}>Client Management</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>View registered clients and their purchased plans</p>
        </div>
      </div>

      <div className="card" style={{ padding:'16px 20px', marginBottom:16 }}>
        <div className="search-box" style={{ width:300 }}>
          <Search size={14} color="var(--text-muted)"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..."/>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>CLIENT INFO</th>
              <th>PURCHASED PLANS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p,i)=>(
              <tr key={p.id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:COLORS[i%COLORS.length]+'20', color:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>
                      {p.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>{p.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-muted)' }}>{p.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {/* هنا نقوم بعمل Loop لعرض كافة خطط العميل داخل الجدول فوق بعضها بشكل متناسق */}
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {p.plans.map((pl, idx) => (
                      <div key={idx} style={{ fontWeight:500, color:'var(--text-primary)', fontSize:13 }}>
                        {pl}
                      </div>
                    ))}
                  </div>
                </td>
                <td>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="icon-btn" onClick={()=>setView({p})} title="View Profile"><Eye size={14}/></button>
                    <button className="icon-btn danger" onClick={()=>setClients(prev=>prev.filter(x=>x.id!==p.id))} title="Delete"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="table-footer">Showing {filtered.length} of {clients.length} clients</div>
      </div>

      {view && <ProfileModal p={view.p} onClose={()=>setView(null)}/>}
    </div>
  )
}

export default Clients