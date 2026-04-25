import { useState } from "react";
import { useAuth } from "../../context/Authcontext";
import { CSS, MOCK_PLAN, Stars, SectionTitle } from "./Shared";
import ChatRoom from "./ChatRoom";
export default function ProfilePlanPage() {
  const { user }        = useAuth();
  const plan            = user?.plan || MOCK_PLAN;
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>My Diet Plan</div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4 }}>Your active nutrition plan and specialist details.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>

        {/* Active Plan Card */}
        <div className="pr-card" style={{ background: "linear-gradient(135deg,#1a3329,#243f32)", border: "none" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Active Plan</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{plan.name}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.26)", borderRadius: 999, padding: "4px 12px", fontSize: 11.5, fontWeight: 700, color: "#f5e642", marginBottom: 18 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5e642", animation: "pulse 2s ease infinite", display: "inline-block" }} />
            {plan.status}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(255,255,255,0.42)", marginBottom: 5 }}>
              <span>Progress</span>
              <span style={{ color: "#f5e642", fontWeight: 700 }}>{plan.progress}%</span>
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

        {/* Specialist Card */}
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
          <button
            onClick={() => setChatOpen(true)}
            style={{ width: "100%", background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(26,51,41,0.22)", transition: "all 0.2s" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            Message {plan.specialist.split(" ")[1]}
          </button>
        </div>
      </div>

      {chatOpen && <ChatRoom plan={plan} onClose={() => setChatOpen(false)} />}
    </div>
  );
}