import { useState, useRef } from "react";
import { CSS, CHAT_RESPONSES } from "./Shared";

export default function ProfileChatRoom({ plan, onClose }) {
  const [msgs, setMsgs]     = useState([{ id: 1, from: "doc", text: `Hi! I'm ${plan.specialist}. How can I help you today?` }]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { id: Date.now(), from: "me", text: input }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now() + 1, from: "doc", text: CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)] }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1300);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <>
      <style>{CSS}</style>
      {/* Overlay */}
      <div
        onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
        style={{ position: "fixed", inset: 0, zIndex: 800, background: "rgba(10,20,16,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.25s ease" }}>
        <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: "28px 28px 0 0", boxShadow: "0 -8px 48px rgba(0,0,0,0.18)", overflow: "hidden", animation: "slideUp 0.38s cubic-bezier(0.22,1,0.36,1)", display: "flex", flexDirection: "column", height: "88vh", maxHeight: 600 }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <img src={plan.specialistAvatar} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
              <span style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#4ade80", border: "2px solid #1a3329" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#fff" }}>{plan.specialist}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)" }}>Online · {plan.specialistTitle}</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, background: "#fafcfb" }}>
            {msgs.map(m => (
              <div key={m.id} className={m.from === "me" ? "pr-bubble-me" : "pr-bubble-doc"}>{m.text}</div>
            ))}
            {typing && (
              <div className="pr-bubble-doc" style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 16px" }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f9e7a", display: "inline-block", animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(79,158,122,0.1)", display: "flex", gap: 8, flexShrink: 0, background: "#fff" }}>
            <input
              className="pr-input"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              style={{ flex: 1, padding: "9px 12px", fontSize: 13 }}
            />
            <button onClick={send} style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", border: "none", borderRadius: 10, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}