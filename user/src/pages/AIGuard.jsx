// ============================================================
// AIGuard.jsx — ضعيه في نفس مجلد CaloriesAI.jsx
// استخدميه هكذا في App.jsx أو router:
//
// <Route path="/calories-ai" element={
//   <AIGuard><CaloriesAI /></AIGuard>
// } />
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { useAuth } from "../context/Authcontext";

//useAuth
export default function AIGuard({ children }) {
  const navigate          = useNavigate();
  const { isLoggedIn }    = useAuth();
  const [status, setStatus] = useState("checking"); // checking | allowed | denied

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: "/calories-ai" } });
      return;
    }

    (async () => {
      try {
        const res  = await fetch("/api/subscriptions/mine", { credentials: "include" });
        const data = await res.json();
        const subs = data.subscriptions ?? [];
        const now  = new Date();

        const active = subs.find(s =>
          s.status === "ACTIVE" &&
          new Date(s.endDate) > now &&
          ["AI Starter", "AI Pro", "AI Elite"].includes(s.offer?.name)
        );

        if (active) {
          setStatus("allowed");
        } else {
          // Check if free trial expired
          const expiredTrial = subs.find(s =>
            s.offer?.name === "AI Starter" &&
            new Date(s.endDate) <= now
          );

          if (expiredTrial) {
            setStatus("trial-expired");
          } else {
            setStatus("denied");
          }
        }
      } catch {
        setStatus("denied");
      }
    })();
  }, [isLoggedIn]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === "checking") {
    return (
      <div style={{ minHeight:"100vh", background:"#080e1a", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:48, height:48, border:"3px solid rgba(0,245,160,0.2)", borderTop:"3px solid #00f5a0", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>Checking access…</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Trial expired ────────────────────────────────────────────────────────
  if (status === "trial-expired") {
    return (
      <div style={{ minHeight:"100vh", background:"#080e1a", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ maxWidth:440, textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:20 }}>⏱️</div>
          <h2 style={{ fontFamily:"'Cabinet Grotesk',sans-serif", fontSize:32, fontWeight:900, color:"#fff", marginBottom:12, letterSpacing:-1 }}>
            Your free trial has ended
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.8, marginBottom:32 }}>
            You've used your 3-day free trial. Upgrade to Pro or Elite to continue using AI nutrition tracking.
          </p>
          <button
            onClick={() => navigate("/premium")}
            style={{ background:"linear-gradient(135deg,#00f5a0,#00d9f5)", color:"#0a1628", border:"none", borderRadius:16, padding:"14px 36px", fontSize:15, fontWeight:800, cursor:"pointer", fontFamily:"'Cabinet Grotesk',sans-serif" }}
          >
            View Plans →
          </button>
        </div>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@900&display=swap');`}</style>
      </div>
    );
  }

  // ── No subscription ──────────────────────────────────────────────────────
  if (status === "denied") {
    navigate("/premium");
    return null;
  }

  // ── Allowed ──────────────────────────────────────────────────────────────
  return children;
}