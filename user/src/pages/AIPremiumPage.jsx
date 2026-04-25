import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes spin   { to{transform:rotate(360deg)} }

.pr-fade { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both }

.pr-card {
  background: #fff;
  border-radius: 24px;
  border: 1.5px solid rgba(79,158,122,0.15);
  box-shadow: 0 4px 24px rgba(26,51,41,0.07);
  overflow: hidden;
  transition: all 0.32s cubic-bezier(0.22,1,0.36,1);
  display: flex;
  flex-direction: column;
}
.pr-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 48px rgba(26,51,41,0.14);
}
.pr-card.featured {
  border: 2px solid #2d7a4f;
  box-shadow: 0 8px 32px rgba(45,122,79,0.18);
}

.pr-btn {
  width: 100%; padding: 14px 0; border-radius: 14px;
  font-size: 15px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif; border: none;
  transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.pr-btn:hover { transform: translateY(-2px); filter: brightness(1.06); }
.pr-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }

.pr-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@media (max-width: 900px) {
  .pr-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
}
`;

function Check({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function PlanCard({ plan, index, onSelect, loadingId }) {
  const isLoading = loadingId === plan.id;

  // Determine accent & featured styling
  // Mark the first non-free plan or the one with most features as featured
  const accent = plan.featured ? "#2d7a4f" : plan.hasFreeTrial ? "#2d7a4f" : "#1a3329";

  // Parse features from description or fallback
  const features = plan.features ?? (plan.description ? [plan.description] : []);

  return (
    <div
      className={`pr-card pr-fade ${plan.featured ? "featured" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Top bar */}
      <div style={{ height: 5, background: plan.featured ? "linear-gradient(90deg,#1a3329,#2d7a4f)" : `${accent}25` }} />

      {/* Popular ribbon */}
      {plan.featured && (
        <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", padding: "7px 20px", textAlign: "center", fontSize: 11.5, fontWeight: 800, color: "#f5e642", letterSpacing: 0.5, textTransform: "uppercase" }}>
          ⭐ Most Popular
        </div>
      )}

      <div style={{ padding: "26px 24px 28px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${accent}10`, border: `1px solid ${accent}28`, borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 18, width: "fit-content" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", animation: "pulse 2s infinite" }} />
          {plan.type ?? (plan.hasFreeTrial ? "Free Trial" : "Premium")}
        </div>

        {/* Name */}
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#1a3329", marginBottom: 4 }}>
          {plan.name}
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, color: plan.featured ? "#2d7a4f" : "#1a3329", lineHeight: 1 }}>
            {plan.price === 0 || plan.price === "0" ? "Free" : `${plan.price} DA`}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "#5a7a6e", fontWeight: 500, marginBottom: 14 }}>
          {plan.durationDays} days{plan.hasFreeTrial ? " · no card needed" : ""}
        </div>

        {/* Desc */}
        <p style={{ fontSize: 13.5, color: "#5a7a6e", lineHeight: 1.7, marginBottom: 20, minHeight: 44 }}>
          {plan.description}
        </p>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(79,158,122,0.1)", marginBottom: 18 }} />

        {/* Features */}
        {features.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
            {features.map((f, fi) => (
              <div key={fi} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#2a4a3e" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: `${accent}12`, border: `1.5px solid ${accent}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check color={accent} />
                </div>
                {f}
              </div>
            ))}
          </div>
        )}

        {/* Free trial badge */}
        {plan.hasFreeTrial && (
          <div style={{ marginBottom: 12, fontSize: 12, color: "#2d7a4f", fontWeight: 700 }}>
            🔥 Free Trial Available
          </div>
        )}

        {/* CTA */}
        <button
          className="pr-btn"
          onClick={() => onSelect(plan)}
          disabled={!!loadingId}
          style={
            plan.featured
              ? { background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", boxShadow: "0 6px 20px rgba(26,51,41,0.25)" }
              : { background: "transparent", color: accent, border: `1.5px solid ${accent}` }
          }
        >
          {isLoading
            ? <span className="pr-spinner" style={{ borderTopColor: plan.featured ? "#f5e642" : accent }} />
            : <>
                Choose Plan
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
          }
        </button>

      </div>
    </div>
  );
}

export default function AIPremiumPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(true);

  // ── Load offers ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/offers", { credentials: "include" });
        const data = await res.json();
        // Mark the middle plan (index 1) as featured if not already set
        const offers = (data.offers ?? []).map((o, i) => ({ ...o, featured: o.featured ?? i === 1 }));
        setPlans(offers);
      } catch {
        setError("Failed to load offers.");
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  // ── Select plan ───────────────────────────────────────────────────────────
  const handleSelect = async (plan) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: "/premium" } });
      return;
    }
    setError(null);
    setLoadingId(plan.id);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ offerId: plan.id }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.message?.includes("already have")) {
          navigate("/calories-ai");
          return;
        }
        throw new Error(data.message ?? "Something went wrong");
      }

      if (plan.hasFreeTrial || data.isFree) {
        navigate("/calories-ai");
      } else {
        navigate("/payment", {
          state: {
            subscriptionId: data.subscription?.id,
            offerId: plan.id,
            offerLabel: plan.name,
            price: plan.price,
          },
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e8f5ee 0%,#eafaf0 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(45,122,79,0.2)", borderTop: "3px solid #2d7a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e8f5ee 0%,#eafaf0 100%)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)", padding: "52px 24px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, right: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,230,66,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>

          <div className="pr-fade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12.5, fontWeight: 700, color: "#f5e642", marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642", animation: "pulse 2s ease infinite", display: "inline-block" }} />
            AI · QR Code Scanner · Calorie Tracking
          </div>

          <h1 className="pr-fade" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,5vw,52px)", fontWeight: 800, color: "#fff", letterSpacing: -1.5, lineHeight: 1.06, marginBottom: 14, animationDelay: "0.1s" }}>
            Know exactly what<br /><span style={{ color: "#f5e642" }}>you're eating.</span>
          </h1>

          <p className="pr-fade" style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.8, animationDelay: "0.2s" }}>
            Scan any meal with AI or share your plate via <strong style={{ color: "rgba(255,255,255,0.9)" }}>QR code</strong> — get instant calorie breakdowns in under 3 seconds.
          </p>

          <div className="pr-fade" style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap", animationDelay: "0.3s" }}>
            {[["50K+", "Meals scanned"], ["98%", "AI accuracy"], ["3s", "Avg scan time"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Plans ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 className="pr-fade" style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: "#1a3329", marginBottom: 8, letterSpacing: -0.5 }}>
            Choose your plan
          </h2>
          <p className="pr-fade" style={{ fontSize: 14.5, color: "#5a7a6e", animationDelay: "0.1s" }}>
            Start free, upgrade anytime. No hidden fees.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(79,158,122,0.2)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, color: "#2d6b50", fontSize: 13.5, display: "flex", alignItems: "center", gap: 12, maxWidth: 600, margin: "0 auto 24px" }}>
            <span style={{ fontSize: 18 }}>🌿</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#2d7a4f", fontWeight: 700, fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Grid */}
        <div className="pr-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, alignItems: "start" }}>
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              onSelect={handleSelect}
              loadingId={loadingId}
            />
          ))}
        </div>

        {/* Note */}
        <div className="pr-fade" style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: "#5a7a6e", animationDelay: "0.4s" }}>
          🔒 Secure payments · Cancel anytime · Free trial requires no credit card
        </div>

      </div>
    </div>
  );
}