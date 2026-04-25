import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const CSS = `
@keyframes fadeUp{
  from{opacity:0;transform:translateY(24px)}
  to{opacity:1;transform:translateY(0)}
}

.pl-card{
  background:#fff;
  border-radius:20px;
  padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);
  animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
`;

export default function NutritionPlansPage() {
  const location = useLocation();
  const patientId = new URLSearchParams(location.search).get("patient");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("http://localhost:5000/plans/mine", {
          credentials: "include", // ✅ COOKIE AUTH
        });

        if (!res.ok) {
          throw new Error("Unauthorized or failed request");
        }

        const data = await res.json();

        // ✅ SAFETY CHECK
        const safePlans = Array.isArray(data) ? data : [];

        setPlans(safePlans);
      } catch (err) {
        console.error("❌ Plans error:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading plans...</div>;
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
          Diet Plans
        </div>

        <div style={{ fontSize: 13, color: "#9ab8ae", marginTop: 4 }}>
          {patientId
            ? `Viewing patient: ${patientId}`
            : "Create and manage nutrition plans for your patients"}
        </div>
      </div>

      {/* NO PLANS */}
      {plans.length === 0 ? (
        <div className="pl-card">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🥗</div>
            <div
              style={{
                fontFamily: "Syne,sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: "#1a3329",
                marginBottom: 6,
              }}
            >
              No plans yet
            </div>
            <div style={{ fontSize: 13, color: "#9ab8ae" }}>
              Create your first nutrition plan.
            </div>
          </div>
        </div>
      ) : (
        plans.map((plan) => (
          <div key={plan._id} className="pl-card" style={{ marginBottom: 16 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "#1a3329",
                marginBottom: 6,
              }}
            >
              {plan.title}
            </div>

            <div style={{ fontSize: 13, color: "#9ab8ae" }}>
              {plan.description || "No description"}
            </div>
          </div>
        ))
      )}
    </>
  );
}