import { useState } from "react";
import { useAuth } from "../context/Authcontext";
import Header from "../components/Header";

/* ─────────────────────────────── CSS ─────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

*{box-sizing:border-box;}

body{
  font-family:'DM Sans',sans-serif;
  background:#f2f7f5;
}

/* ───────── CARD SYSTEM ───────── */
.rs-card{
  background:#fff;
  border-radius:18px;
  padding:22px;
  border:1px solid rgba(79,158,122,0.10);
  box-shadow:0 6px 20px rgba(0,0,0,0.04);
  transition:0.25s ease;
}

.rs-card:hover{
  transform:translateY(-2px);
  box-shadow:0 10px 28px rgba(0,0,0,0.08);
}

/* ───────── SIDEBAR ───────── */
.rs-sidebar{
  width:230px;
  background:#fff;
  border-radius:18px;
  padding:14px;
  border:1px solid rgba(79,158,122,0.10);
  position:sticky;
  top:20px;
}

.rs-sb-item{
  width:100%;
  text-align:left;
  padding:10px 12px;
  border-radius:12px;
  font-weight:600;
  font-size:13px;
  border:none;
  background:transparent;
  cursor:pointer;
  transition:0.2s;
  color:#3d6b57;
}

.rs-sb-item:hover{
  background:#f0f7f4;
  color:#1a3329;
}

.rs-sb-item.active{
  background:linear-gradient(135deg,#1a3329,#2d6b50);
  color:#fff;
}

/* ───────── HERO ───────── */
.hero{
  background:linear-gradient(135deg,#1a3329,#2d6b50);
  padding:60px 40px 90px;
  color:white;
}

.hero h1{
  font-family:'Syne';
  font-size:32px;
  margin:8px 0;
}

/* ───────── KPI ───────── */
.kpi-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:14px;
}

.kpi-card{
  padding:18px;
  border-radius:16px;
  background:#fff;
  border:1px solid rgba(79,158,122,0.08);
  text-align:left;
}

.kpi-value{
  font-size:24px;
  font-weight:800;
  color:#1a3329;
}

.kpi-label{
  font-size:12px;
  opacity:0.6;
}

/* ───────── ENTRY ───────── */
.entry{
  padding:14px;
  border-radius:14px;
  background:#f7faf8;
  border:1px solid rgba(79,158,122,0.08);
  margin-bottom:10px;
  transition:0.2s;
}

.entry:hover{
  background:#eef7f2;
  border-color:rgba(79,158,122,0.2);
}

/* ───────── TITLE ───────── */
.section-title{
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:800;
  font-family:'Syne';
  margin-bottom:16px;
  color:#1a3329;
}

.icon-box{
  width:30px;
  height:30px;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#e8f5e9;
}
`;

/* ───────── UI HELPERS ───────── */
function SectionTitle({ icon, title }) {
  return (
    <div className="section-title">
      <div className="icon-box">{icon}</div>
      {title}
    </div>
  );
}

const PATIENTS = [
  { id: 1, name: "Patient A", goal: "Weight Loss", status: "Active" },
  { id: 2, name: "Patient B", goal: "Diabetes Control", status: "Pending" },
];

const PLANS = [
  { id: 1, title: "1200 kcal Fat Loss Plan", type: "Weight Loss" },
  { id: 2, title: "Diabetes Balanced Diet", type: "Medical" },
];

const KPIS = [
  { label: "Active Patients", value: 24 },
  { label: "Completed Plans", value: 58 },
  { label: "Success Rate", value: "87%" },
];

const MENU = [
  { key: "overview", label: "Overview" },
  { key: "patients", label: "Patients" },
  { key: "plans", label: "Diet Plans" },
  { key: "consultations", label: "Consultations" },
  { key: "analytics", label: "Analytics" },
];

function Sidebar({ active, setActive }) {
  return (
    <div className="rs-sidebar">
      {MENU.map(m => (
        <button
          key={m.key}
          onClick={() => setActive(m.key)}
          className={`rs-sb-item ${active === m.key ? "active" : ""}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ───────── DASHBOARD ───────── */
export default function NutritionDashboard() {
  const { user } = useAuth();
  const [active, setActive] = useState("overview");

  return (
    <div>
      <style>{CSS}</style>
      <Header />

      {/* HERO */}
      <div className="hero">
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Nutrition Dashboard
        </div>

        <h1>Welcome, {user?.name || "Specialist"}</h1>

        <p style={{ opacity: 0.75 }}>
          Manage patients, plans, and analytics
        </p>
      </div>

      {/* CONTENT */}
      <div style={{
        maxWidth: 1100,
        margin: "-60px auto",
        display: "flex",
        gap: 18,
        padding: "0 20px 80px"
      }}>

        <Sidebar active={active} setActive={setActive} />

        <div style={{ flex: 1 }}>

          {/* OVERVIEW */}
          {active === "overview" && (
            <div className="rs-card">
              <SectionTitle icon="📊" title="Key Metrics" />

              <div className="kpi-grid">
                {KPIS.map(k => (
                  <div key={k.label} className="kpi-card">
                    <div className="kpi-value">{k.value}</div>
                    <div className="kpi-label">{k.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PATIENTS */}
          {active === "patients" && (
            <div className="rs-card">
              <SectionTitle icon="🧑‍⚕️" title="Patients" />
              {PATIENTS.map(p => (
                <div key={p.id} className="entry">
                  <b>{p.name}</b>
                  <div style={{ fontSize: 12 }}>{p.goal}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{p.status}</div>
                </div>
              ))}
            </div>
          )}

          {/* PLANS */}
          {active === "plans" && (
            <div className="rs-card">
              <SectionTitle icon="🥗" title="Diet Plans" />
              {PLANS.map(p => (
                <div key={p.id} className="entry">
                  <b>{p.title}</b>
                  <div style={{ fontSize: 12 }}>{p.type}</div>
                </div>
              ))}
            </div>
          )}

          {/* OTHERS */}
          {active === "consultations" && (
            <div className="rs-card">
              <SectionTitle icon="💬" title="Consultations" />
              <p style={{ opacity: 0.6 }}>Coming soon...</p>
            </div>
          )}

          {active === "analytics" && (
            <div className="rs-card">
              <SectionTitle icon="📈" title="Analytics" />
              <p style={{ opacity: 0.6 }}>Coming soon...</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}