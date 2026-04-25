import { useAuth } from "../../context/Authcontext";
import { useEffect, useState } from "react";

export default function OverviewPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    patients: 0,
    plans: 0,
    sessionsToday: 0,
  });

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        // ✅ COOKIE AUTH ONLY (NO TOKEN)
        const [sessionsRes, plansRes, subsRes] = await Promise.all([
          fetch("http://localhost:5000/sessions/mine", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/plans/mine", {
            credentials: "include",
          }),
          fetch("http://localhost:5000/subscriptions/nutrition", {
            credentials: "include",
          }),
        ]);

        // ⚠️ handle unauthorized early
        if (!sessionsRes.ok || !plansRes.ok || !subsRes.ok) {
          throw new Error("Unauthorized or backend error");
        }

        const sessions = await sessionsRes.json();
        const plans = await plansRes.json();
        const subs = await subsRes.json();

        // safety check (VERY IMPORTANT)
        const sessionsArr = Array.isArray(sessions) ? sessions : [];
        const plansArr = Array.isArray(plans) ? plans : [];
        const subsArr = Array.isArray(subs) ? subs : [];

        // ✅ TODAY FILTER
        const today = new Date().toDateString();

        const todaySessions = sessionsArr.filter((s) => {
          if (!s.date) return false;
          return new Date(s.date).toDateString() === today;
        });

        // ✅ STATS
        setStats({
          patients: subsArr.length,
          plans: plansArr.length,
          sessionsToday: todaySessions.length,
        });

        // ✅ APPOINTMENTS FORMAT
        const formatted = todaySessions.map((s) => {
          const name =
            s.client?.firstName && s.client?.lastName
              ? `${s.client.firstName} ${s.client.lastName}`
              : "Unknown";

          return {
            initials: name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),

            name,
            time: s.date
              ? new Date(s.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A",

            tag: s.type || "Consultation",
            urgent: false,
          };
        });

        setAppointments(formatted);
      } catch (error) {
        console.error("❌ Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading dashboard...</div>;
  }

  const STATS = [
    { value: stats.patients, label: "Active Patients" },
    { value: stats.plans, label: "Completed Plans" },
    { value: "87%", label: "Success Rate" },
    { value: stats.sessionsToday, label: "Today's Sessions", yellow: true },
  ];

  return (
    <div>
      {/* HERO */}
      <div
        style={{
          background: "linear-gradient(135deg,#3d9b73,#2a6b4f)",
          borderRadius: 22,
          padding: "28px 32px",
          color: "white",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Good morning</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            Dr. {user?.firstName} {user?.lastName}
          </div>
          <div style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>
            You have {appointments.length} sessions scheduled today
          </div>
        </div>

        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase()}
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 16,
          marginBottom: 18,
        }}
      >
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              background: s.yellow ? "#f5e642" : "white",
              borderRadius: 20,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* APPOINTMENTS */}
      <div
        style={{
          background: "white",
          borderRadius: 22,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          Today's Appointments
        </div>

        {appointments.length === 0 ? (
          <div>No sessions today</div>
        ) : (
          appointments.map((a, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                marginBottom: 8,
                background: "#f0f7f4",
                borderRadius: 12,
              }}
            >
              <div>
                <strong>{a.name}</strong>
                <br />
                <small>
                  {a.time} · {a.tag}
                </small>
              </div>
              <span>Scheduled</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}