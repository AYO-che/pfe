import { useAuth } from "../../context/Authcontext";
import { CSS, MOCK_PLAN, Stars } from "./Shared";
import ChatRoom from "./ChatRoom";
import { useState } from "react";

export default function ProfileChatPage() {
  const { user }        = useAuth();
  const plan            = user?.plan || MOCK_PLAN;
  const [open, setOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>Chat Room</div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4 }}>Message your specialist directly.</div>
      </div>

      <div className="pr-card pr-slide-in" style={{ maxWidth: 480 }}>
        {/* Specialist preview */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", background: "#f7faf8", borderRadius: 14, marginBottom: 18 }}>
          <div style={{ position: "relative" }}>
            <img src={plan.specialistAvatar} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(79,158,122,0.18)" }} />
            <span style={{ position: "absolute", bottom: 2, right: 2, width: 13, height: 13, borderRadius: "50%", background: "#4ade80", border: "2px solid #fff" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329" }}>{plan.specialist}</div>
            <div style={{ fontSize: 12, color: "#4f9e7a", fontWeight: 600, marginTop: 2 }}>{plan.specialistTitle}</div>
            <Stars n={5} />
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11.5, fontWeight: 600, color: "#4ade80", background: "#f0fdf4", borderRadius: 999, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />Online
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          style={{ width: "100%", background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(26,51,41,0.22)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          Start Chat
        </button>
      </div>

      {open && <ChatRoom plan={plan} onClose={() => setOpen(false)} />}
    </div>
  );
}