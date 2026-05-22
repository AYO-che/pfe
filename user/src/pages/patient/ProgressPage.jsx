import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/Authcontext";

const API_URL = "https://chrysalise-server.onrender.com";

/* ═══════════════════════════════
   CSS
═══════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
@keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }

.pr-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.pr-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.pr-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
.pr-up-d3 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.21s both; }
.pr-up-d4 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.28s both; }

.glass-card {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.12), inset 0 0 12px rgba(255,255,255,0.55);
  overflow: hidden;
  transition: all 0.3s ease;
}
.glass-card:hover {
  background: rgba(255,255,255,0.26);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
}

.pp-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: rgba(26,51,41,0.92); color: #a8e02c;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(168,224,44,0.35);
  padding: 11px 26px; border-radius: 999px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
  z-index: 9999; animation: toastIn 0.25s ease;
  box-shadow: 0 8px 28px rgba(15,89,47,0.3);
  display: flex; align-items: center; gap: 8px;
}

.pr-section-label {
  font-size: 10px; font-weight: 700; color: #5a7a6e;
  text-transform: uppercase; letter-spacing: 1px;
  margin: 20px 0 10px 4px; font-family: 'Inter', sans-serif;
}

.pr-hero {
  padding: 24px 26px;
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg,#1a3329 0%,#0b6630 55%,#1a5e3a 100%);
  position: relative; overflow: hidden;
}
.pr-hero::before { content:""; position:absolute; right:-30px; top:-30px; width:180px; height:180px; border-radius:50%; background:rgba(168,224,44,0.08); }
.pr-hero::after  { content:""; position:absolute; right:50px; bottom:-50px; width:120px; height:120px; border-radius:50%; background:rgba(168,224,44,0.05); }

.pr-stat-card {
  background: rgba(255,255,255,0.22);
  backdrop-filter: blur(12px);
  border-top:    1.5px solid rgba(168,224,44,0.7);
  border-left:   1.5px solid rgba(168,224,44,0.7);
  border-bottom: 1.5px solid rgba(0,168,84,0.6);
  border-right:  1.5px solid rgba(0,168,84,0.6);
  border-radius: 18px; padding: 18px 16px;
  box-shadow: 0 4px 18px rgba(15,89,47,0.1), inset 0 0 10px rgba(255,255,255,0.5);
  transition: all 0.25s ease;
}
.pr-stat-card:hover { background:rgba(255,255,255,0.38); transform:translateY(-2px); box-shadow:0 8px 24px rgba(15,89,47,0.18); }

.pr-bar-track { height:6px; background:rgba(0,168,84,0.1); border-radius:999px; overflow:hidden; }
.pr-bar-fill  { height:100%; border-radius:999px; transition:width 0.9s cubic-bezier(0.22,1,0.36,1); }

.pr-macro-pill {
  display: inline-block;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(6px);
  border: 1px solid rgba(168,224,44,0.2); border-radius: 20px;
  padding: 5px 13px; font-size: 12px; color: rgba(255,255,255,0.8);
  font-family: 'Inter', sans-serif;
}
.pr-macro-pill strong { color: #a8e02c; }

.pr-modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(10,30,20,0.55); backdrop-filter: blur(8px);
  display: flex; align-items: flex-end; justify-content: center;
  animation: fadeIn 0.2s ease;
}
.pr-modal {
  width: 100%; max-width: 520px; max-height: 80vh;
  background: rgba(240,252,245,0.97); backdrop-filter: blur(28px);
  border-top: 2px solid rgba(168,224,44,0.8);
  border-left: 2px solid rgba(168,224,44,0.8);
  border-radius: 24px 24px 0 0;
  overflow-y: auto; padding: 28px 22px 36px;
  box-shadow: 0 -12px 48px rgba(15,89,47,0.22);
  animation: slideUp 0.3s cubic-bezier(0.22,1,0.36,1);
}

.pr-note-card {
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(0,168,84,0.12);
  border-left: 3px solid #0b6630;
  border-radius: 14px; padding: 14px 16px;
  font-family: 'Inter', sans-serif; transition: all 0.2s;
}
.pr-note-card:hover { background:rgba(255,255,255,0.85); border-color:rgba(168,224,44,0.4); }

.pr-note-textarea {
  width: 100%; min-height: 90px; resize: vertical;
  font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 500;
  color: #1a3329; background: rgba(255,255,255,0.7);
  border: 1.5px solid rgba(0,168,84,0.2); border-radius: 14px;
  padding: 14px 16px; outline: none; line-height: 1.6;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.pr-note-textarea:focus {
  border-color: rgba(168,224,44,0.7);
  box-shadow: 0 0 0 3px rgba(168,224,44,0.12);
  background: rgba(255,255,255,0.9);
}
.pr-note-textarea::placeholder { color: #9ab8ae; }

.pr-btn-primary {
  background: #0b6630; color: #a8e02c; border: none;
  padding: 11px 20px; border-radius: 18px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s; box-shadow: 0 4px 14px rgba(11,102,48,0.3);
  display: inline-flex; align-items: center; gap: 7px;
}
.pr-btn-primary:hover    { background:#0d7a38; transform:translateY(-1px); }
.pr-btn-primary:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

.pr-btn-glass {
  background: rgba(255,255,255,0.25); backdrop-filter: blur(8px);
  color: #1a3329; border: 1.5px solid rgba(168,224,44,0.4);
  padding: 11px 18px; border-radius: 18px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: 'Inter', sans-serif; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 7px;
}
.pr-btn-glass:hover { background:rgba(255,255,255,0.5); border-color:rgba(168,224,44,0.7); }

.pr-day-chip { display:flex; flex-direction:column; align-items:center; gap:5px; cursor:pointer; flex:1; }
.pr-day-circle {
  width:34px; height:34px; border-radius:50%;
  border:1.5px solid rgba(0,168,84,0.2);
  background:rgba(255,255,255,0.2); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center;
  font-size:11px; font-weight:700; color:#5a7a6e;
  transition:all 0.25s; font-family:'Inter', sans-serif;
}
.pr-day-circle.done    { background:#0b6630; color:#a8e02c; border-color:transparent; box-shadow:0 3px 10px rgba(11,102,48,0.3); }
.pr-day-circle.partial { background:rgba(168,224,44,0.25); color:#0b6630; border-color:rgba(168,224,44,0.5); }
.pr-day-circle.today   { border-color:rgba(168,224,44,0.8); color:#0b6630; font-weight:800; background:rgba(168,224,44,0.15); }
.pr-day-circle.selected { box-shadow:0 0 0 3px rgba(168,224,44,0.55); }
.pr-day-name { font-size:9.5px; font-weight:700; color:#9ab8ae; text-transform:uppercase; letter-spacing:0.5px; }

.pr-skip-row {
  display:flex; align-items:center; gap:10px;
  padding:10px 14px; border-radius:12px;
  background:rgba(255,255,255,0.35); margin-bottom:8px;
  border:1px solid rgba(0,168,84,0.08);
}

/* ── cp-style page header (matches ProfileInfoPage) ── */
@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

.cp-header-glass {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 22px;
  padding: 22px 26px;
  margin-bottom: 18px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.1), inset 0 0 10px rgba(255,255,255,0.5);
  animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
  display: flex;
  align-items: center;
  gap: 18px;
}
.cp-header-icon {
  width: 52px; height: 52px; border-radius: 16px;
  background: linear-gradient(135deg,#0b6630,#2d6b50);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 16px rgba(11,102,48,0.25);
  flex-shrink: 0;
}
.cp-header-text h1 {
  font-family: 'Inter', sans-serif;
  font-size: 21px; font-weight: 800; color: #1a3329;
  margin: 0 0 4px 0; letter-spacing: -0.4px;
}
.cp-header-text p {
  font-size: 12.5px; color: rgba(11,102,48,0.55); margin: 0;
  font-family: 'Inter', sans-serif;
}
`;

/* ═══════════════════════════════
   HELPERS
═══════════════════════════════ */
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAYS_FULL  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const todayISO = () => new Date().toISOString().split("T")[0];

const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });

function resolvePlanDay(userPlan, offsetDays = 0) {
  const content    = userPlan?.plan?.content;
  const days       = content?.days;
  if (!days || !Array.isArray(days) || days.length === 0)
    return { dayNum:1, totalDays:0, todayPlan:null };
  const totalDays  = content?.totalDays ?? days.length;
  const entryCount = days.length;
  let currentDayNum = 1;
  if (userPlan.startDate) {
    const diffMs  = Date.now() - new Date(userPlan.startDate).getTime() - offsetDays * 86400000;
    const diffDay = Math.floor(diffMs / 86400000) + 1;
    currentDayNum = Math.min(Math.max(diffDay, 1), totalDays);
  }
  return { dayNum: currentDayNum, totalDays, todayPlan: days[(currentDayNum - 1) % entryCount] };
}

/* ═══════════════════════════════
   SMALL SHARED COMPONENTS
═══════════════════════════════ */
function Ring({ pct, size = 90, stroke = 8, color = "#a8e02c", bg = "rgba(0,168,84,0.1)", label, sub }) {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(pct, 0), 100) / 100) * circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:"stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontFamily:"'Inter', sans-serif", fontSize:size*0.22, fontWeight:800, color:"#1a3329", lineHeight:1 }}>
            {pct}%
          </span>
        </div>
      </div>
      {label && <div style={{ fontSize:12, fontWeight:700, color:"#1a3329", textAlign:"center" }}>{label}</div>}
      {sub   && <div style={{ fontSize:10.5, color:"#5a7a6e", textAlign:"center" }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ icon, title, bg = "#e8f5e9" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
      <div style={{ width:30, height:30, borderRadius:9, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
        {icon}
      </div>
      <span style={{ fontFamily:"'Inter', sans-serif", fontSize:15, fontWeight:800, color:"#1a3329" }}>{title}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLAN LINE GRAPH  — standalone component so useState is legal
═══════════════════════════════════════════════════════════════ */
function PlanLineGraph({ userPlan, totalDays, dayNum, getDayAdherence }) {
  const [hovered, setHovered] = useState(null);

  const now       = new Date();
  const startDate = userPlan?.startDate ? new Date(userPlan.startDate) : null;

  // SVG canvas
  const W = 320, H = 120, PL = 30, PR = 22, PT = 18, PB = 26;
  const CW = W - PL - PR;
  const CH = H - PT - PB;

  // Build one record per plan day
  const planDays = Array.from({ length: totalDays }, (_, i) => {
    if (!startDate) return { idx: i, iso: null, pct: null, future: true };
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso    = d.toISOString().split("T")[0];
    const future = d > now && d.toDateString() !== now.toDateString();
    return { idx: i, iso, pct: future ? null : getDayAdherence(iso), future };
  });

  const known = planDays.filter(p => p.pct !== null);

  // Coordinate helpers
  const xOf = (i) => PL + (i / Math.max(totalDays - 1, 1)) * CW;
  const yOf = (p) => PT + CH - (p / 100) * CH;

  // Smooth bezier line
  const linePath = (() => {
    if (known.length === 0) return "";
    if (known.length === 1) return `M ${xOf(known[0].idx)} ${yOf(known[0].pct)}`;
    let d = `M ${xOf(known[0].idx)} ${yOf(known[0].pct)}`;
    for (let k = 1; k < known.length; k++) {
      const a  = known[k - 1], b = known[k];
      const cx = (xOf(a.idx) + xOf(b.idx)) / 2;
      d += ` C ${cx} ${yOf(a.pct)}, ${cx} ${yOf(b.pct)}, ${xOf(b.idx)} ${yOf(b.pct)}`;
    }
    return d;
  })();

  // Area fill (close under the line)
  const areaPath = (() => {
    if (known.length < 2) return "";
    const base = PT + CH;
    return `${linePath} L ${xOf(known[known.length - 1].idx)} ${base} L ${xOf(known[0].idx)} ${base} Z`;
  })();

  const todayIdx = dayNum - 1; // 0-based
  const todayX   = xOf(todayIdx);

  // X-axis label step
  const step   = totalDays <= 10 ? 1 : totalDays <= 21 ? 5 : totalDays <= 42 ? 7 : 10;
  const xLabels = planDays.filter(d => d.idx % step === 0 || d.idx === totalDays - 1);

  const GRID = [0, 25, 50, 75, 100];
  const TIP_W = 64, TIP_H = 30;

  return (
    <div>
      {/* divider */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{ height:1, flex:1, background:"rgba(0,168,84,0.12)" }} />
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:20, height:20, borderRadius:6, background:"rgba(168,224,44,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>📈</div>
          <span style={{ fontSize:10.5, fontWeight:700, color:"#5a7a6e", textTransform:"uppercase", letterSpacing:0.8 }}>
            Full Plan — {totalDays} Days
          </span>
        </div>
        <div style={{ height:1, flex:1, background:"rgba(0,168,84,0.12)" }} />
      </div>

      {/* scrollable SVG */}
      <div style={{ overflowX:"auto", marginBottom:12 }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width:"100%", minWidth: Math.max(totalDays * 8, 280), height: H, display:"block", overflow:"visible" }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="plg-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#a8e02c" />
              <stop offset="50%"  stopColor="#f5e642" />
              <stop offset="100%" stopColor="#0b6630" />
            </linearGradient>
            <linearGradient id="plg-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#a8e02c" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#a8e02c" stopOpacity="0"    />
            </linearGradient>
            <filter id="plg-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* y-grid */}
          {GRID.map(g => (
            <g key={g}>
              <line x1={PL} y1={yOf(g)} x2={W - PR} y2={yOf(g)}
                stroke={g === 0 ? "rgba(0,168,84,0.22)" : "rgba(0,168,84,0.07)"}
                strokeWidth={g === 0 ? 1 : 0.8}
                strokeDasharray={g === 0 ? "none" : "3 4"} />
              <text x={PL - 4} y={yOf(g) + 3.5} textAnchor="end"
                fontSize="7" fill="rgba(90,122,110,0.7)" fontFamily="'Inter', sans-serif">
                {g}
              </text>
            </g>
          ))}

          {/* 80% target */}
          <line x1={PL} y1={yOf(80)} x2={W - PR} y2={yOf(80)}
            stroke="rgba(168,224,44,0.5)" strokeWidth="1" strokeDasharray="5 3" />
          <text x={W - PR + 3} y={yOf(80) + 3.5} fontSize="7"
            fill="rgba(168,224,44,0.85)" fontFamily=" 'Inter', sans-serif" fontWeight="700">
            80%
          </text>

          {/* area */}
          {areaPath && <path d={areaPath} fill="url(#plg-area)" />}

          {/* future zone */}
          {startDate && todayIdx < totalDays - 1 && (
            <rect x={todayX} y={PT} width={xOf(totalDays - 1) - todayX} height={CH}
              fill="rgba(0,0,0,0.03)" />
          )}

          {/* line */}
          {linePath && (
            <path d={linePath} fill="none"
              stroke="url(#plg-line)" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
              filter="url(#plg-glow)" />
          )}

          {/* today marker */}
          {startDate && (
            <g>
              <line x1={todayX} y1={PT} x2={todayX} y2={PT + CH}
                stroke="rgba(168,224,44,0.65)" strokeWidth="1.2" strokeDasharray="3 3" />
              <text x={todayX} y={PT - 5} textAnchor="middle"
                fontSize="7" fill="rgba(168,224,44,0.9)"
                fontFamily="'Inter', sans-serif;" fontWeight="700">
                Today
              </text>
            </g>
          )}

          {/* invisible hit rects */}
          {known.map(pt => (
            <rect key={pt.idx}
              x={xOf(pt.idx) - 10} y={PT} width={20} height={CH}
              fill="transparent" style={{ cursor:"pointer" }}
              onMouseEnter={() => setHovered(pt)}
              onTouchStart={() => setHovered(prev => prev?.idx === pt.idx ? null : pt)}
            />
          ))}

          {/* dots — always for short plans; today + hovered for long ones */}
          {known.map(pt => {
            const cx      = xOf(pt.idx);
            const cy      = yOf(pt.pct);
            const isHov   = hovered?.idx === pt.idx;
            const isTodPt = pt.idx === todayIdx;
            const dot     = pt.pct >= 80 ? "#a8e02c" : pt.pct >= 50 ? "#f5e642" : "#f5b8b8";
            if (totalDays > 20 && !isHov && !isTodPt) return null;
            return (
              <g key={pt.idx}>
                {isHov && <circle cx={cx} cy={cy} r={11} fill={dot} opacity={0.13} />}
                <circle cx={cx} cy={cy}
                  r={isHov || isTodPt ? 4.5 : 3}
                  fill={isTodPt ? "#fff" : dot}
                  stroke={dot} strokeWidth="1.8"
                  style={{ transition:"r 0.15s ease" }} />
              </g>
            );
          })}

          {/* tooltip */}
          {hovered && (() => {
            const cx   = xOf(hovered.idx);
            const cy   = yOf(hovered.pct);
            const tx   = Math.min(Math.max(cx - TIP_W / 2, PL), W - PR - TIP_W);
            const ty   = Math.max(cy - TIP_H - 10, PT - 2);
            const dot  = hovered.pct >= 80 ? "#a8e02c" : hovered.pct >= 50 ? "#f5e642" : "#f5b8b8";
            return (
              <g>
                <rect x={tx} y={ty} width={TIP_W} height={TIP_H} rx="8"
                  fill="rgba(26,51,41,0.93)" stroke="rgba(168,224,44,0.25)" strokeWidth="0.8" />
                <text x={tx + TIP_W / 2} y={ty + 11} textAnchor="middle"
                  fontSize="7.5" fill="#9ab8ae" fontFamily="'Inter', sans-serif;" fontWeight="700">
                  Day {hovered.idx + 1}
                </text>
                <text x={tx + TIP_W / 2} y={ty + 23} textAnchor="middle"
                  fontSize="10" fill={dot} fontFamily="'Inter', sans-serif;" fontWeight="800">
                  {hovered.pct}%
                </text>
              </g>
            );
          })()}

          {/* x-axis labels */}
          {xLabels.map(d => (
            <text key={d.idx} x={xOf(d.idx)} y={H - 5} textAnchor="middle" fontSize="7"
              fill={d.idx === todayIdx ? "rgba(168,224,44,0.9)" : "rgba(90,122,110,0.5)"}
              fontFamily="'Inter', sans-serif;"
              fontWeight={d.idx === todayIdx ? "700" : "400"}>
              {d.idx + 1}
            </text>
          ))}
        </svg>
      </div>

      {/* legend */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        {[
          { el:<div style={{ width:26, height:2.5, background:"linear-gradient(90deg,#a8e02c,#0b6630)", borderRadius:999 }} />, label:"Adherence" },
          { el:<div style={{ width:10, height:10, borderRadius:3, background:"rgba(168,224,44,0.22)" }} />,                   label:"Area fill" },
          { el:<div style={{ width:18, height:0, borderTop:"1.5px dashed rgba(168,224,44,0.55)", marginTop:6 }} />,          label:"80% target" },
          { el:<div style={{ width:0, height:12, borderLeft:"1.5px dashed rgba(168,224,44,0.65)" }} />,                      label:"Today" },
        ].map(item => (
          <div key={item.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:10.5, color:"#5a7a6e", fontWeight:600 }}>
            {item.el}{item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function ProfileProgressPage() {
  const { user } = useAuth();

  const [allPlans,    setAllPlans]    = useState([]);
  const [activeKey,   setActiveKey]   = useState(null);
  const [trackCache,  setTrackCache]  = useState({});
  const [notes,       setNotes]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("pr_notes") || "[]"); } catch { return []; }
  });
  const [noteText,    setNoteText]    = useState("");
  const [savingNote,  setSavingNote]  = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  useEffect(() => {
    localStorage.setItem("pr_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    (async () => {
      try {
        const r     = await fetch(`${API_URL}/user-plans/mine`, { credentials:"include" });
        const data  = await r.json();
        const plans = data.userPlans ?? [];
        setAllPlans(plans);
        if (plans.length > 0) setActiveKey(plans[0].id);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const fetchTracking = useCallback(async (planId, dateIso) => {
    setTrackCache(prev => {
      if (prev[dateIso]) return prev; // already cached
      return prev; // will fetch below
    });
    // We check outside setState to avoid stale closure issues
    try {
      const r = await fetch(`${API_URL}/user-plans/${planId}/tracking/${dateIso}`, { credentials:"include" });
      if (!r.ok) return;
      const d = await r.json();
      const t = d.dailyTracking ?? {};
      setTrackCache(prev => ({
        ...prev,
        [dateIso]: {
          mealsDone:    t.mealsDoneIds    ?? [],
          mealsMissed:  t.mealsMissedIds  ?? [],
          habitsDone:   t.habitsDoneIds   ?? [],
          habitsMissed: t.habitsMissedIds ?? [],
        }
      }));
    } catch {}
  }, []); // stable — no deps needed

  useEffect(() => {
    if (!activeKey) return;
    const userPlan = allPlans.find(p => p.id === activeKey);
    if (!userPlan) return;
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      fetchTracking(userPlan.id, d.toISOString().split("T")[0]);
    }
  }, [activeKey, allPlans, fetchTracking]);

  /* derived */
  const userPlan  = allPlans.find(p => p.id === activeKey) ?? null;
  const { dayNum, totalDays } = userPlan ? resolvePlanDay(userPlan) : { dayNum:1, totalDays:0 };

  const weight = user?.profile?.weight || "";
  const height = user?.profile?.height || "";
  const goal   = user?.profile?.goal   || "";
  const bmi    = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : null;
  const bmiStatus = (() => {
    if (!bmi) return null;
    const v = parseFloat(bmi);
    if (v < 18.5) return { label:"Underweight", color:"#1a6fa0" };
    if (v < 25)   return { label:"Normal",      color:"#0b6630" };
    if (v < 30)   return { label:"Overweight",  color:"#b8a200" };
    return              { label:"Obese",         color:"#c0392b" };
  })();

  const now      = new Date();
  const todayIdx = now.getDay();
  const weekDates = Array.from({ length:7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - todayIdx + i);
    return d.toISOString().split("T")[0];
  });

  const getDayAdherence = useCallback((dateIso) => {
    const t = trackCache[dateIso];
    if (!t) return null;
    const done  = t.mealsDone.length  + t.habitsDone.length;
    const total = done + t.mealsMissed.length + t.habitsMissed.length;
    return total === 0 ? null : Math.round((done / total) * 100);
  }, [trackCache]);

  const weekAdh  = weekDates.map(d => getDayAdherence(d)).filter(v => v !== null);
  const weekAvg  = weekAdh.length ? Math.round(weekAdh.reduce((a,b)=>a+b,0)/weekAdh.length) : 0;
  const bestDay  = weekAdh.length ? Math.max(...weekAdh) : 0;
  const streak   = (() => {
    let s = 0;
    for (let i = weekDates.length - 1; i >= 0; i--) {
      const d   = new Date(weekDates[i]);
      const pct = getDayAdherence(weekDates[i]);
      if (d > now) continue;
      if (pct !== null && pct >= 60) s++; else break;
    }
    return s;
  })();

  const todayTrack      = trackCache[todayISO()] ?? null;
  const todayMealsDone   = todayTrack?.mealsDone.length   ?? 0;
  const todayMealsMissed = todayTrack?.mealsMissed.length ?? 0;
  const todayHabitsDone   = todayTrack?.habitsDone.length   ?? 0;
  const todayHabitsMissed = todayTrack?.habitsMissed.length ?? 0;
  const totalMeals  = todayMealsDone  + todayMealsMissed;
  const totalHabits = todayHabitsDone + todayHabitsMissed;
  const mealPct     = totalMeals  > 0 ? Math.round((todayMealsDone  / totalMeals)  * 100) : 0;
  const habitPct    = totalHabits > 0 ? Math.round((todayHabitsDone / totalHabits) * 100) : 0;
  const overallPct  = (totalMeals + totalHabits) > 0
    ? Math.round(((todayMealsDone + todayHabitsDone) / (totalMeals + totalHabits)) * 100) : 0;

  const getMealName = (m) => typeof m === "string" ? m : m?.name ?? m?.title ?? "Meal";
  const skippedCounts = {};
  weekDates.forEach(dateIso => {
    const t = trackCache[dateIso]; if (!t) return;
    const dayDiff = Math.round((new Date(todayISO()) - new Date(dateIso)) / 86400000);
    const { todayPlan } = resolvePlanDay(userPlan, dayDiff) ?? {};
    (todayPlan?.meals ?? []).forEach((meal, i) => {
      if (t.mealsMissed.includes(String(i))) {
        const name = getMealName(meal);
        skippedCounts[name] = (skippedCounts[name] ?? 0) + 1;
      }
    });
  });
  const topSkipped = Object.entries(skippedCounts).sort((a,b)=>b[1]-a[1]).slice(0,4);

  const selectedDayOffset = selectedDay
    ? Math.round((new Date(todayISO()) - new Date(selectedDay)) / 86400000) : 0;
  const { todayPlan: selectedDayPlan } = (selectedDay && userPlan)
    ? resolvePlanDay(userPlan, selectedDayOffset) : { todayPlan:null };
  const selectedTrack = selectedDay ? (trackCache[selectedDay] ?? null) : null;

  const addNote = () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    setTimeout(() => {
      setNotes(prev => [{ id:Date.now(), date:todayISO(), text:noteText.trim() }, ...prev].slice(0,50));
      setNoteText(""); setSavingNote(false); showToast("Note saved!");
    }, 400);
  };
  const deleteNote = (id) => setNotes(prev => prev.filter(n => n.id !== id));

  const planPct = totalDays > 0 ? Math.round((dayNum / totalDays) * 100) : 0;

  if (loading) return (
    <div style={{ fontFamily:"'Inter', sans-serif;", padding:40, color:"#5a7a6e", display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ width:18, height:18, border:"2px solid rgba(0,168,84,0.3)", borderTopColor:"#0b6630", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} />
      Loading progress…
    </div>
  );

  /* ── RENDER ── */
  return (
    <div style={{ fontFamily:"'Inter', sans-serif;", paddingBottom:40 }}>
      <style>{CSS}</style>

      {toast && (
        <div className="pp-toast">
          <div style={{ width:18, height:18, borderRadius:"50%", background:"#0b6630", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* ── Page header (matches ProfileInfoPage style) ── */}
      <div className="cp-header-glass">
        <div className="cp-header-icon">📈</div>
        <div className="cp-header-text">
          <h1>My Progress</h1>
          <p>
            {now.toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric", year:"numeric" })}
            {totalDays > 0 && ` — Day ${dayNum} of ${totalDays}`}
          </p>
        </div>
      </div>

      {/* hero */}
      <div className="glass-card pr-up-d1" style={{ marginBottom:14 }}>
        <div className="pr-hero">
          <div style={{ flex:1, position:"relative", zIndex:1 }}>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginBottom:4 }}>Today's Adherence</p>
            <div style={{ fontFamily:"'Inter', sans-serif;", fontSize:52, fontWeight:800, color:"#a8e02c", letterSpacing:-2, lineHeight:1 }}>
              {overallPct}<span style={{ fontSize:20, opacity:0.6 }}>%</span>
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", marginTop:6 }}>
              {overallPct===100?"Perfect day! All tasks complete 🎉":overallPct>=75?"Great momentum, almost there!":overallPct>=50?"Over halfway — keep it up!":overallPct>0?"Good start, keep logging!":"Start logging your meals and habits."}
            </div>
            <div style={{ width:"100%", height:5, background:"rgba(255,255,255,0.1)", borderRadius:999, marginTop:14, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${overallPct}%`, background:"linear-gradient(90deg,#a8e02c,#f5e642)", borderRadius:999, transition:"width 0.9s cubic-bezier(0.22,1,0.36,1)" }} />
            </div>
          </div>
          <div style={{ marginLeft:22, textAlign:"right", flexShrink:0, position:"relative", zIndex:1 }}>
            {streak > 0 && (
              <div style={{ marginBottom:8, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <div style={{ fontFamily:"'Inter', sans-serif;", fontSize:28, fontWeight:800, color:"#a8e02c", lineHeight:1 }}>{streak}🔥</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:700 }}>day streak</div>
              </div>
            )}
            <div className="pr-macro-pill" style={{ display:"block", marginBottom:6 }}><strong>{todayMealsDone}</strong>/{totalMeals} meals</div>
            <div className="pr-macro-pill" style={{ display:"block", marginBottom:6 }}><strong>{todayHabitsDone}</strong>/{totalHabits} habits</div>
            {totalDays > 0 && <div className="pr-macro-pill" style={{ display:"block" }}>Day <strong>{dayNum}</strong> of {totalDays}</div>}
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="pr-up-d1" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10, marginBottom:14 }}>
        {[
          { icon:"⚖️", label:"Weight", val:weight||"—", unit:"kg",                 color:"#1a6fa0" },
          { icon:"📏", label:"Height", val:height||"—", unit:"cm",                 color:"#2d7a4f" },
          { icon:"🔬", label:"BMI",    val:bmi||"—",    unit:bmiStatus?.label??"", color:bmiStatus?.color??"#7a3fa0" },
          { icon:"🎯", label:"Goal",   val:goal||"—",   unit:"",                   color:"#b8a200" },
        ].map((s, i) => (
          <div key={s.label} className="pr-stat-card" style={{ animationDelay:`${i*0.07}s` }}>
            <div style={{ width:32, height:32, borderRadius:9, background:"rgba(0,168,84,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontSize:9.5, fontWeight:700, color:"#9ab8ae", letterSpacing:0.8, textTransform:"uppercase", marginBottom:3 }}>{s.label}</div>
            <div style={{ fontFamily:"'Inter', sans-serif", fontSize:22, fontWeight:800, color:s.color, lineHeight:1, marginBottom:2 }}>{s.val}</div>
            {s.unit && <div style={{ fontSize:10.5, fontWeight:600, color:s.color, opacity:0.7 }}>{s.unit}</div>}
          </div>
        ))}
      </div>

      {/* dual rings */}
      <div className="glass-card pr-up-d2" style={{ marginBottom:14, padding:22 }}>
        <SectionTitle icon="🎯" title="Today's Split" bg="#e8f5e9" />
        <div style={{ display:"flex", justifyContent:"space-around", alignItems:"center", gap:16 }}>
          <Ring pct={mealPct}   size={100} color="#a8e02c" label="Meals"   sub={`${todayMealsDone}/${totalMeals} done`}   />
          <div style={{ width:1, height:80, background:"rgba(0,168,84,0.12)" }} />
          <Ring pct={habitPct}  size={100} color="#0b6630" label="Habits"  sub={`${todayHabitsDone}/${totalHabits} done`} />
          <div style={{ width:1, height:80, background:"rgba(0,168,84,0.12)" }} />
          <Ring pct={overallPct} size={100} color="#f5e642" label="Overall" sub="combined" />
        </div>
      </div>

      {/* ── Weekly adherence + full-plan line graph ── */}
      <div className="glass-card pr-up-d2" style={{ marginBottom:14, padding:22 }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <SectionTitle icon="📅" title="Weekly Adherence" bg="#fefde8" />
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:10.5, color:"#9ab8ae", fontWeight:600, marginBottom:2 }}>Weekly avg</div>
            <div style={{ fontFamily:"'Inter', sans-serif;", fontSize:18, fontWeight:800, color:weekAvg>=75?"#0b6630":weekAvg>=50?"#b8a200":"#c0392b" }}>
              {weekAvg}<span style={{ fontSize:11, fontWeight:600, opacity:0.6 }}>%</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize:11, color:"#9ab8ae", marginBottom:12, display:"flex", alignItems:"center", gap:5 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ab8ae" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Tap a day bar to see meal &amp; habit details
        </div>

        {/* weekly bars */}
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:120, marginBottom:10 }}>
          {weekDates.map((dateIso) => {
            const pct        = getDayAdherence(dateIso);
            const d          = new Date(dateIso);
            const isFuture   = d > now && d.toDateString() !== now.toDateString();
            const isToday_   = d.toDateString() === now.toDateString();
            const isSelected = selectedDay === dateIso;
            const barPct     = pct ?? 0;
            const barColor   = (isFuture || pct === null) ? "rgba(0,168,84,0.08)"
              : pct >= 80 ? "linear-gradient(180deg,#a8e02c,#2d7a4f)"
              : pct >= 50 ? "linear-gradient(180deg,#f5e642,#b8a200)"
              : isToday_  ? "linear-gradient(180deg,#f5e642,#d4c200)"
              :              "linear-gradient(180deg,#f5b8b8,#e88)";
            return (
              <div key={dateIso} className="pr-day-chip"
                onClick={() => !isFuture && setSelectedDay(selectedDay === dateIso ? null : dateIso)}>
                <div style={{ fontSize:9, fontWeight:700, color:pct!==null?(pct>=80?"#0b6630":pct>=50?"#b8a200":"#c0392b"):"transparent" }}>
                  {pct !== null ? `${pct}%` : ""}
                </div>
                <div style={{ width:"100%", flex:1, display:"flex", alignItems:"flex-end" }}>
                  <div style={{ width:"100%", height:`${Math.max(barPct,4)}%`, background:barColor,
                    borderRadius:"6px 6px 4px 4px",
                    transition:"height 0.8s cubic-bezier(0.22,1,0.36,1)",
                    boxShadow:isSelected?"0 0 0 2px rgba(168,224,44,0.8),0 4px 12px rgba(168,224,44,0.3)":"none",
                    opacity:isFuture?0.25:1 }} />
                </div>
                <div className={[
                  "pr-day-circle",
                  isToday_?"today":pct!==null&&pct>=80?"done":pct!==null&&pct>=50?"partial":"",
                  isSelected?"selected":"",
                ].filter(Boolean).join(" ")}>
                  {DAYS_SHORT[d.getDay()][0]}
                </div>
                <div className="pr-day-name">{DAYS_SHORT[d.getDay()]}</div>
              </div>
            );
          })}
        </div>

        {/* bar legend */}
        <div style={{ display:"flex", gap:14, padding:"10px 14px", background:"rgba(247,250,248,0.6)", borderRadius:10, flexWrap:"wrap", marginBottom: totalDays > 0 ? 22 : 0 }}>
          {[
            { color:"linear-gradient(90deg,#a8e02c,#2d7a4f)", label:"≥80% Great" },
            { color:"linear-gradient(90deg,#f5e642,#b8a200)", label:"50–79% OK" },
            { color:"linear-gradient(90deg,#f5b8b8,#e88)",    label:"<50% Low"  },
          ].map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#5a7a6e", fontWeight:600 }}>
              <div style={{ width:10, height:10, borderRadius:3, background:item.color, flexShrink:0 }} />
              {item.label}
            </div>
          ))}
        </div>

        {/* ── full-plan line graph (proper component, hooks safe) ── */}
        {totalDays > 0 && (
          <PlanLineGraph
            userPlan={userPlan}
            totalDays={totalDays}
            dayNum={dayNum}
            getDayAdherence={getDayAdherence}
          />
        )}
      </div>

      {/* plan journey */}
      {totalDays > 0 && (
        <div className="glass-card pr-up-d2" style={{ marginBottom:14, padding:22 }}>
          <SectionTitle icon="🗓️" title="Plan Journey" bg="#e3f2fd" />
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12.5, fontWeight:600, color:"#5a7a6e" }}>Day {dayNum} of {totalDays}</span>
                <span style={{ fontFamily:"'Inter', sans-serif;", fontSize:13, fontWeight:800, color:"#1a6fa0" }}>{planPct}%</span>
              </div>
              <div className="pr-bar-track">
                <div className="pr-bar-fill" style={{ width:`${planPct}%`, background:"linear-gradient(90deg,#1a6fa0,#a8e02c)" }} />
              </div>
              <div style={{ fontSize:11, color:"#9ab8ae", marginTop:8 }}>{totalDays - dayNum} days remaining</div>
            </div>
            <Ring pct={planPct} size={72} stroke={7} color="#1a6fa0" />
          </div>
        </div>
      )}

      {/* health summary */}
      <div className="glass-card pr-up-d3" style={{ marginBottom:14, padding:22 }}>
        <SectionTitle icon="📊" title="Health Summary" bg="#e8f5e9" />
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { label:"Weekly Avg Adherence", val:`${weekAvg}%`,    pct:weekAvg,                          color:weekAvg>=75?"#0b6630":weekAvg>=50?"#b8a200":"#c0392b" },
            { label:"Best Day This Week",   val:`${bestDay}%`,    pct:bestDay,                          color:"#1a6fa0" },
            { label:"Current Streak",       val:`${streak} days`, pct:Math.min(streak*14,100),          color:"#a8e02c" },
            ...(bmi ? [{ label:"BMI Status", val:`${bmi} — ${bmiStatus?.label}`, pct:Math.min(parseFloat(bmi)*3,100), color:bmiStatus?.color }] : []),
          ].map(row => (
            <div key={row.label}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12.5, fontWeight:600, color:"#5a7a6e" }}>{row.label}</span>
                <span style={{ fontFamily:"'Inter', sans-serif;", fontSize:13, fontWeight:800, color:row.color }}>{row.val}</span>
              </div>
              <div className="pr-bar-track">
                <div className="pr-bar-fill" style={{ width:`${Math.min(row.pct,100)}%`, background:row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* most skipped meals */}
      {topSkipped.length > 0 && (
        <div className="glass-card pr-up-d3" style={{ marginBottom:14, padding:22 }}>
          <SectionTitle icon="⚠️" title="Most Skipped Meals" bg="#fdecea" />
          <div style={{ fontSize:12, color:"#5a7a6e", marginBottom:14 }}>These meals slip most often this week.</div>
          {topSkipped.map(([name, count], i) => (
            <div key={name} className="pr-skip-row">
              <div style={{ width:28, height:28, borderRadius:8, background:`rgba(192,57,43,${0.08+i*0.04})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#c0392b", flexShrink:0 }}>
                {i+1}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#1a3329", marginBottom:2 }}>{name}</div>
                <div style={{ height:4, background:"rgba(192,57,43,0.08)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(count/7)*100}%`, background:"linear-gradient(90deg,#f5b8b8,#c0392b)", borderRadius:999 }} />
                </div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:"#c0392b", flexShrink:0 }}>{count}× missed</div>
            </div>
          ))}
        </div>
      )}

      {/* notes */}
      <div className="glass-card pr-up-d4" style={{ marginBottom:14, padding:22 }}>
        <SectionTitle icon="📝" title="My Notes" bg="#fefde8" />
        <div style={{ marginBottom:14 }}>
          <textarea className="pr-note-textarea"
            placeholder="How are you feeling today? Any wins, struggles, or observations…"
            value={noteText} onChange={e => setNoteText(e.target.value)} />
          <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
            <button className="pr-btn-primary" onClick={addNote} disabled={savingNote || !noteText.trim()}>
              {savingNote
                ? <><span style={{ width:12, height:12, border:"2px solid rgba(168,224,44,0.3)", borderTopColor:"#a8e02c", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} /> Saving…</>
                : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Note</>
              }
            </button>
          </div>
        </div>
        {notes.length === 0 && (
          <div style={{ textAlign:"center", padding:"28px 0", color:"#9ab8ae", fontSize:13 }}>
            No notes yet — start journaling your progress!
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:340, overflowY:"auto" }}>
          {notes.map(note => (
            <div key={note.id} className="pr-note-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:10.5, fontWeight:700, color:"#9ab8ae", textTransform:"uppercase", letterSpacing:0.6 }}>
                  {dateLabel(note.date)}
                </span>
                <button onClick={() => deleteNote(note.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#c0392b", opacity:0.45, fontSize:12, fontWeight:700, padding:"2px 6px", borderRadius:6, transition:"opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.45}>✕</button>
              </div>
              <div style={{ fontSize:13.5, color:"#1a3329", lineHeight:1.65, fontWeight:500 }}>{note.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* day detail modal */}
      {selectedDay && (
        <div className="pr-modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="pr-modal" onClick={e => e.stopPropagation()}>
            <div style={{ width:36, height:4, background:"rgba(0,168,84,0.2)", borderRadius:999, margin:"0 auto 20px" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <div>
                <div style={{ fontFamily:"'Inter', sans-serif;", fontSize:18, fontWeight:800, color:"#1a3329" }}>
                  {DAYS_FULL[new Date(selectedDay).getDay()]}
                </div>
                <div style={{ fontSize:12, color:"#5a7a6e", marginTop:2 }}>{dateLabel(selectedDay)}</div>
              </div>
              {(() => {
                const pct = getDayAdherence(selectedDay);
                return pct !== null
                  ? <Ring pct={pct} size={64} stroke={6} color={pct>=80?"#a8e02c":pct>=50?"#f5e642":"#f5b8b8"} />
                  : null;
              })()}
            </div>

            {selectedTrack === null ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"#9ab8ae", fontSize:13 }}>
                No tracking data logged for this day.
              </div>
            ) : (
              <>
                {selectedDayPlan?.meals?.length > 0 && (
                  <>
                    <div className="pr-section-label" style={{ margin:"0 0 10px" }}>Meals</div>
                    {selectedDayPlan.meals.map((meal, i) => {
                      const name   = typeof meal === "string" ? meal : meal?.name ?? meal?.title ?? `Meal ${i+1}`;
                      const isDone = selectedTrack.mealsDone.includes(String(i));
                      const isMiss = selectedTrack.mealsMissed.includes(String(i));
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, marginBottom:8,
                          background:isDone?"rgba(11,102,48,0.08)":isMiss?"rgba(192,57,43,0.06)":"rgba(0,0,0,0.03)",
                          border:`1px solid ${isDone?"rgba(168,224,44,0.3)":isMiss?"rgba(192,57,43,0.18)":"rgba(0,0,0,0.05)"}` }}>
                          <div style={{ fontSize:15 }}>{isDone?"✅":isMiss?"❌":"⬜"}</div>
                          <div style={{ flex:1, fontSize:13, fontWeight:600, color:"#1a3329" }}>{name}</div>
                          <div style={{ fontSize:11, fontWeight:700, color:isDone?"#0b6630":isMiss?"#c0392b":"#9ab8ae" }}>
                            {isDone?"Done":isMiss?"Missed":"—"}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                {selectedDayPlan?.habits?.length > 0 && (
                  <>
                    <div className="pr-section-label" style={{ margin:"16px 0 10px" }}>Habits</div>
                    {selectedDayPlan.habits.map((habit, i) => {
                      const name   = typeof habit === "string" ? habit : habit?.name ?? habit?.title ?? `Habit ${i+1}`;
                      const isDone = selectedTrack.habitsDone.includes(String(i));
                      const isMiss = selectedTrack.habitsMissed.includes(String(i));
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:12, marginBottom:8,
                          background:isDone?"rgba(11,102,48,0.08)":isMiss?"rgba(192,57,43,0.06)":"rgba(0,0,0,0.03)",
                          border:`1px solid ${isDone?"rgba(168,224,44,0.3)":isMiss?"rgba(192,57,43,0.18)":"rgba(0,0,0,0.05)"}` }}>
                          <div style={{ fontSize:15 }}>{isDone?"✅":isMiss?"❌":"⬜"}</div>
                          <div style={{ flex:1, fontSize:13, fontWeight:600, color:"#1a3329" }}>{name}</div>
                          <div style={{ fontSize:11, fontWeight:700, color:isDone?"#0b6630":isMiss?"#c0392b":"#9ab8ae" }}>
                            {isDone?"Done":isMiss?"Missed":"—"}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}

            <button className="pr-btn-glass" style={{ width:"100%", justifyContent:"center", marginTop:20 }}
              onClick={() => setSelectedDay(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
