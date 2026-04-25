import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/subscriptions/nutrition",
          {
            credentials: "include", // ✅ COOKIE AUTH
          }
        );

        if (!res.ok) {
          throw new Error("Unauthorized or failed request");
        }

        const data = await res.json();

        // ✅ SAFE CHECK
        const safeData = Array.isArray(data) ? data : [];

        const formatted = safeData.map((sub) => {
          const firstName = sub.client?.firstName || "";
          const lastName = sub.client?.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || "Unknown";

          return {
            id: sub.client?._id,
            name: fullName,
            initials: fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            goal: sub.plan?.title || "Nutrition Plan",
            status: sub.status || "Active",
            week: "Week ?",
            yellow: sub.status !== "Active",
          };
        });

        setPatients(formatted);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  if (loading) return <div>Loading patients...</div>;

  return (
    <div>
      <h2 style={{ color: "#2a6b4f" }}>Patients</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {patients.map((p) => (
          <div
            key={p.id}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 20,
              border: "1px solid #e2ece8",
            }}
          >
            {/* HEADER */}
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 12,
                  background: p.yellow
                    ? "linear-gradient(135deg,#f5e642,#d4c200)"
                    : "linear-gradient(135deg,#3d9b73,#2a6b4f)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {p.initials}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {p.goal} · {p.week}
                </div>
              </div>

              <span
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 12,
                  background:
                    p.status === "Active" ? "#e8f5ef" : "#fff7ed",
                  color: p.status === "Active" ? "#2a6b4f" : "#9a3412",
                }}
              >
                {p.status}
              </span>
            </div>

            {/* BUTTONS */}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() =>
                  navigate(`/resume/plans?patient=${p.id}`)
                }
                style={{
                  flex: 1,
                  background: "#3d9b73",
                  color: "white",
                  border: "none",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                View Plan
              </button>

              <button
                onClick={() =>
                  navigate(`/resume/chat?user=${p.id}`)
                }
                style={{
                  flex: 1,
                  background: "#f0f7f4",
                  border: "1px solid #e2ece8",
                  padding: 8,
                  borderRadius: 10,
                  cursor: "pointer",
                }}
              >
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}