import { useState } from "react";

const MOODS = [
  { label: "Low",       sub: "Not great"   },
  { label: "Okay",      sub: "Manageable"  },
  { label: "Good",      sub: "Feeling fine"},
  { label: "Great",     sub: "Doing well"  },
  { label: "Excellent", sub: "Best day"    },
];

const SYMPTOMS_LIST = [
  "Fatigue", "Bloating", "Headache", "Brain Fog",
  "Poor Sleep", "Cravings", "Low Energy", "No Symptoms",
];

const MOOD_COLORS = {
  Low:       { bg: "#fff5f5", color: "#c53030", tag: "#fee2e2" },
  Okay:      { bg: "#fff8e1", color: "#b8a200", tag: "#fef9c3" },
  Good:      { bg: "#e8f5e9", color: "#2d7a4f", tag: "#e8f5e9" },
  Great:     { bg: "#e8f5e9", color: "#2d7a4f", tag: "#e8f5e9" },
  Excellent: { bg: "#e8f5ef", color: "#1a3329", tag: "#d1fae5" },
};
const CSS = `

.pr-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
  border: 1px solid #eef4f1;
}

/* MOOD */
.mood-btn {
  flex: 1;
  min-width: 90px;
  padding: 14px 10px;
  border-radius: 14px;
  border: 1.5px solid #e3f2fd;
  background: #f8fbff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}

.mood-btn:hover {
  background: #eef6ff;
  transform: translateY(-1px);
}

.mood-btn.selected {
  border-color: #2d6b50;
  background: #e8f5ef;
}

.mood-label {
  font-size: 13px;
  font-weight: 700;
  color: #1a3329;
}

.mood-sub {
  font-size: 11px;
  color: #94a3b8;
}

/* SYMPTOMS */
.symptom-tag {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid #e3f2fd;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fbff;
  font-family: 'DM Sans', sans-serif;
  color: #334155;
}

.symptom-tag:hover {
  background: #eef6ff;
}

.symptom-tag.active {
  background: linear-gradient(135deg,#1a3329,#2d6b50);
  color: #f5e642;
  border: none;
}

/* SLIDER */
.energy-track {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: #e3f2fd;
  outline: none;
  cursor: pointer;
  accent-color: #2d6b50;
}

/* HISTORY */
.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}

.log-item:hover {
  background: #f8fbff;
  border-radius: 10px;
  padding-left: 6px;
  padding-right: 6px;
}

.log-item:last-child {
  border: none;
}

.mood-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

/* BUTTON */
.save-btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg,#1a3329,#2d6b50);
  color: #f5e642;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(26,51,41,0.25);
}

/* TOAST */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a3329;
  color: #f5e642;
  padding: 12px 22px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  z-index: 999;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

`;

const STORAGE_KEY = "chrysalis_mood_logs";

function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function MoodPage() {
  const [mood, setMood] = useState("Good");
  const [symptoms, setSymptoms] = useState([]);
  const [energy, setEnergy] = useState(7);
  const [logs, setLogs] = useState(loadLogs);
  const [toast, setToast] = useState(false);

  const toggleSymptom = (s) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      mood,
      symptoms: [...symptoms],
      energy,
    };

    const updated = [entry, ...logs].slice(0, 30);
    setLogs(updated);
    saveLogs(updated);

    setSymptoms([]);
    setEnergy(7);
    setMood("Good");

    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#1a3329" }}>
          Mood & Symptoms
        </div>
        <div style={{ fontSize:13, color:"#9ab8ae", marginTop:4 }}>
          Log how you feel each day to help your nutritionist adjust your plan
        </div>
      </div>

      {/* Form */}
      <div className="pr-card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, marginBottom:16 }}>
          How are you feeling today?
        </div>

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
          {MOODS.map((m) => (
            <button
              key={m.label}
              className={`mood-btn ${mood === m.label ? "selected" : ""}`}
              onClick={() => setMood(m.label)}
            >
              <span className="mood-label">{m.label}</span>
              <span className="mood-sub">{m.sub}</span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight:800, marginBottom:10 }}>
            Any symptoms today?
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {SYMPTOMS_LIST.map((s) => (
              <button
                key={s}
                className={`symptom-tag ${symptoms.includes(s) ? "active" : ""}`}
                onClick={() => toggleSymptom(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>
            Energy: <span style={{ color:"#2d6b50" }}>{energy}/10</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            className="energy-track"
            onChange={(e) => setEnergy(Number(e.target.value))}
          />
        </div>

        <button className="save-btn" onClick={handleSave}>
          ✓ Save Today's Log
        </button>
      </div>

      {/* History */}
      <div className="pr-card">
        <div style={{ fontWeight:800, marginBottom:16 }}>
          Recent History
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign:"center", color:"#9ab8ae" }}>
            No logs yet
          </div>
        ) : (
          logs.slice(0, 7).map((log) => {
            const meta = MOOD_COLORS[log.mood] || MOOD_COLORS.Good;
            return (
              <div key={log.id} className="log-item">
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{
                    width:36, height:36, borderRadius:10,
                    background:meta.bg, display:"flex",
                    alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:800, color:meta.color
                  }}>
                    {formatDate(log.date)}
                  </div>

                  <div>
                    <div style={{ fontWeight:800 }}>{log.mood}</div>
                    <div style={{ fontSize:12, color:"#9ab8ae" }}>
                      Energy {log.energy}/10
                    </div>
                  </div>
                </div>

                <div style={{ display:"flex", gap:6 }}>
                  {log.symptoms.length > 0
                    ? log.symptoms.slice(0,2).map(s => (
                        <span key={s} className="mood-tag" style={{ background:meta.tag, color:meta.color }}>
                          {s}
                        </span>
                      ))
                    : <span className="mood-tag">No Symptoms</span>
                  }

                   <button
          onClick={() => {
            const updated = logs.filter((l) => l.id !== log.id);
            setLogs(updated);
            saveLogs(updated);
          }}
          style={{
            background: "rgba(229,62,62,0.08)",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            padding: "6px 8px",
            color: "#e53e3e",
            lineHeight: 0,
            transition: "background 0.2s",
            marginLeft: 4,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {toast && <div className="toast">✓ Mood logged successfully!</div>}
    </>
  );
}