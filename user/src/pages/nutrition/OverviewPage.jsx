import { useAuth } from "../../context/Authcontext";
import { useEffect, useState } from "react";

const API_URL = "https://chrysalise-server.onrender.com";

const GlassCard = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    borderTop:    "1.5px solid rgba(168,224,44,0.85)",
    borderLeft:   "1.5px solid rgba(168,224,44,0.85)",
    borderBottom: "1.5px solid rgba(0,168,84,0.75)",
    borderRight:  "1.5px solid rgba(0,168,84,0.75)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(15,89,47,0.10), inset 0 0 12px rgba(255,255,255,0.5)",
    transition: "all 0.3s ease",
    ...style,
  }}>
    {children}
  </div>
);

export default function OverviewPage() {
  const { user } = useAuth();

  const [stats,   setStats]   = useState({ patients: 0, plans: 0, sessions: 0, scheduled: 0 });
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [sessionsRes, plansRes, subsRes] = await Promise.all([
          fetch(`${API_URL}/sessions/mine`,           { credentials: "include" }),
          fetch(`${API_URL}/plans/mine`,              { credentials: "include" }),
          fetch(`${API_URL}/subscriptions/nutrition`, { credentials: "include" }),
        ]);
        const sessionsData = await sessionsRes.json();
        const plansData    = await plansRes.json();
        const subsData     = await subsRes.json();

        const sessionsArr = sessionsData.sessions    ?? [];
        const plansArr    = plansData.plans          ?? [];
        const subsArr     = subsData.subscriptions   ?? [];

        const today = new Date().toDateString();
        const todaySessions = sessionsArr.filter(s =>
          s.sessionDate && new Date(s.sessionDate).toDateString() === today
        );

        setStats({
          patients:  subsArr.length,
          plans:     plansArr.length,
          sessions:  todaySessions.length,
          scheduled: sessionsArr.filter(s => s.status === "SCHEDULED").length,
        });

        setSessions(
          sessionsArr
            .filter(s => s.status === "SCHEDULED")
            .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))
            .slice(0, 5)
        );
      } catch (err) {
        console.error("❌ Overview error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(168,224,44,0.2)", borderTop: "3px solid #0b6630", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const STATS = [
    { value: stats.patients,  label: "Active Patients",    icon: "🧑‍⚕️", accent: "#0b6630",  bg: "rgba(11,102,48,0.12)"   },
    { value: stats.plans,     label: "Diet Plans",         icon: "🥗",    accent: "#1a6fa0",  bg: "rgba(26,111,160,0.12)"  },
    { value: stats.scheduled, label: "Scheduled Sessions", icon: "📅",    accent: "#b8a200",  bg: "rgba(184,162,0,0.12)"   },
    { value: stats.sessions,  label: "Today's Sessions",   icon: "⚡",    accent: "#7a3fa0",  bg: "rgba(122,63,160,0.12)"  },
  ];

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .ov-card { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(15,89,47,0.18) !important; }
        .session-row:hover { background: rgba(255,255,255,0.45) !important; }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="ov-card" style={{
        background: "linear-gradient(135deg,#0b6630 0%,#2d6b50 55%,#1a5e3a 100%)",
        borderRadius: 24, padding: "28px 32px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
        boxShadow: "0 12px 40px rgba(11,102,48,0.3)",
        border: "1.5px solid rgba(168,224,44,0.3)",
      }}>
        {/* Dot pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(168,224,44,0.08) 1.5px,transparent 1.5px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
        {/* Glow orbs */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(168,224,44,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 100, bottom: -60, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>{greeting()}</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 10 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,224,44,0.15)", border: "1px solid rgba(168,224,44,0.3)", borderRadius: 999, padding: "5px 14px", fontSize: 12.5, fontWeight: 600, color: "#a8e02c", fontFamily: "'Inter',sans-serif" }}>
              📅 {stats.sessions} session{stats.sessions !== 1 ? "s" : ""} today
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, padding: "5px 14px", fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "'Inter',sans-serif" }}>
              🧑‍⚕️ {stats.patients} active patient{stats.patients !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div style={{ position: "relative", zIndex: 1, width: 68, height: 68, borderRadius: "50%", background: "rgba(168,224,44,0.15)", border: "2.5px solid rgba(168,224,44,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: "#a8e02c", backdropFilter: "blur(8px)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", flexShrink: 0 }}>
          {user?.image
            ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            : `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase()
          }
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {STATS.map((s, i) => (
          <div key={s.label} className="ov-card stat-card" style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            borderTop:    "1.5px solid rgba(168,224,44,0.85)",
            borderLeft:   "1.5px solid rgba(168,224,44,0.85)",
            borderBottom: "1.5px solid rgba(0,168,84,0.75)",
            borderRight:  "1.5px solid rgba(0,168,84,0.75)",
            borderRadius: 20, padding: "20px 18px",
            boxShadow: "0 8px 32px rgba(15,89,47,0.10), inset 0 0 12px rgba(255,255,255,0.5)",
            animationDelay: `${i * 0.07}s`,
            transition: "all 0.25s ease",
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
              {s.icon}
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 30, fontWeight: 800, color: s.accent, lineHeight: 1, marginBottom: 5 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Upcoming Sessions ── */}
      <GlassCard className="ov-card" style={{ padding: "22px 24px", animationDelay: "0.28s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329" }}>
            Upcoming Sessions
          </div>
          <span style={{ background: "#0b6630", color: "#a8e02c", borderRadius: 999, padding: "4px 12px", fontSize: 11.5, fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>
            {stats.scheduled} scheduled
          </span>
        </div>

        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, color: "#1a3329", marginBottom: 4 }}>No upcoming sessions</div>
            <div style={{ fontSize: 13, color: "#9ab8ae", fontFamily: "'Inter',sans-serif" }}>Your scheduled sessions will appear here.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s, i) => {
              const name = s.patient
                ? `${s.patient.firstName ?? ""} ${s.patient.lastName ?? ""}`.trim()
                : "Unknown";
              const initials  = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
              const offerName = s.subscription?.offer?.name ?? "Session";

              return (
                <div key={s.id ?? i} className="session-row" style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "rgba(255,255,255,0.3)", backdropFilter: "blur(8px)",
                  borderRadius: 14, padding: "12px 14px",
                  border: "1px solid rgba(168,224,44,0.2)",
                  transition: "all 0.2s ease",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,#0b6630,#2d6b50)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 800,
                    color: "#a8e02c",
                  }}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329", marginBottom: 2, fontFamily: "'Inter',sans-serif" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>{offerName} · Session {s.sessionNumber ?? 1}</div>
                  </div>

                  {/* Date + Zoom */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a3329", marginBottom: 5, fontFamily: "'Inter',sans-serif" }}>
                      {fmtDate(s.sessionDate)}
                    </div>
                    {s.zoomLink && (
                      <a href={s.zoomLink} target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 12px",
                        background: "linear-gradient(135deg,#2d8cff,#0e71eb)",
                        color: "#fff", borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                        textDecoration: "none", fontFamily: "'Inter',sans-serif",
                        boxShadow: "0 2px 8px rgba(45,140,255,0.3)",
                      }}>
                        🎥 Join
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
