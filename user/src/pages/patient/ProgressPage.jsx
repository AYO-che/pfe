import { useAuth } from "../../context/Authcontext";
import { CSS, MOCK_PLAN, SectionTitle } from "./Shared";

export default function ProfileProgressPage() {
  const { user } = useAuth();
  const plan     = user?.plan || MOCK_PLAN;

  // Pull health data from user profile
  const weight = user?.profile?.weight || "";
  const height = user?.profile?.height || "";
  const goal   = user?.profile?.goal   || "";

  const bmi = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : null;

  const stats = [
    { label: "Weight", val: weight ? `${weight} kg` : "—", icon: "⚖️", color: "#1a6fa0", bg: "#e3f2fd" },
    { label: "Height", val: height ? `${height} cm` : "—", icon: "📏", color: "#2d7a4f", bg: "#e8f5e9" },
    { label: "BMI",    val: bmi    || "—",                  icon: "🔬", color: "#7a3fa0", bg: "#f3e8fd" },
    { label: "Goal",   val: goal   || "—",                  icon: "🎯", color: "#b8a200", bg: "#fefde8" },
  ];

  const weekData = [
    { day: "Mon", cal: 1820 }, { day: "Tue", cal: 1650 }, { day: "Wed", cal: 1900 },
    { day: "Thu", cal: 1740 }, { day: "Fri", cal: 1680 }, { day: "Sat", cal: 2100 }, { day: "Sun", cal: 1580 },
  ];
  const target = 1800;
  const maxCal = Math.max(...weekData.map(d => d.cal));

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>Progress Monitoring</div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4 }}>Track your health metrics and weekly calorie intake.</div>
      </div>

      <div className="pr-slide-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12 }}>
          {stats.map(s => (
            <div key={s.label} className="pr-card" style={{ padding: "16px" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ab8ae", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Plan Progress */}
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

        {/* Weekly Calories Bar Chart */}
        <div className="pr-card">
          <SectionTitle bg="#fefde8" title="Weekly Calories" icon="🔥" />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
            {weekData.map(d => {
              const over = d.cal > target;
              return (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 9.5, color: over ? "#c0392b" : "#2d7a4f", fontWeight: 700, textAlign: "center" }}>{d.cal}</div>
                  <div style={{
                    width: "100%", borderRadius: "5px 5px 0 0",
                    height: `${(d.cal / maxCal) * 80}px`,
                    background: over ? "linear-gradient(180deg,#f5b8b8,#e88)" : "linear-gradient(180deg,#3d9b73,#2d6b50)",
                    transition: "height 0.6s ease",
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
    </div>
  );
}