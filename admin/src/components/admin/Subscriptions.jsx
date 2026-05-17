import React, { useState } from 'react'
import { DollarSign, Activity, Calendar, TrendingUp, Trash2 } from 'lucide-react'

const PLANS = ['Premium Annual','Premium Monthly','Summer Seasonal','Ramadan Plan','Free Plan']
const PRICES = { 'Premium Annual':'SAR 499','Premium Monthly':'SAR 49','Summer Seasonal':'SAR 149','Ramadan Plan':'SAR 79','Free Plan':'SAR 0' }

const INIT = [
  { id:1, user:'Ahmed Mohamed',  email:'ahmed@fitwise.com',   plan:'Premium Annual',   start:'2025-01-15', end:'2026-01-15', amount:'SAR 499', status:'Active'  },
  { id:2, user:'Sara Khalil',    email:'sara.k@fitwise.com',  plan:'Summer Seasonal',  start:'2025-06-01', end:'2025-08-31', amount:'SAR 149', status:'Free'    },
  { id:3, user:'Lina Jaber',     email:'lina.j@fitwise.com',  plan:'Premium Monthly',  start:'2024-12-01', end:'2025-01-01', amount:'SAR 49',  status:'Expired' },
  { id:4, user:'Omar Hassan',    email:'omar.h@fitwise.com',  plan:'Ramadan Plan',     start:'2025-03-01', end:'2025-04-01', amount:'SAR 79',  status:'Active'  },
  { id:5, user:'Nour Al-Rashid', email:'nour.r@fitwise.com',  plan:'Premium Annual',   start:'2025-03-20', end:'2026-03-20', amount:'SAR 499', status:'Active'  },
]

const Badge = ({ s }) => {
  const m = { Active:['#DCFCE7','#16A34A'], Free:['#DBEAFE','#2563EB'], Expired:['#FEE2E2','#DC2626'] }
  const [bg,c] = m[s]||['#F3F4F6','#6B7280']
  return <span style={{ background:bg, color:c, padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{s}</span>
}

/* ── Subscriptions Component (صلاحية العرض والمتابعة فقط) ── */
const Subscriptions = () => {
  const [subs,setSubs]   = useState(INIT)
  const [filter,setFilter] = useState('All')

  const filtered = filter==='All' ? subs : subs.filter(s=>s.status===filter)

  const totalRev = subs
    .filter(s=>s.status==='Active')
    .reduce((acc,s)=>acc+parseInt(s.amount.replace(/\D/g,'')||0), 0)

  const CARDS = [
    { l:'Total Revenue', v:`SAR ${totalRev.toLocaleString()}`, icon:DollarSign, c:'#2C6E3F' },
    { l:'Active Plans',  v:String(subs.filter(s=>s.status==='Active').length),  icon:Activity,   c:'#3B82F6' },
    { l:'Expired Plans', v:String(subs.filter(s=>s.status==='Expired').length), icon:Calendar,   c:'#EF4444' },
    { l:'Free Plans',    v:String(subs.filter(s=>s.status==='Free').length),    icon:TrendingUp, c:'#F59E0B' },
  ]

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, marginBottom:4, color:'var(--text-primary)' }}>Subscriptions & Payments</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Manage plans and track revenue</p>
        </div>
        {/* تم حذف زر إضافة اشتراك جديد من هنا بناءً على الصلاحيات */}
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {CARDS.map(c=>{
          const Icon=c.icon
          return (
            <div key={c.l} className="card" style={{ padding:20, display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ width:44, height:44, borderRadius:10, background:c.c+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={20} color={c.c}/>
              </div>
              <div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:2 }}>{c.l}</div>
                <div style={{ fontSize:c.l==='Total Revenue'?16:22, fontWeight:700, fontFamily:'Syne,sans-serif', color:c.l==='Total Revenue'?'#2C6E3F':'var(--text-primary)' }}>{c.v}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {['All','Active','Free','Expired'].map(f=>(
          <button key={f} className={`filter-tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead><tr><th>USER</th><th>PLAN</th><th>START</th><th>END</th><th>AMOUNT</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
          <tbody>
            {filtered.map(s=>(
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight:600, color:'var(--text-primary)' }}>{s.user}</div>
                  {s.email&&<div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.email}</div>}
                </td>
                <td style={{ color:'var(--text-secondary)' }}>{s.plan}</td>
                <td style={{ color:'var(--text-secondary)' }}>{s.start}</td>
                <td style={{ color:'var(--text-secondary)' }}>{s.end}</td>
                <td style={{ fontWeight:700, color:'var(--text-primary)' }}>{s.amount}</td>
                <td><Badge s={s.status}/></td>
                <td>
                  <button className="icon-btn danger" onClick={()=>setSubs(prev=>prev.filter(x=>x.id!==s.id))} title="Delete Record"><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {filtered.length===0&&<tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No subscriptions found</td></tr>}
          </tbody>
        </table>
        <div className="table-footer">Showing {filtered.length} of {subs.length} subscriptions</div>
      </div>
    </div>
  )
}

export default Subscriptions