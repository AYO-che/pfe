import React, { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

const CAT_C = { Nutrition:'#10B981', Diet:'#F59E0B', Sports:'#3B82F6', Seasonal:'#8B5CF6', Partnership:'#EF4444', Product:'#2C6E3F' }

const INIT_A = [
  { id:1, title:'The 5 Best Supplements for Digestive Health', category:'Nutrition', date:'2025-03-12', views:1200, status:'Published', content: 'Sample content for digestive health...' },
  { id:2, title:'How to Build a Sustainable Keto Meal Plan',   category:'Diet',      date:'2025-03-08', views:845,  status:'Published', content: 'Sample content for keto meal plan...' },
  { id:3, title:'Sports Nutrition: What Athletes Need to Know',category:'Sports',    date:'2025-02-28', views:0,    status:'Draft',     content: 'Sample content for sports nutrition...' },
  { id:4, title:'Ramadan Nutrition Guide 2025',                category:'Seasonal',  date:'2025-02-20', views:3200, status:'Published', content: 'Sample content for Ramadan guide...' },
]
const INIT_N = [
  { id:1, title:'FITWISE Partners with Leading Sports Clinics',    category:'Partnership', date:'2025-04-15', views:560,  status:'Published', content: 'Sample content for partnership news...' },
  { id:2, title:'New AI-Powered Meal Planning Feature Launch',     category:'Product',     date:'2025-04-01', views:1840, status:'Published', content: 'Sample content for product launch...' },
]

/* ── Add Modal (تمت إضافة حقل كتابة المحتوى هنا) ── */
const AddModal = ({ onClose, onAdd, tab }) => {
  // إضافة خاصية content في الـ State الابتدائي
  const [f,setF] = useState({ title:'', category: tab==='Articles'?'Nutrition':'Partnership', status:'Draft', content:'' })
  const cats = tab==='Articles' ? ['Nutrition','Diet','Sports','Seasonal'] : ['Partnership','Product']
  
  const sub = (e) => { 
    e.preventDefault(); 
    onAdd({...f, id:Date.now(), date:new Date().toISOString().split('T')[0], views:0}); 
    onClose() 
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ width:460 }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
          <h3 style={{ fontSize:17, color:'var(--text-primary)' }}>New {tab==='Articles'?'Article':'News'}</h3>
          <button onClick={onClose} className="icon-btn"><X size={16}/></button>
        </div>
        <form onSubmit={sub} style={{ padding:24 }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" required value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Enter title..."/>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={f.category} onChange={e=>setF({...f,category:e.target.value})}>
              {cats.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={f.status} onChange={e=>setF({...f,status:e.target.value})}>
              <option>Draft</option><option>Published</option>
            </select>
          </div>
          
          {/* حقل كتابة محتوى البلوغ الجديد */}
          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea 
              className="form-input" 
              required 
              rows={6} 
              value={f.content} 
              onChange={e=>setF({...f,content:e.target.value})} 
              placeholder="Write your article or news content here..."
              style={{ resize: 'vertical', fontFamily: 'inherit', padding: '10px 12px' }}
            />
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:12 }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Content = () => {
  const [tab,   setTab]  = useState('Articles')
  const [art,   setArt]  = useState(INIT_A)
  const [news, setNews] = useState(INIT_N)
  const [add,   setAdd]  = useState(false)

  const data    = tab==='Articles' ? art  : news
  const setData = tab==='Articles' ? setArt : setNews

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, marginBottom:4, color:'var(--text-primary)' }}>Content Management</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Manage articles and platform news</p>
        </div>
        <button className="btn-primary" onClick={()=>setAdd(true)}><Plus size={14}/> New Post</button>
      </div>

      <div className="table-container">
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)', padding:'0 20px' }}>
          {['Articles','News'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'14px 16px', border:'none', background:'transparent', borderBottom:`2px solid ${tab===t?'#2C6E3F':'transparent'}`, color:tab===t?'#2C6E3F':'var(--text-secondary)', fontWeight:tab===t?600:400, fontSize:13, cursor:'pointer', fontFamily:'inherit', marginBottom:'-1px', transition:'all 0.15s' }}>
              {t} <span style={{ background:'var(--border)', padding:'1px 6px', borderRadius:10, fontSize:11, marginLeft:4 }}>{t==='Articles'?art.length:news.length}</span>
            </button>
          ))}
        </div>
        <table>
          <thead><tr><th>TITLE</th><th>CATEGORY</th><th>DATE</th><th>VIEWS</th><th>STATUS</th><th>ACTIONS</th></tr></thead>
          <tbody>
            {data.map(item=>(
              <tr key={item.id}>
                <td style={{ fontWeight:500, color:'var(--text-primary)', maxWidth:300 }}>{item.title}</td>
                <td><span style={{ background:(CAT_C[item.category]||'#6B7280')+'18', color:CAT_C[item.category]||'#6B7280', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600 }}>{item.category}</span></td>
                <td style={{ color:'var(--text-secondary)' }}>{item.date}</td>
                <td style={{ color:'var(--text-secondary)' }}>{item.views.toLocaleString()}</td>
                <td>
                  <button onClick={()=>setData(prev=>prev.map(i=>i.id===item.id?{...i,status:i.status==='Published'?'Draft':'Published'}:i))} style={{ background:item.status==='Published'?'#DCFCE7':'#FEF3C7', color:item.status==='Published'?'#16A34A':'#D97706', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:600, border:'none', cursor:'pointer' }}>
                    {item.status}
                  </button>
                </td>
                <td>
                  <button className="icon-btn danger" onClick={()=>setData(prev=>prev.filter(i=>i.id!==item.id))}><Trash2 size={14}/></button>
                </td>
              </tr>
            ))}
            {data.length===0&&<tr><td colSpan={6} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No content yet</td></tr>}
          </tbody>
        </table>
        <div className="table-footer">Showing {data.length} items</div>
      </div>

      {add && <AddModal onClose={()=>setAdd(false)} onAdd={item=>setData(prev=>[...prev,item])} tab={tab}/>}
    </div>
  )
}

export default Content