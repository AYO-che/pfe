import { useEffect, useState } from "react";

const CSS = `
@keyframes fadeUp{
  from{opacity:0;transform:translateY(24px)}
  to{opacity:1;transform:translateY(0)}
}

.cs-card{
  background:#fff;
  border-radius:20px;
  padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);
  animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
`;

export default function ConsultationsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("http://localhost:5000/sessions/mine", {
          method: "GET",
          credentials: "include", // ✅ IMPORTANT (cookies)
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Consultations error:", err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading consultations...</div>;
  }

  return (
    <>
      <style>{CSS}</style>

      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontFamily: "Syne,sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: "#1a3329",
          }}
        >
          Consultations
        </div>

        <div style={{ fontSize: 13, color: "#9ab8ae", marginTop: 4 }}>
          Your scheduled and past sessions
        </div>
      </div>

      {/* EMPTY STATE */}
      {sessions.length === 0 ? (
        <div className="cs-card">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div
              style={{
                fontFamily: "Syne,sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: "#1a3329",
                marginBottom: 6,
              }}
            >
              No consultations yet
            </div>
            <div style={{ fontSize: 13, color: "#9ab8ae" }}>
              Your sessions will appear here.
            </div>
          </div>
        </div>
      ) : (
        // LIST SESSIONS
        sessions.map((s) => (
          <div key={s._id} className="cs-card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>
              {s.client?.firstName} {s.client?.lastName}
            </div>

            <div style={{ fontSize: 13, color: "#9ab8ae" }}>
              {s.type || "Consultation"} ·{" "}
              {s.date
                ? new Date(s.date).toLocaleString()
                : "No date"}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: s.status === "COMPLETED" ? "green" : "#9a3412",
              }}
            >
              {s.status || "Scheduled"}
            </div>
          </div>
        ))
      )}
    </>
  );
}