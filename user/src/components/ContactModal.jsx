import { authFetch } from "../context/Authcontext";
import { useState, useRef, useEffect } from "react";

const BASE_URL = "https://chrysalise-server.onrender.com";
const STORAGE_KEY = "contact_inquiry_id";

function buildInitialMessages(inquiry) {
  const msgs = [
    { sender: "bot", text: "Hello 👋 How can we help you today?", id: "init" },
  ];
  if (inquiry.message) msgs.push({ sender: "user", text: inquiry.message, id: "original" });
  if (inquiry.adminReply) msgs.push({ sender: "bot", text: inquiry.adminReply, id: "reply-admin" });
  return msgs;
}

export function ContactFAB({ onClick }) {
  return (
    <button className="contact-fab" onClick={onClick}
      style={{ position:"fixed", right:24, bottom:32, zIndex:999, background:"rgba(255,255,255,0.18)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", color:"#000", borderTop:"1.5px solid rgba(168,224,44,0.9)", borderLeft:"1.5px solid rgba(168,224,44,0.9)", borderBottom:"1.5px solid rgba(0,168,84,0.8)", borderRight:"1.5px solid rgba(0,168,84,0.8)", borderRadius:999, padding:"13px 22px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", boxShadow:"0 8px 32px rgba(15,89,47,0.16),inset 0 0 12px rgba(255,255,255,0.6)", display:"flex", alignItems:"center", gap:8 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      Text Us
    </button>
  );
}

export function ContactModal({ onClose, currentUser }) {
  const needsInfo = !currentUser;
  const [step, setStep] = useState("loading");
  const [nameVal, setNameVal] = useState(currentUser?.firstName ?? "");
  const [emailVal, setEmailVal] = useState(currentUser?.email ?? "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [inquiryId, setInquiryId] = useState(null);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (savedId) {
      setInquiryId(savedId);
      loadExisting(savedId, true);
    } else {
      setMessages([{ sender:"bot", text:"Hello 👋 How can we help you today?", id:"init" }]);
      setStep(needsInfo ? "info" : "chat");
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!inquiryId) return;
    pollRef.current = setInterval(() => loadExisting(inquiryId, false), 15_000);
    return () => clearInterval(pollRef.current);
  }, [inquiryId]);

  const loadExisting = async (id, isInitial) => {
    try {
      const res = await authFetch(`${BASE_URL}/inquiries/${id}`);
      if (!res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([{ sender:"bot", text:"Hello 👋 How can we help you today?", id:"init" }]);
        setStep(needsInfo ? "info" : "chat");
        return;
      }
      const { inquiry } = await res.json();
      if (isInitial) {
        setMessages(buildInitialMessages(inquiry));
        setStep("chat");
      } else {
        setMessages(prev => {
          if (inquiry.adminReply && !prev.some(m => m.id === "reply-admin")) {
            return [...prev, { sender:"bot", text:inquiry.adminReply, id:"reply-admin" }];
          }
          return prev;
        });
      }
    } catch (_) {
      if (isInitial) {
        setMessages([{ sender:"bot", text:"Hello 👋 How can we help you today?", id:"init" }]);
        setStep(needsInfo ? "info" : "chat");
      }
    }
  };

  const sendFirst = async (text) => {
    setSending(true);
    try {
      const res = await authFetch(`${BASE_URL}/inquiries`, {
        method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include",
        body: JSON.stringify({ name:nameVal, email:emailVal, message:text }),
      });
      if (!res.ok) throw new Error();
      const { inquiry } = await res.json();
      setInquiryId(inquiry.id);
      localStorage.setItem(STORAGE_KEY, inquiry.id);
      setMessages(prev => [...prev, { sender:"bot", text:"Thank you 💚 Our nutrition team will reply soon. You'll see their response right here.", id:"ack" }]);
    } catch {
      setMessages(prev => [...prev, { sender:"bot", text:"Something went wrong. Please try again.", id:"err-"+Date.now() }]);
    } finally { setSending(false); }
  };

  const sendFollowUp = () => {
    setMessages(prev => [...prev, { sender:"bot", text:"Got it! We've noted your follow-up. Our team will get back to you shortly.", id:"fu-"+Date.now() }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages(prev => [...prev, { sender:"user", text, id:"u-"+Date.now() }]);
    if (!inquiryId) { await sendFirst(text); } else { sendFollowUp(); }
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(26,51,41,0.45)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ width:"min(430px,92vw)", height:"78vh", maxHeight:720, display:"flex", flexDirection:"column", overflow:"hidden", borderRadius:28, background:"rgba(255,255,255,0.18)", backdropFilter:"blur(28px)", WebkitBackdropFilter:"blur(28px)", borderTop:"1.5px solid rgba(168,224,44,0.9)", borderLeft:"1.5px solid rgba(168,224,44,0.9)", borderBottom:"1.5px solid rgba(0,168,84,0.8)", borderRight:"1.5px solid rgba(0,168,84,0.8)", boxShadow:"0 16px 52px rgba(15,89,47,0.22),inset 0 0 18px rgba(255,255,255,0.65)", fontFamily:"'DM Sans',sans-serif" }}>

        <div style={{ padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(0,168,84,0.12)", background:"rgba(255,255,255,0.12)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:14, background:"linear-gradient(135deg,#3d9b73,#2a6b4f)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(11,102,48,0.4)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:"#000" }}>Nutrition Support</div>
              <div style={{ fontSize:12, color:"#0b6630" }}>{inquiryId ? "Your conversation is saved" : "Usually replies within 24h"}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", border:"1.5px solid rgba(168,224,44,0.4)", background:"rgba(255,255,255,0.5)", color:"#000", fontSize:16, cursor:"pointer" }}>✕</button>
        </div>

        {step === "loading" && (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontSize:13, color:"#0b6630" }}>Loading your conversation…</div>
          </div>
        )}

        {step === "info" && (
          <div style={{ flex:1, padding:24, display:"flex", flexDirection:"column", gap:14, justifyContent:"center" }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#1a3329" }}>Before we start, tell us a bit about you 👇</div>
            {[
              { label:"Your name", val:nameVal, set:setNameVal, type:"text", ph:"e.g. Sarah" },
              { label:"Your email", val:emailVal, set:setEmailVal, type:"email", ph:"so we can reply to you" },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize:12, fontWeight:600, color:"#0b6630", marginBottom:6 }}>{f.label}</div>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && nameVal.trim() && emailVal.trim() && setStep("chat")}
                  placeholder={f.ph}
                  style={{ width:"100%", boxSizing:"border-box", border:"1.5px solid rgba(168,224,44,0.5)", borderRadius:12, padding:"11px 14px", fontSize:13.5, background:"rgba(255,255,255,0.55)", outline:"none", color:"#000" }} />
              </div>
            ))}
            <button onClick={() => { if (nameVal.trim() && emailVal.trim()) setStep("chat"); }}
              disabled={!nameVal.trim() || !emailVal.trim()}
              style={{ marginTop:4, padding:"12px 0", borderRadius:14, border:"none", background:"linear-gradient(135deg,#3d9b73,#2a6b4f)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", opacity:(!nameVal.trim()||!emailVal.trim())?0.5:1 }}>
              Start Chat →
            </button>
          </div>
        )}

        {step === "chat" && (<>
          <div style={{ flex:1, overflowY:"auto", padding:18, display:"flex", flexDirection:"column", gap:12 }}>
            {messages.map(msg => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} style={{ display:"flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth:"78%", padding:"12px 16px", borderRadius:20, fontSize:13.5, lineHeight:1.5, wordBreak:"break-word", background: isUser ? "linear-gradient(135deg,#0b6630,#2d6b50)" : "rgba(255,255,255,0.6)", color: isUser ? "#f5e642" : "#1a3329", borderBottomRightRadius: isUser ? 4 : 20, borderBottomLeftRadius: !isUser ? 4 : 20, border: !isUser ? "1px solid rgba(168,224,44,0.3)" : "none", boxShadow: isUser ? "0 4px 16px rgba(11,102,48,0.3)" : "0 2px 12px rgba(15,89,47,0.08)" }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div style={{ display:"flex", justifyContent:"flex-start" }}>
                <div style={{ padding:"10px 14px", borderRadius:18, background:"rgba(255,255,255,0.55)", fontSize:13, color:"#1a3329" }}>Typing…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:16, display:"flex", gap:10, borderTop:"1px solid rgba(0,168,84,0.12)", background:"rgba(255,255,255,0.12)" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Write your message…"
              style={{ flex:1, border:"1.5px solid rgba(168,224,44,0.4)", borderRadius:16, padding:"12px 16px", fontSize:13.5, background:"rgba(255,255,255,0.45)", outline:"none", color:"#000" }} />
            <button onClick={handleSend} disabled={sending || !input.trim()}
              style={{ minWidth:50, border:"none", borderRadius:16, background:"linear-gradient(135deg,#3d9b73,#2a6b4f)", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 18px rgba(45,107,80,0.3)", opacity:(sending||!input.trim())?0.6:1 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </>)}
      </div>
    </div>
  );
}

