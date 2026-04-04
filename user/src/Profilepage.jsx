import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "./AuthContext";

/* ─────────────────────────────── CSS ─────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

*{box-sizing:border-box;}

@keyframes fadeUp  {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn  {from{opacity:0}to{opacity:1}}
@keyframes popIn   {from{opacity:0;transform:scale(0.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes slideIn {from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideUp {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse   {0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.15)}}
@keyframes float   {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes spinIn  {from{opacity:0;transform:rotate(-8deg) scale(0.85)}to{opacity:1;transform:rotate(0) scale(1)}}
@keyframes shimmer {from{background-position:-400px 0}to{background-position:400px 0}}
@keyframes spin    {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.pr-fade-up  {animation:fadeUp  0.6s cubic-bezier(0.22,1,0.36,1) both}
.pr-pop-in   {animation:popIn   0.38s cubic-bezier(0.34,1.4,0.64,1) both}
.pr-slide-in {animation:slideIn 0.42s cubic-bezier(0.22,1,0.36,1) both}
.pr-slide-up {animation:slideUp 0.42s cubic-bezier(0.22,1,0.36,1) both}

.pr-card{
  background:#fff;border-radius:20px;padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);
  transition:box-shadow 0.25s ease;
}
.pr-card:hover{box-shadow:0 4px 24px rgba(26,51,41,0.1);}

.pr-input{
  width:100%;border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  padding:10px 13px;font-size:13.5px;font-family:'DM Sans',sans-serif;
  color:#1a3329;background:#f7faf8;outline:none;
  transition:all 0.2s ease;box-sizing:border-box;resize:none;
}
.pr-input:focus{border-color:#4f9e7a;background:#fff;box-shadow:0 0 0 3px rgba(79,158,122,0.1);}
.pr-input::placeholder{color:#9ab8ae;}

.pr-save-btn{
  background:linear-gradient(135deg,#1a3329,#2d6b50);color:#f5e642;
  border:none;border-radius:10px;padding:10px 22px;font-size:13px;
  font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;
  transition:all 0.22s ease;display:inline-flex;align-items:center;gap:6px;
}
.pr-save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(26,51,41,0.28);}
.pr-save-btn:active{transform:translateY(0);}
.pr-save-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none;}

.pr-field{
  background:#f7faf8;border-radius:10px;padding:11px 14px;
  border:1.5px solid rgba(79,158,122,0.08);transition:all 0.2s ease;
  font-size:14px;color:#1a3329;font-weight:500;min-height:40px;
}
.pr-field:hover{border-color:rgba(79,158,122,0.2);}
.pr-field.empty{color:#c0d0c8;font-style:italic;}

.pr-notif{
  display:flex;gap:12px;padding:13px 15px;border-radius:14px;
  transition:all 0.2s ease;cursor:pointer;border:1px solid transparent;
}
.pr-notif:hover{background:#f4faf7;}

.pr-bubble-me{
  background:linear-gradient(135deg,#1a3329,#2d6b50);color:#fff;
  border-radius:18px 18px 4px 18px;padding:10px 14px;font-size:13.5px;
  line-height:1.55;max-width:80%;align-self:flex-end;
  animation:popIn 0.22s ease;box-shadow:0 3px 10px rgba(26,51,41,0.18);
}
.pr-bubble-doc{
  background:#f0f7f4;color:#1a3329;
  border-radius:18px 18px 18px 4px;padding:10px 14px;font-size:13.5px;
  line-height:1.55;max-width:80%;align-self:flex-start;
  animation:popIn 0.22s ease;border:1px solid rgba(79,158,122,0.12);
}

.pr-fab{
  position:fixed;bottom:28px;right:28px;z-index:500;
  width:56px;height:56px;border-radius:50%;
  background:linear-gradient(135deg,#1a3329,#2d6b50);border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 22px rgba(26,51,41,0.38);transition:all 0.22s ease;
  animation:float 3.5s ease-in-out infinite;
}
.pr-fab:hover{transform:scale(1.08)!important;animation:none;box-shadow:0 10px 28px rgba(26,51,41,0.45);}

.pr-sidebar{
  width:228px;flex-shrink:0;background:#fff;border-radius:20px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);padding:18px 10px;
  height:fit-content;position:sticky;top:24px;
}
.pr-sb-section{
  font-size:10px;font-weight:700;color:#9ab8ae;
  letter-spacing:1.1px;text-transform:uppercase;
  padding:4px 12px;margin:10px 0 3px;
}
.pr-sb-item{
  display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;
  font-size:13px;font-weight:600;color:#3d6b57;cursor:pointer;
  border:none;background:transparent;font-family:'DM Sans',sans-serif;
  width:100%;text-align:left;transition:all 0.18s ease;
}
.pr-sb-item:hover{background:#f0f7f4;color:#1a3329;}
.pr-sb-item.active{background:linear-gradient(135deg,#1a3329,#2d6b50);color:#f5e642;}
.pr-sb-item.active svg{stroke:#f5e642!important;}

.pr-prog-track{height:7px;background:#eef4f1;border-radius:999px;overflow:hidden;margin-top:6px;}
.pr-prog-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#3d9b73,#f5e642);transition:width 0.8s cubic-bezier(0.22,1,0.36,1);}

.pr-onboard{
  background:linear-gradient(135deg,#f0fdf7,#e8f5f0);
  border:1.5px dashed rgba(79,158,122,0.35);border-radius:16px;
  padding:18px 22px;margin-bottom:20px;display:flex;align-items:center;gap:14px;
  animation:slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}

.pr-tab{
  padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;
  cursor:pointer;border:none;font-family:'DM Sans',sans-serif;
  transition:all 0.2s ease;white-space:nowrap;display:flex;align-items:center;gap:5px;
}

.pr-chatroom-overlay{
  position:fixed;inset:0;z-index:800;background:rgba(10,20,16,0.55);
  backdrop-filter:blur(4px);display:flex;align-items:flex-end;justify-content:center;
  animation:fadeIn 0.25s ease;
}
.pr-chatroom-box{
  width:100%;max-width:520px;background:#fff;
  border-radius:28px 28px 0 0;
  box-shadow:0 -8px 48px rgba(0,0,0,0.18);overflow:hidden;
  animation:slideUp 0.38s cubic-bezier(0.22,1,0.36,1);
  display:flex;flex-direction:column;height:88vh;max-height:600px;
}

.pr-divider{height:1px;background:rgba(79,158,122,0.08);margin:4px 0;}

@media(min-width:640px){
  .pr-chatroom-overlay{align-items:center;}
  .pr-chatroom-box{border-radius:28px;height:auto;max-height:640px;}
}
@media(max-width:767px){
  .pr-sidebar{display:none;}
}
@media(min-width:768px){
  .pr-mobile-tabs{display:none!important;}
}
`;

/* ─────────── Data ─────────── */
const MOCK_PLAN = {
  name: "Premium Health Plan",
  specialist: "Dr. Sarah Mitchell", specialistTitle: "Clinical Nutritionist",
  specialistAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
  startDate: "Feb 2026", endDate: "May 2026", goal: "Weight Management",
  status: "Active", progress: 65,
};
const MOCK_NOTIFS = [
  { id: 1, text: "Dr. Sarah sent you a new meal plan for this week.", date: "2h ago", read: false, type: "plan" },
  { id: 2, text: "Your weekly check-in is scheduled for tomorrow at 10:00 AM.", date: "5h ago", read: false, type: "appointment" },
  { id: 3, text: "You've completed 80% of your nutrition goals this week!", date: "1d ago", read: true, type: "achievement" },
  { id: 4, text: "New blog post: '10 Foods That Boost Your Metabolism'.", date: "2d ago", read: true, type: "blog" },
];
const NOTIF_META = {
  plan: { icon: "📋", color: "#2d7a4f", bg: "#e8f5e9", label: "Plan Update" },
  appointment: { icon: "📅", color: "#1a6fa0", bg: "#e3f2fd", label: "Appointment" },
  achievement: { icon: "🏆", color: "#b8a200", bg: "#fefde8", label: "Achievement" },
  blog: { icon: "📝", color: "#7a3fa0", bg: "#f3e8fd", label: "Blog" },
};
const CHAT_RESPONSES = [
  "Hello! How are you feeling today?",
  "I've reviewed your latest logs — great progress this week!",
  "Remember to stay hydrated — at least 8 glasses a day.",
  "Your next check-in is tomorrow. Looking forward to it!",
  "Small consistent steps lead to lasting results. Keep it up!",
  "How's your sleep been lately? Rest is key to recovery.",
];

/* ─────────── Helpers ─────────── */
const Stars = ({ n }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= n ? "#f5a623" : "#ddd", fontSize: 12 }}>★</span>)}
  </div>
);

function SectionTitle({ icon, bg, title }) {
  return (
    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icon}</div>
      {title}
    </div>
  );
}

function Field({ label, val, editing, field, setForm, type = "text", options, placeholder = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, color: "#4f9e7a", letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>
      {editing
        ? options
          ? <select className="pr-input" value={val} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}>
            <option value="">Select…</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
          : <input className="pr-input" type={type} value={val} placeholder={placeholder || label}
            onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
        : <div className={`pr-field${!val ? " empty" : ""}`}>{val || "Not set"}</div>
      }
    </div>
  );
}

/* ─────────── Chat Room ─────────── */
function ChatRoom({ plan, onClose }) {
  const [msgs, setMsgs] = useState([{ id: 1, from: "doc", text: `Hi! I'm ${plan.specialist}. How can I help you today?` }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { id: Date.now(), from: "me", text: input }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs(m => [...m, { id: Date.now() + 1, from: "doc", text: CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)] }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }, 1300);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="pr-chatroom-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pr-chatroom-box">
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
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10, background: "#fafcfb" }}>
          {msgs.map(m => (
            <div key={m.id} className={m.from === "me" ? "pr-bubble-me" : "pr-bubble-doc"}>{m.text}</div>
          ))}
          {typing && (
            <div className="pr-bubble-doc" style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 16px" }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#4f9e7a", display: "inline-block", animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />)}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(79,158,122,0.1)", display: "flex", gap: 8, flexShrink: 0, background: "#fff" }}>
          <input className="pr-input" placeholder="Type a message…" value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            style={{ flex: 1, padding: "9px 12px", fontSize: 13 }} />
          <button onClick={send} style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", border: "none", borderRadius: 10, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Sidebar ─────────── */
const SbIco = {
  user: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d6b57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  chat: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d6b57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  plan: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d6b57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  prog: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d6b57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  bell: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d6b57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
};

function Sidebar({ active, setActive, unread, onChatOpen }) {
  const sections = [
    { label: "ACCOUNT", items: [{ key: "info", label: "Profile", icon: SbIco.user }] },
    { label: "CONSULTATIONS", items: [{ key: "chatroom", label: "Chat Room", icon: SbIco.chat, badge: unread || null, action: "chat" }] },
    {
      label: "MY PLAN", items: [
        { key: "plan", label: "My Diet Plan", icon: SbIco.plan },
        { key: "progress", label: "Progress Monitoring", icon: SbIco.prog },
      ]
    },
    { label: "OTHER", items: [{ key: "notifs", label: "Notifications", icon: SbIco.bell, badge: unread || null }] },
  ];

  return (
    <div className="pr-sidebar">
      {sections.map((s, si) => (
        <div key={s.label}>
          {si > 0 && <div className="pr-divider" />}
          <div className="pr-sb-section">{s.label}</div>
          {s.items.map(({ key, label, icon, badge, action }) => (
            <button key={key}
              className={`pr-sb-item${active === key && !action ? " active" : ""}`}
              onClick={() => action === "chat" ? onChatOpen() : setActive(key)}>
              {icon}
              <span style={{ flex: 1 }}>{label}</span>
              {badge > 0 && (
                <span style={{ background: active === key && !action ? "#f5e642" : "#1a3329", color: active === key && !action ? "#1a3329" : "#f5e642", borderRadius: 999, padding: "1px 7px", fontSize: 10, fontWeight: 800, minWidth: 18, textAlign: "center" }}>{badge}</span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─────────── Progress Tab ─────────── */
function ProgressTab({ form, plan }) {
  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1) : null;

  const stats = [
    { label: "Weight", val: form.weight ? `${form.weight} kg` : "—", icon: "⚖️", color: "#1a6fa0", bg: "#e3f2fd" },
    { label: "Height", val: form.height ? `${form.height} cm` : "—", icon: "📏", color: "#2d7a4f", bg: "#e8f5e9" },
    { label: "BMI", val: bmi || "—", icon: "🔬", color: "#7a3fa0", bg: "#f3e8fd" },
    { label: "Goal", val: form.goal || "—", icon: "🎯", color: "#b8a200", bg: "#fefde8" },
  ];

  const weekData = [
    { day: "Mon", cal: 1820 }, { day: "Tue", cal: 1650 }, { day: "Wed", cal: 1900 },
    { day: "Thu", cal: 1740 }, { day: "Fri", cal: 1680 }, { day: "Sat", cal: 2100 }, { day: "Sun", cal: 1580 },
  ];
  const target = 1800;
  const maxCal = Math.max(...weekData.map(d => d.cal));

  return (
    <div className="pr-slide-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} className="pr-card" style={{ padding: "16px" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9ab8ae", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {plan && (
        <div className="pr-card">
          <SectionTitle bg="#e8f5e9" title="Plan Progress" icon="📈" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, color: "#5a7a6e" }}>{plan.startDate} → {plan.endDate}</span>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#2d7a4f" }}>{plan.progress}%</span>
          </div>
          <div className="pr-prog-track"><div className="pr-prog-fill" style={{ width: `${plan.progress}%` }} /></div>
          <div style={{ fontSize: 11.5, color: "#9ab8ae", marginTop: 7 }}>Goal: {plan.goal}</div>
        </div>
      )}

      <div className="pr-card">
        <SectionTitle bg="#fefde8" title="Weekly Calories" icon="🔥" />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
          {weekData.map(d => {
            const over = d.cal > target;
            return (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9.5, color: over ? "#c0392b" : "#2d7a4f", fontWeight: 700, textAlign: "center" }}>{d.cal}</div>
                <div style={{
                  width: "100%", borderRadius: "5px 5px 0 0", height: `${(d.cal / maxCal) * 80}px`,
                  background: over ? "linear-gradient(180deg,#f5b8b8,#e88)" : "linear-gradient(180deg,#3d9b73,#2d6b50)",
                  transition: "height 0.6s ease"
                }} />
                <div style={{ fontSize: 10.5, color: "#9ab8ae", fontWeight: 600 }}>{d.day}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 12, padding: "9px 12px", background: "#f7faf8", borderRadius: 9 }}>
          {[["#2d6b50", "Under target"], ["#e88", "Over target"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#5a7a6e" }}>
              <div style={{ width: 9, height: 9, borderRadius: 3, background: c }} />{l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const avatarRef = useRef(null);

  const isFirstTime = !user?.firstName;

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age || "",
    gender: user?.gender || "Female",
    weight: user?.weight || "",
    height: user?.height || "",
    goal: user?.goal || "",
    activityLevel: user?.activityLevel || "",
    medicalConditions: user?.medicalConditions || "",
    allergies: user?.allergies || "",
  });

  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [editing, setEditing] = useState(isFirstTime);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [notifs, setNotifs] = useState(user?.notifications || MOCK_NOTIFS);
  const [chatOpen, setChatOpen] = useState(false);
  const [visibleCount, setVisible] = useState(4);
  const plan = user?.plan || MOCK_PLAN;
  const unread = notifs.filter(n => !n.read).length;

  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  const mob = w < 768;

  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1) : null;
  const bmiCat = !bmi ? null
    : bmi < 18.5 ? { label: "Underweight", color: "#1a6fa0", pct: 12 }
      : bmi < 25 ? { label: "Normal", color: "#2d7a4f", pct: 38 }
        : bmi < 30 ? { label: "Overweight", color: "#c07a00", pct: 63 }
          : { label: "Obese", color: "#c0392b", pct: 86 };

  const fullName = `${form.firstName} ${form.lastName}`.trim();
  const profileComplete = form.firstName && form.lastName && form.weight && form.height && form.goal;

  const handleAvatar = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => setAvatar(e.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: await fetch("/api/user/profile", { method:"PUT", body:JSON.stringify({...form,avatar}) })
    await new Promise(r => setTimeout(r, 800));
    setSaving(false); setSaved(true); setEditing(false);
    setTimeout(() => setSaved(false), 3500);
  };

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  const MOB_TABS = [
    { key: "info", label: "My Info" },
    { key: "plan", label: "My Plan" },
    { key: "progress", label: "Progress" },
    { key: "notifs", label: unread > 0 ? `Notifs (${unread})` : "Notifs" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f2f7f5", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <Header />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 100%)", padding: mob ? "36px 20px 96px" : "48px 40px 104px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.05) 1.5px,transparent 1.5px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, right: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,230,66,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>
              {isFirstTime ? "Welcome aboard 🌱" : `Member since ${user?.joinDate || "2026"}`}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: mob ? 24 : 32, fontWeight: 800, color: "#fff", letterSpacing: -0.5, lineHeight: 1.2 }}>
              {isFirstTime ? "Let's set up your profile 👋" : `Hello, ${form.firstName || "there"} 👋`}
            </div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.48)", marginTop: 7, lineHeight: 1.6 }}>
              {isFirstTime ? "Fill in your details to personalise your nutrition journey." : "Track your health journey from right here."}
            </div>
          </div>
          {plan && !isFirstTime && (
            <div style={{ background: "rgba(245,230,66,0.1)", border: "1px solid rgba(245,230,66,0.22)", borderRadius: 14, padding: "10px 16px", display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642", animation: "pulse 2s ease infinite", display: "inline-block" }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#f5e642" }}>{plan.name} · Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "-56px auto 0", padding: mob ? "0 14px 80px" : "0 30px 90px", position: "relative", zIndex: 2 }}>

        {/* Top card */}
        <div className="pr-card pr-fade-up" style={{ marginBottom: 20, display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "flex-start" : "center", gap: 20, padding: "20px 22px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 78, height: 78, borderRadius: "50%", background: avatar ? "transparent" : "linear-gradient(135deg,#1a3329,#2d6b50)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 4px 16px rgba(26,51,41,0.16)", border: "3px solid rgba(245,230,66,0.28)" }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f5e642" }}>{form.firstName?.[0] || "?"}</span>}
            </div>
            <button onClick={() => avatarRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#f5e642", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a3329" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatar(e.target.files[0])} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: mob ? 17 : 20, fontWeight: 800, color: "#1a3329" }}>
              {fullName || <span style={{ color: "#9ab8ae", fontStyle: "italic" }}>Complete your profile</span>}
            </div>
            {!isFirstTime && (
              <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                {form.gender && <span style={{ background: "#e8f5e9", color: "#2d7a4f", borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{form.gender}</span>}
                {form.age && <span style={{ background: "#e3f2fd", color: "#1a6fa0", borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>Age {form.age}</span>}
                {form.goal && <span style={{ background: "#fefde8", color: "#b8a200", borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{form.goal}</span>}
                {form.activityLevel && <span style={{ background: "#f3e8fd", color: "#7a3fa0", borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{form.activityLevel}</span>}
                {bmiCat && <span style={{ background: "#f7faf8", color: bmiCat.color, borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>BMI {bmi} · {bmiCat.label}</span>}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {editing ? (
              <>
                {!isFirstTime && (
                  <button onClick={() => setEditing(false)} style={{ background: "transparent", border: "1.5px solid rgba(79,158,122,0.22)", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: "#5a7a6e", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
                )}
                <button className="pr-save-btn" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><span style={{ width: 12, height: 12, border: "2px solid rgba(245,230,66,0.4)", borderTopColor: "#f5e642", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Saving…</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Save Profile</>
                  }
                </button>
              </>
            ) : (
              <button className="pr-save-btn" onClick={() => setEditing(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success */}
        {saved && (
          <div style={{ background: "#e8f5e9", border: "1px solid rgba(45,122,79,0.18)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13.5, fontWeight: 600, color: "#2d7a4f", display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.3s ease" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Profile saved successfully!
          </div>
        )}

        {/* First-time banner */}
        {isFirstTime && editing && (
          <div className="pr-onboard">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#d4eddf", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🌟</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a5e3a", marginBottom: 2 }}>Welcome! Let's personalise your experience.</div>
              <div style={{ fontSize: 12.5, color: "#4a8a68", lineHeight: 1.6 }}>Fill in your details below and tap <strong>Save Profile</strong>. This helps us tailor your nutrition plan perfectly.</div>
            </div>
          </div>
        )}

        {/* Sidebar + Content */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <Sidebar active={activeTab} setActive={setActiveTab} unread={unread} onChatOpen={() => setChatOpen(true)} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Mobile tabs */}
            <div className="pr-mobile-tabs" style={{ display: "flex", gap: 5, marginBottom: 16, background: "#fff", borderRadius: 999, padding: "4px 5px", boxShadow: "0 2px 10px rgba(26,51,41,0.07)", overflowX: "auto" }}>
              {MOB_TABS.map(t => (
                <button key={t.key} className="pr-tab" onClick={() => setActiveTab(t.key)}
                  style={{ background: activeTab === t.key ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "transparent", color: activeTab === t.key ? "#f5e642" : "#5a7a6e", flexShrink: 0 }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* MY INFO */}
            {activeTab === "info" && (
              <div className="pr-slide-in" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16 }}>
                <div className="pr-card">
                  <SectionTitle bg="#e8f5e9" title="Personal Info" icon="👤" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Field label="First Name" val={form.firstName} editing={editing} field="firstName" setForm={setForm} placeholder="Yasmine" />
                      <Field label="Last Name" val={form.lastName} editing={editing} field="lastName" setForm={setForm} placeholder="Benali" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Field label="Age" val={form.age} editing={editing} field="age" setForm={setForm} type="number" placeholder="27" />
                      <Field label="Gender" val={form.gender} editing={editing} field="gender" setForm={setForm} options={["Female", "Male", "Other"]} />
                    </div>
                  </div>
                </div>

                <div className="pr-card">
                  <SectionTitle bg="#e3f2fd" title="Health Details" icon="❤️" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Field label="Weight (kg)" val={form.weight} editing={editing} field="weight" setForm={setForm} type="number" placeholder="62" />
                      <Field label="Height (cm)" val={form.height} editing={editing} field="height" setForm={setForm} type="number" placeholder="165" />
                    </div>
                    <Field label="Medical Conditions" val={form.medicalConditions} editing={editing} field="medicalConditions" setForm={setForm} placeholder="None" />
                    <Field label="Allergies" val={form.allergies} editing={editing} field="allergies" setForm={setForm} placeholder="e.g. Lactose intolerance" />
                  </div>
                </div>

                <div className="pr-card">
                  <SectionTitle bg="#fefde8" title="Goals & Activity" icon="🎯" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Field label="My Goal" val={form.goal} editing={editing} field="goal" setForm={setForm}
                      options={["Weight Loss", "Weight Gain", "Muscle Gain", "Maintain Weight", "Improve Health", "Manage Diabetes", "Other"]} />
                    <Field label="Activity Level" val={form.activityLevel} editing={editing} field="activityLevel" setForm={setForm}
                      options={["Sedentary", "Light", "Moderate", "Active", "Very Active"]} />
                  </div>
                </div>

                {bmi && bmiCat && (
                  <div className="pr-card">
                    <SectionTitle bg="#f3e8fd" title="BMI Overview" icon="🔬" />
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 44, fontWeight: 800, color: bmiCat.color, lineHeight: 1, animation: "spinIn 0.5s ease" }}>{bmi}</div>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: bmiCat.color, marginTop: 4 }}>{bmiCat.label}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 130 }}>
                        <div style={{ height: 10, background: "linear-gradient(90deg,#1a6fa0,#2d7a4f,#c07a00,#c0392b)", borderRadius: 999, position: "relative", marginBottom: 8 }}>
                          <div style={{ position: "absolute", top: "50%", left: `${bmiCat.pct}%`, transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "#fff", border: `3px solid ${bmiCat.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ab8ae", fontWeight: 600 }}>
                          <span>&lt;18.5</span><span>18.5–25</span><span>25–30</span><span>&gt;30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile incomplete warning */}
                {!profileComplete && !editing && (
                  <div style={{ gridColumn: "1/-1", background: "#fefde8", border: "1px solid rgba(184,162,0,0.2)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#8a7200", marginBottom: 2 }}>Profile incomplete</div>
                      <div style={{ fontSize: 12.5, color: "#b8a200" }}>Add your weight, height and goal to get personalised recommendations.</div>
                    </div>
                    <button onClick={() => setEditing(true)} style={{ background: "#b8a200", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>Complete →</button>
                  </div>
                )}
              </div>
            )}

            {/* MY PLAN */}
            {activeTab === "plan" && (
              <div className="pr-slide-in" style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16 }}>
                <div className="pr-card" style={{ background: "linear-gradient(135deg,#1a3329,#243f32)", border: "none" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Active Plan</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.26)", borderRadius: 999, padding: "4px 12px", fontSize: 11.5, fontWeight: 700, color: "#f5e642", marginBottom: 18 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5e642", animation: "pulse 2s ease infinite", display: "inline-block" }} />
                    {plan.status}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(255,255,255,0.42)", marginBottom: 5 }}>
                      <span>Progress</span><span style={{ color: "#f5e642", fontWeight: 700 }}>{plan.progress}%</span>
                    </div>
                    <div className="pr-prog-track" style={{ background: "rgba(255,255,255,0.1)" }}>
                      <div className="pr-prog-fill" style={{ width: `${plan.progress}%` }} />
                    </div>
                  </div>
                  {[["Goal", plan.goal], ["Started", plan.startDate], ["Ends", plan.endDate]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 13 }}>
                      <span style={{ color: "rgba(255,255,255,0.38)" }}>{k}</span>
                      <span style={{ color: "#fff", fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div className="pr-card">
                  <SectionTitle bg="#e8f5e9" title="Your Specialist" icon="👩‍⚕️" />
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, padding: 12, background: "#f7faf8", borderRadius: 14 }}>
                    <div style={{ position: "relative" }}>
                      <img src={plan.specialistAvatar} alt="" style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(79,158,122,0.18)" }} />
                      <span style={{ position: "absolute", bottom: 2, right: 2, width: 11, height: 11, borderRadius: "50%", background: "#4ade80", border: "2px solid #fff" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>{plan.specialist}</div>
                      <div style={{ fontSize: 11.5, color: "#4f9e7a", fontWeight: 600, marginTop: 2 }}>{plan.specialistTitle}</div>
                      <Stars n={5} />
                    </div>
                  </div>
                  <button onClick={() => setChatOpen(true)} style={{ width: "100%", background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(26,51,41,0.22)", transition: "all 0.2s" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    Message {plan.specialist.split(" ")[1]}
                  </button>
                </div>
              </div>
            )}

            {/* PROGRESS */}
            {activeTab === "progress" && <ProgressTab form={form} plan={plan} />}

            {/* NOTIFICATIONS */}
            {activeTab === "notifs" && (
              <div className="pr-slide-in">
                <div className="pr-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329", display: "flex", alignItems: "center", gap: 9 }}>
                      Notifications
                      {unread > 0 && <span style={{ background: "#f5e642", color: "#1a3329", borderRadius: 999, padding: "2px 8px", fontSize: 10.5, fontWeight: 800 }}>{unread} new</span>}
                    </div>
                    {unread > 0 && <button onClick={markAll} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "#4f9e7a", fontFamily: "'DM Sans',sans-serif" }}>Mark all read</button>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {notifs.slice(0, visibleCount).map(n => {
                      const m = NOTIF_META[n.type] || NOTIF_META.blog;
                      return (
                        <div key={n.id} className="pr-notif"
                          style={{ background: n.read ? "transparent" : "rgba(245,230,66,0.04)", border: `1px solid ${n.read ? "transparent" : "rgba(245,230,66,0.15)"}` }}
                          onClick={() => setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{m.icon}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: m.color, background: m.bg, borderRadius: 999, padding: "2px 7px" }}>{m.label}</span>
                              <span style={{ fontSize: 11, color: "#9ab8ae", flexShrink: 0 }}>{n.date}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "#1a3329", fontWeight: n.read ? 400 : 600, lineHeight: 1.5 }}>{n.text}</div>
                          </div>
                          {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642", flexShrink: 0, marginTop: 8 }} />}
                        </div>
                      );
                    })}
                  </div>
                  {notifs.length > visibleCount && (
                    <button onClick={() => setVisible(v => v + 3)} style={{ width: "100%", marginTop: 12, background: "transparent", border: "1.5px solid rgba(79,158,122,0.18)", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 600, color: "#4f9e7a", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      Load more
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      {plan && (
        <button className="pr-fab" onClick={() => setChatOpen(o => !o)}>
          {chatOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
          {!chatOpen && unread > 0 && (
            <div style={{ position: "absolute", top: -3, right: -3, width: 17, height: 17, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, fontWeight: 800, color: "#1a3329", border: "2px solid #fff" }}>{unread}</div>
          )}
        </button>
      )}

      {chatOpen && plan && <ChatRoom plan={plan} onClose={() => setChatOpen(false)} />}
    </div>
  );
}