import React, { useState } from 'react'
import { CheckCheck, Send, X, MessageSquare, Clock, CheckCircle } from 'lucide-react'

const COLORS = ['#2C6E3F','#2196F3','#FF9800','#EF4444']

const INIT = [
  { id:1, initials:'KN', name:'Khalid Nasser',  subject:'Subscription Renewal Issue',   message:'Hello, I tried to renew my Premium plan but the payment keeps failing. Please help me resolve this issue as soon as possible.', date:'2025-04-10', unread:true,  status:'pending', replies:[] },
  { id:2, initials:'MS', name:'Mona Sami',       subject:'Cannot login to my account',   message:'I have been unable to log into my account since yesterday. I reset my password but still cannot access my profile.',            date:'2025-04-09', unread:false, status:'pending', replies:[] },
  { id:3, initials:'TB', name:'Tariq Bilal',     subject:'Nutritionist not responding',  message:'My assigned nutritionist has not replied to my messages for 5 days. Can you please escalate this?',                            date:'2025-04-08', unread:true,  status:'pending', replies:[] },
  { id:4, initials:'RF', name:'Reem Fahad',      subject:'Wrong meal plan assigned',     message:'I specifically requested a vegan meal plan but I was assigned a plan that includes meat. Please fix this.',                    date:'2025-04-07', unread:true,  status:'replied', replies:[{ text:'We have corrected the meal plan. You should now see a vegan plan assigned. Please refresh and let us know if you need further help.', date:'2025-04-07' }] },
]

const QUICK = [
  'Thank you for contacting us. We are looking into your issue.',
  'Your issue has been resolved. Please check your account.',
  'We have escalated this to our technical team.',
  'Please try again and contact us if the problem persists.',
]

/* ── Reply Modal ── */
const ReplyModal = ({ inq, onClose, onReply }) => {
  const [text,setText] = useState('')
  const send = () => { if(!text.trim()) return; onReply(inq.id, text.trim()); onClose() }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{ width:560 }}>
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:17, color:'var(--text-primary)' }}>Reply to Inquiry</h3>
          <button onClick={onClose} className="icon-btn"><X size={16}/></button>
        </div>
        <div style={{ padding:24 }}>
          {/* Original */}
          <div style={{ background:'var(--bg-main)', border:'1px solid var(--border)', borderRadius:10, padding:16, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>{inq.name}</span>
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{inq.date}</span>
            </div>
            <div style={{ fontWeight:600, fontSize:13, color:'var(--text-secondary)', marginBottom:4 }}>{inq.subject}</div>
            <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{inq.message}</div>
          </div>

          {/* Previous replies */}
          {inq.replies.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Previous Replies</div>
              {inq.replies.map((r,i)=>(
                <div key={i} style={{ background:'#2C6E3F10', border:'1px solid #2C6E3F30', borderRadius:8, padding:12, marginBottom:6 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:'#2C6E3F' }}>Admin</span>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{r.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick replies */}
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', marginBottom:8 }}>Quick Replies</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {QUICK.map((q,i)=>(
                <button key={i} onClick={()=>setText(q)} style={{ textAlign:'left', background:'var(--bg-main)', border:'1px solid var(--border)', borderRadius:6, padding:'8px 12px', fontSize:12, color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='#2C6E3F'; e.currentTarget.style.color='#2C6E3F' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}
                >{q}</button>
              ))}
            </div>
          </div>

          <textarea value={text} onChange={e=>setText(e.target.value)} rows={4} placeholder="Type your reply here..." className="form-input" style={{ resize:'none', marginBottom:16 }}/>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={send} className="btn-primary" disabled={!text.trim()}><Send size={13}/> Send Reply</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main ── */
const Inquiries = () => {
  const [inquiries, setInquiries] = useState(INIT)
  const [filter,    setFilter]    = useState('All')
  const [target,    setTarget]    = useState(null)

  const reply = (id, text) => {
    setInquiries(prev => prev.map(inq =>
      inq.id===id ? { ...inq, status:'replied', unread:false, replies:[...inq.replies, { text, date:new Date().toISOString().split('T')[0] }] } : inq
    ))
  }

  const markAll = () => setInquiries(prev => prev.map(i=>({...i,unread:false})))

  const filtered = filter==='All' ? inquiries
    : filter==='Pending' ? inquiries.filter(i=>i.status==='pending')
    : inquiries.filter(i=>i.status==='replied')

  const pending  = inquiries.filter(i=>i.status==='pending').length
  const replied  = inquiries.filter(i=>i.status==='replied').length
  const unreadCt = inquiries.filter(i=>i.unread).length

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:22, marginBottom:4, color:'var(--text-primary)' }}>Inquiries</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>{unreadCt} unread messages</p>
        </div>
        <button onClick={markAll} className="btn-secondary"><CheckCheck size={14}/> Mark All as Read</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          {l:'Total',   v:inquiries.length, icon:MessageSquare, c:'#6B7280'},
          {l:'Pending', v:pending,           icon:Clock,        c:'#F59E0B'},
          {l:'Replied', v:replied,           icon:CheckCircle,  c:'#2C6E3F'},
        ].map(s=>{
          const Icon=s.icon
          return (
            <div key={s.l} className="card" style={{ padding:'16px 20px', display:'flex', gap:12, alignItems:'center' }}>
              <div style={{ width:36, height:36, borderRadius:8, background:s.c+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={17} color={s.c}/>
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:'Syne,sans-serif', color:'var(--text-primary)' }}>{s.v}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.l}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {['All','Pending','Replied'].map(f=>(
          <button key={f} className={`filter-tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {filtered.map((inq,i)=>(
          <div key={inq.id} style={{ background:'var(--bg-card)', border:`1px solid ${inq.unread?'#2C6E3F40':'var(--border)'}`, borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)', transition:'box-shadow 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'}
            onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}
          >
            <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', flexShrink:0, background:COLORS[i%COLORS.length]+'20', color:COLORS[i%COLORS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700 }}>{inq.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{inq.name}</span>
                    {inq.unread && <span style={{ background:'#EF4444', color:'white', fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:20 }}>NEW</span>}
                    <span className={`badge badge-${inq.status}`}>{inq.status}</span>
                    {inq.replies.length>0&&<span style={{ fontSize:11, color:'var(--text-muted)' }}>{inq.replies.length} {inq.replies.length===1?'reply':'replies'}</span>}
                  </div>
                  <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{inq.date}</span>
                </div>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:4 }}>{inq.subject}</div>
                <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.5, marginBottom:10 }}>{inq.message}</div>

                {/* Latest reply preview */}
                {inq.replies.length>0 && (
                  <div style={{ background:'#2C6E3F08', border:'1px solid #2C6E3F25', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
                    <div style={{ fontSize:11, color:'#2C6E3F', fontWeight:600, marginBottom:4 }}>Last reply — {inq.replies[inq.replies.length-1].date}</div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{inq.replies[inq.replies.length-1].text}</div>
                  </div>
                )}

                <button className="btn-primary" style={{ padding:'6px 14px', fontSize:12 }} onClick={()=>setTarget(inq)}>
                  <Send size={12}/> {inq.replies.length>0?'Reply Again':'Reply'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0&&(
          <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>
            <MessageSquare size={40} style={{ marginBottom:12, opacity:0.3 }}/>
            <div>No inquiries in this category</div>
          </div>
        )}
      </div>

      {target && <ReplyModal inq={target} onClose={()=>setTarget(null)} onReply={reply}/>}
    </div>
  )
}

export default Inquiries
