import { authFetch } from "../context/Authcontext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://chrysalise-server.onrender.com";

const GlassCard = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    borderTop:    "1.5px solid rgba(168,224,44,0.85)",
    borderLeft:   "1.5px solid rgba(168,224,44,0.85)",
    borderBottom: "1.5px solid rgba(0,168,84,0.75)",
    borderRight:  "1.5px solid rgba(0,168,84,0.75)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(15,89,47,0.10), inset 0 0 12px rgba(255,255,255,0.5)",
    transition: "all 0.25s ease",
    overflow: "hidden",
    ...style,
  }}>
    {children}
  </div>
);

function Avatar({ user, size = 44, radius = 12 }) {
  const [err, setErr] = useState(false);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  if (!user?.image || err) return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: "linear-gradient(135deg,#0b6630,#2d6b50)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',sans-serif", fontSize: size * 0.32, fontWeight: 800,
      color: "#a8e02c",
    }}>{initials}</div>
  );
  return <img src={user.image} alt={initials} onError={() => setErr(true)}
    style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0 }} />;
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE:    { bg: "rgba(11,102,48,0.12)",  color: "#0b6630", label: "Active"    },
    PENDING:   { bg: "rgba(184,162,0,0.12)",  color: "#b8a200", label: "Pending"   },
    CANCELLED: { bg: "rgba(197,48,48,0.1)",   color: "#c53030", label: "Cancelled" },
  };
  const s = map[status] ?? { bg: "rgba(90,122,110,0.1)", color: "#5a7a6e", label: status };
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: s.bg, color: s.color, fontFamily: "'Inter',sans-serif", border: `1px solid ${s.color}22` }}>
      {s.label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Patient Profile Modal ──────────────────────────────────────────────────
function PatientModal({ sub, onClose, navigate }) {
  const patient  = sub.patient;
  const offer    = sub.offer;
  const sessions = sub.sessions ?? [];
  const fullName = `${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`.trim();

  const [notes,     setNotes]     = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [noteMsg,   setNoteMsg]   = useState("");

  useEffect(() => {
    const key   = `note_${patient?.id}`;
    const saved = localStorage.getItem(key) ?? "";
    setNotes(saved); setSavedNote(saved);
  }, [patient?.id]);

  const saveNote = () => {
    setSaving(true);
    localStorage.setItem(`note_${patient?.id}`, notes);
    setSavedNote(notes);
    setTimeout(() => { setSaving(false); setNoteMsg("Note saved!"); setTimeout(() => setNoteMsg(""), 2000); }, 400);
  };

  const profile   = patient?.profile;
  const planStart = sub.startDate ? new Date(sub.startDate) : null;
  const today     = new Date();
  const planDay   = planStart ? Math.max(1, Math.floor((today - planStart) / (1000*60*60*24)) + 1) : null;
  const totalDays = offer?.durationDays ?? null;
  const planPct   = planDay && totalDays ? Math.min(100, Math.round((planDay / totalDays) * 100)) : null;
  const scheduled = sessions.filter(s => s.status === "SCHEDULED").length;
  const completed = sessions.filter(s => s.status === "COMPLETED").length;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(10,26,20,0.65)",
      backdropFilter: "blur(8px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        borderTop:    "1.5px solid rgba(168,224,44,0.85)",
        borderLeft:   "1.5px solid rgba(168,224,44,0.85)",
        borderBottom: "1.5px solid rgba(0,168,84,0.75)",
        borderRight:  "1.5px solid rgba(0,168,84,0.75)",
        borderRadius: 28, width: "100%", maxWidth: 620,
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
        animation: "slideIn 0.3s cubic-bezier(0.22,1,0.36,1)",
        fontFamily: "'Inter',sans-serif",
      }}>

        {/* ── Header ── */}
        <div style={{
          background: "linear-gradient(135deg,#0b6630 0%,#2d6b50 55%,#1a5e3a 100%)",
          borderRadius: "26px 26px 0 0", padding: "28px 28px 24px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(168,224,44,0.08) 1.5px,transparent 1.5px)", backgroundSize: "20px 20px" }} />
          <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(168,224,44,0.07)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>✕</button>
          <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
            <Avatar user={patient} size={68} radius={20} />
            <div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{fullName}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>{patient?.email}</div>
              <StatusBadge status={sub.status} />
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Plan Progress ── */}
          {offer && (
            <div style={{ background: "rgba(11,102,48,0.06)", borderRadius: 16, padding: "16px 18px", border: "1px solid rgba(168,224,44,0.3)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0b6630", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>📋 Plan Progress</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329", fontFamily: "'Inter',sans-serif" }}>{offer.name}</div>
                  <div style={{ fontSize: 11.5, color: "#5a7a6e", marginTop: 2, fontFamily: "'Inter',sans-serif" }}>
                    {fmtDate(sub.startDate)} → {fmtDate(sub.endDate)}
                  </div>
                </div>
                {planDay && totalDays && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: "#0b6630" }}>Day {planDay}</div>
                    <div style={{ fontSize: 11, color: "#9ab8ae", fontFamily: "'Inter',sans-serif" }}>of {totalDays} days</div>
                  </div>
                )}
              </div>
              {planPct !== null && (
                <>
                  <div style={{ height: 8, background: "rgba(0,168,84,0.15)", borderRadius: 999, overflow: "hidden", marginBottom: 5 }}>
                    <div style={{ height: "100%", width: `${planPct}%`, background: "linear-gradient(90deg,#0b6630,#a8e02c)", borderRadius: 999, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: "#0b6630", fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{planPct}% complete</div>
                </>
              )}
            </div>
          )}

          {/* ── Health Profile ── */}
          {profile && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>🏥 Health Profile</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { label: "Weight",   val: profile.weight ? `${profile.weight} kg` : "—", icon: "⚖️" },
                  { label: "Height",   val: profile.height ? `${profile.height} cm` : "—", icon: "📏" },
                  { label: "Goal",     val: profile.goal   || "—",                          icon: "🎯" },
                  { label: "Activity", val: profile.activityLevel || "—",                   icon: "🏃" },
                  { label: "Gender",   val: profile.gender        || "—",                   icon: "👤" },
                  { label: "Allergies", val: (profile.allergies ?? []).join(", ") || "None", icon: "⚠️" },
                ].map(item => (
                  <div key={item.label} style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(168,224,44,0.25)" }}>
                    <div style={{ fontSize: 10, color: "#9ab8ae", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329", fontFamily: "'Inter',sans-serif" }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sessions Summary ── */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>📅 Sessions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                { label: "Total",     val: sessions.length, color: "#1a3329", bg: "rgba(26,51,41,0.06)",   border: "rgba(26,51,41,0.1)"    },
                { label: "Scheduled", val: scheduled,       color: "#1a6fa0", bg: "rgba(26,111,160,0.08)", border: "rgba(26,111,160,0.2)"  },
                { label: "Completed", val: completed,       color: "#0b6630", bg: "rgba(11,102,48,0.08)",  border: "rgba(168,224,44,0.3)"  },
              ].map(item => (
                <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: "12px", textAlign: "center", border: `1px solid ${item.border}`, backdropFilter: "blur(6px)" }}>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1, marginBottom: 4 }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: "#5a7a6e", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Notes ── */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>📝 My Notes</div>
            <textarea
              placeholder={`Add private notes about ${patient?.firstName}…`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: "100%", border: "1.5px solid rgba(168,224,44,0.4)",
                borderRadius: 12, padding: "12px 14px",
                fontSize: 13, fontFamily: "'Inter',sans-serif",
                color: "#1a3329", background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(6px)", outline: "none",
                resize: "vertical", minHeight: 90, boxSizing: "border-box",
                transition: "all 0.2s",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <button onClick={saveNote} disabled={saving || notes === savedNote} style={{
                background: notes === savedNote ? "rgba(90,122,110,0.1)" : "#0b6630",
                color: notes === savedNote ? "#9ab8ae" : "#a8e02c",
                border: "none", borderRadius: 10, padding: "9px 20px",
                fontSize: 13, fontWeight: 700,
                cursor: notes === savedNote ? "not-allowed" : "pointer",
                fontFamily: "'Inter',sans-serif", transition: "all 0.2s",
              }}>
                {saving ? "Saving…" : "Save Note"}
              </button>
              {noteMsg && <span style={{ fontSize: 12.5, color: "#0b6630", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>✓ {noteMsg}</span>}
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { onClose(); navigate("/resume/consultations"); }} style={{
              flex: 1, padding: "12px 0", background: "#0b6630", color: "#a8e02c",
              border: "none", borderRadius: 14, fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Inter',sans-serif",
              boxShadow: "0 4px 14px rgba(11,102,48,0.3)",
            }}>📅 View Sessions</button>
            <button onClick={() => { onClose(); navigate("/resume/chat"); }} style={{
              flex: 1, padding: "12px 0",
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)",
              color: "#0b6630", border: "1.5px solid rgba(168,224,44,0.4)",
              borderRadius: 14, fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "'Inter',sans-serif",
            }}>💬 Message</button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/subscriptions/nutrition`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setSubscriptions(data.subscriptions ?? []))
      .catch(() => setSubscriptions([]))
      .finally(() => setLoading(false));
  }, []);

  const patientMap = {};
  for (const sub of subscriptions) {
    const pid = sub.patient?.id;
    if (!pid) continue;
    if (!patientMap[pid]) {
      patientMap[pid] = { ...sub, sessions: sub.sessions ?? [] };
    } else {
      patientMap[pid].sessions = [...patientMap[pid].sessions, ...(sub.sessions ?? [])];
    }
  }
  const patients = Object.values(patientMap);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
        .pp-card { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; cursor: pointer; }
        .pp-card:hover {
          background: rgba(255,255,255,0.30) !important;
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.7) !important;
        }
        .pp-skeleton {
          height: 160px; border-radius: 20px;
          background: linear-gradient(90deg,rgba(240,247,243,0.8) 25%,rgba(224,237,232,0.8) 50%,rgba(240,247,243,0.8) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
        }
          
/* ═══════════════════════════════════════════
   HEADER — Glassy
   ═══════════════════════════════════════════ */
.cp-header-glass{
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top: 1.5px solid rgba(168, 224, 44, 0.85);
  border-left: 1.5px solid rgba(168, 224, 44, 0.85);
  border-bottom: 1.5px solid rgba(0, 168, 84, 0.75);
  border-right: 1.5px solid rgba(0, 168, 84, 0.75);
  border-radius: 22px;
  padding: 24px 28px;
  margin-bottom: 22px;
  box-shadow: 0 8px 32px rgba(15, 89, 47, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.5);
  animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
  display: flex;
  align-items: center;
  gap: 18px;
}
.cp-header-icon{
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0b6630, #2d6b50);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 16px rgba(11, 102, 48, 0.25);
  flex-shrink: 0;
}
.cp-header-text h1{
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1a3329;
  margin: 0 0 4px 0;
}
.cp-header-text p{
  font-size: 13px;
  color: rgba(11, 102, 48, 0.55);
  margin: 0;
}

      `}</style>

      <div className="cp-header-glass">
        <div className="cp-header-icon">📝</div>
        <div className="cp-header-text">
          <h1>your patient</h1>
          <p>"All your active and past patients"</p>
        </div>
      </div>
      {/* Loading */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="pp-skeleton" style={{ animationDelay: `${i*0.1}s` }} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && patients.length === 0 && (
        <GlassCard style={{ padding: "50px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧑‍⚕️</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 6 }}>No patients yet</div>
          <div style={{ fontSize: 13, color: "#9ab8ae", fontFamily: "'Inter',sans-serif" }}>Your patients will appear here once they subscribe.</div>
        </GlassCard>
      )}

      {/* Grid */}
      {!loading && patients.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {patients.map((sub, i) => {
            const patient  = sub.patient;
            const offer    = sub.offer;
            const fullName = `${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`.trim() || "Unknown";

            const planStart = sub.startDate ? new Date(sub.startDate) : null;
            const today     = new Date();
            const planDay   = planStart ? Math.max(1, Math.floor((today - planStart) / (1000*60*60*24)) + 1) : null;
            const totalDays = offer?.durationDays ?? null;
            const planPct   = planDay && totalDays ? Math.min(100, Math.round((planDay / totalDays) * 100)) : null;
            const hasNote   = !!localStorage.getItem(`note_${patient?.id}`);

            return (
              <GlassCard
                key={patient?.id ?? i}
                className="pp-card"
                onClick={() => setSelected(sub)}
                style={{ padding: "18px 18px 14px", animationDelay: `${i * 0.07}s` }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <Avatar user={patient} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {fullName}
                    </div>
                    <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Inter',sans-serif" }}>
                      {patient?.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <StatusBadge status={sub.status} />
                    {hasNote && <span style={{ fontSize: 9.5, color: "#0b6630", fontWeight: 700, background: "rgba(11,102,48,0.1)", borderRadius: 999, padding: "1px 7px", fontFamily: "'Inter',sans-serif" }}>📝 Note</span>}
                  </div>
                </div>

                {/* Offer info */}
                {offer && (
                  <div style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(6px)", borderRadius: 10, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(168,224,44,0.2)" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0b6630", fontFamily: "'Inter',sans-serif" }}>{offer.name}</div>
                      <div style={{ fontSize: 10.5, color: "#9ab8ae", marginTop: 1, fontFamily: "'Inter',sans-serif" }}>{offer.type} · {offer.durationDays}d</div>
                    </div>
                    {planDay && totalDays && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>Day {planDay}</div>
                        <div style={{ fontSize: 10, color: "#9ab8ae", fontFamily: "'Inter',sans-serif" }}>of {totalDays}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                {planPct !== null && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 10.5, color: "#9ab8ae", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>Plan progress</span>
                      <span style={{ fontSize: 10.5, color: "#0b6630", fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{planPct}%</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(0,168,84,0.15)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${planPct}%`, background: "linear-gradient(90deg,#0b6630,#a8e02c)", borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                )}

                {/* Sessions */}
                {sub.sessions?.length > 0 && (
                  <div style={{ fontSize: 11.5, color: "#5a7a6e", marginBottom: 12, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Inter',sans-serif" }}>
                    📅 <strong>{sub.sessions.length}</strong> session{sub.sessions.length > 1 ? "s" : ""}
                    {sub.sessions.filter(s => s.status === "COMPLETED").length > 0 && (
                      <span style={{ color: "#0b6630", marginLeft: 4, fontFamily: "'Inter',sans-serif" }}>
                        · ✅ {sub.sessions.filter(s => s.status === "COMPLETED").length} completed
                      </span>
                    )}
                  </div>
                )}

                {/* Hint */}
                <div style={{ fontSize: 11, color: "#9ab8ae", textAlign: "center", paddingTop: 10, borderTop: "1px solid rgba(168,224,44,0.2)", fontFamily: "'Inter',sans-serif" }}>
                  Click to view full profile →
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {selected && (
        <PatientModal sub={selected} onClose={() => setSelected(null)} navigate={navigate} />
      )}
    </>
  );
}

