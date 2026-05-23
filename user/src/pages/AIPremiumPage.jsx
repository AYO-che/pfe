import { authFetch } from "../context/Authcontext";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp   { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pulse    { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
@keyframes spin     { to { transform: rotate(360deg) } }
@keyframes slideDown{ from { opacity:0; transform:translateY(-10px) } to { opacity:1; transform:translateY(0) } }

.pr-fade { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both }

.pr-card {
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
  display: flex;
  flex-direction: column;
}
.pr-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
  transform: translateY(-4px);
}
.pr-card.featured {
  border-top:    1.5px solid rgba(245,230,66,0.9);
  border-left:   1.5px solid rgba(245,230,66,0.9);
  border-bottom: 1.5px solid rgba(168,224,44,0.8);
  border-right:  1.5px solid rgba(168,224,44,0.8);
}

.pr-btn {
  width: 100%; padding: 13px 0; border-radius: 14px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'Inter', sans-serif; border: none;
  transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.pr-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
.pr-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.pr-spinner {
  width: 16px; height: 16px;
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

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Given a sorted array of offers (cheapest → most expensive),
 * assign a positional badge + featured flag.
 *
 * Rules:
 *  • 1 offer  → always "Featured"
 *  • 2 offers → first = "Starter", second = "Best Value" + featured
 *  • 3+ offers→ first = "Free Trial" (if free) or "Starter"
 *               middle = "Most Popular" + featured
 *               last   = "Best Value"
 *               any extras between = "Popular"
 */
function enrichOffers(offers) {
  const total = offers.length;
  if (total === 0) return [];

  const middleIndex = Math.floor((total - 1) / 2);

  return offers.map((offer, i) => {
    const isFree     = Number(offer.price) === 0;
    const isFirst    = i === 0;
    const isLast     = i === total - 1;
    const isFeatured = total === 1 ? true : i === middleIndex;

    let badge;
    if (total === 1) {
      badge = "Featured";
    } else if (total === 2) {
      badge = isFirst ? "Starter" : "Best Value";
    } else {
      if (isFirst)        badge = isFree ? "Free Trial" : "Starter";
      else if (isFeatured) badge = "Most Popular";
      else if (isLast)    badge = "Best Value";
      else                badge = "Popular";
    }

    // Price display
    const priceDisplay = isFree ? "Free" : `$${Number(offer.price).toFixed(2)}`;

    // Period display
    let period;
    if (isFree) {
      period = `${offer.durationDays} days · no card needed`;
    } else if (offer.durationDays >= 300) {
      period = "per year";
    } else if (offer.durationDays >= 25 && offer.durationDays <= 35) {
      period = "per month";
    } else {
      period = `${offer.durationDays} days access`;
    }

    // CTA label
    let cta;
    if (isFree)        cta = "Start Free Trial";
    else if (isFeatured) cta = `Get ${offer.name}`;
    else               cta = "Get Started";

    // Features: parse newline/comma/semicolon separated description,
    // fall back to a sensible default list built from offer fields.
    let features = [];
    if (offer.description && offer.description.trim().length > 0) {
      // Split on newlines, commas, or semicolons
      features = offer.description
        .split(/[\n,;]+/)
        .map(f => f.trim())
        .filter(f => f.length > 2);
    }
    // If nothing parsed, build generic features from offer data
    if (features.length === 0) {
      features = [
        isFree ? "AI food recognition" : "Unlimited AI food scans",
        "Calorie & macro tracking",
        `${offer.durationDays}-day meal history`,
        "Nutrition insights",
      ];
      if (!isFree) features.push("Priority support");
    }

    return {
      offerId:  offer.id,
      label:    offer.name,
      price:    priceDisplay,
      period,
      badge,
      featured: isFeatured,
      isFree,
      cta,
      features,
      rawPrice: Number(offer.price),
    };
  });
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function Check() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none"
      stroke="#0b6630" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── PlanCard ────────────────────────────────────────────────────────────────

function PlanCard({ plan, index, onSelect, trialUsed, loadingId }) {
  const isTrialDone = plan.isFree && trialUsed;
  const isLoading   = loadingId === plan.offerId;

  return (
    <div
      className={`pr-card pr-fade${plan.featured ? " featured" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 4,
        background: plan.featured
          ? "linear-gradient(90deg,rgba(168,224,44,0.9),rgba(0,168,84,0.8))"
          : "rgba(168,224,44,0.3)",
      }} />

      {/* Featured ribbon */}
      {plan.featured && (
        <div style={{
          background: "linear-gradient(135deg,#0b6630,#2d7a4f)",
          padding: "7px 20px", textAlign: "center",
          fontSize: 11.5, fontWeight: 800,
          color: "rgba(168,224,44,0.95)",
          letterSpacing: 0.5, textTransform: "uppercase",
        }}>
          ⭐ Most Popular
        </div>
      )}

      <div style={{
        padding: "24px 22px 26px",
        display: "flex", flexDirection: "column", flex: 1,
        background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)",
      }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(168,224,44,0.15)",
          border: "1px solid rgba(168,224,44,0.4)",
          borderRadius: 999, padding: "5px 12px",
          fontSize: 11, fontWeight: 700, color: "#0b6630",
          textTransform: "uppercase", letterSpacing: 0.4,
          marginBottom: 16, width: "fit-content",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#0b6630", display: "inline-block",
            animation: "pulse 2s infinite",
          }} />
          {plan.badge}
        </div>

        {/* Plan name */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 24, fontWeight: 800, color: "#1a3329", marginBottom: 4,
        }}>
          {plan.label}
        </div>

        {/* Price */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36, fontWeight: 800,
          color: plan.featured ? "#0b6630" : "#1a3329",
          lineHeight: 1, marginBottom: 4,
        }}>
          {plan.price}
        </div>

        {/* Period */}
        <div style={{ fontSize: 12.5, color: "#5a7a6e", fontWeight: 500, marginBottom: 20 }}>
          {plan.period}
        </div>

        <div style={{ height: 1, background: "rgba(0,168,84,0.1)", marginBottom: 16 }} />

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22, flex: 1 }}>
          {plan.features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#2a4a3e" }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "rgba(168,224,44,0.15)",
                border: "1.5px solid rgba(0,168,84,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Check />
              </div>
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        {isTrialDone ? (
          <div style={{
            width: "100%", padding: "13px 0", borderRadius: 14,
            background: "rgba(168,224,44,0.08)",
            border: "1px solid rgba(0,168,84,0.15)",
            textAlign: "center", fontSize: 14, color: "#9ab5a5",
            fontFamily: "'Inter', sans-serif", fontWeight: 700,
          }}>
            Trial Used ✓
          </div>
        ) : (
          <button
            className="pr-btn"
            onClick={() => onSelect(plan)}
            disabled={!!loadingId}
            style={plan.featured
              ? { background: "linear-gradient(135deg,#0b6630,#2d7a4f)", color: "#fff", border: "none", boxShadow: "0 6px 18px rgba(11,102,48,0.25)" }
              : { background: "rgba(168,224,44,0.15)", color: "#0b6630", border: "1.5px solid rgba(0,168,84,0.3)" }
            }
          >
            {isLoading ? <span className="pr-spinner" /> : <>{plan.cta} <ArrowRight /></>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AIPremiumPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isLoggedIn } = useAuth();

  const reason = location.state?.reason;

  const [plans,     setPlans]     = useState([]);
  const [trialUsed, setTrialUsed] = useState(false);
  const [checking,  setChecking]  = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const offersRes = await authFetch(
          "https://chrysalise-server.onrender.com/offers/ai-calories",
          { credentials: "include" }
        );
        if (!offersRes.ok) throw new Error("Failed to load plans");

        const offersData = await offersRes.json();
        const raw = offersData.offers ?? [];

        // Sort cheapest → most expensive so positional logic is reliable
        const sorted  = [...raw].sort((a, b) => Number(a.price) - Number(b.price));
        const enriched = enrichOffers(sorted);
        setPlans(enriched);

        if (!isLoggedIn) return;

        const subRes  = await authFetch("https://chrysalise-server.onrender.com/subscriptions/mine", { credentials: "include" });
        const subData = await subRes.json();
        const subs    = subData.subscriptions ?? [];
        const now     = new Date();

        const active = subs.find(s =>
          (s.status === "ACTIVE" || s.status === "TRIAL") &&
          new Date(s.endDate) > now &&
          s.offer?.type === "AI_CALORIES"
        );
        if (active) { navigate("/calories-ai", { replace: true }); return; }

        const usedTrial = subs.some(s =>
          s.offer?.type === "AI_CALORIES" && s.offer?.hasFreeTrial === true
        );
        setTrialUsed(usedTrial);

      } catch (err) {
        console.error("Load failed:", err);
        setError("Failed to load plans. Please refresh the page.");
      } finally {
        setChecking(false);
      }
    })();
  }, [isLoggedIn]);

  const handleSelect = async (plan) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: "/ai-premium" } });
      return;
    }
    setError(null);
    setLoadingId(plan.offerId);
    try {
      const res  = await authFetch("https://chrysalise-server.onrender.com/subscriptions", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: plan.offerId }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.message?.includes("already have")) {
          navigate("/calories-ai", { replace: true }); return;
        }
        throw new Error(data.message ?? "Something went wrong");
      }

      if (plan.isFree || data.isFree) {
        navigate("/calories-ai", { replace: true });
      } else {
        navigate("/payment", {
          state: {
            subscriptionId: data.subscription.id,
            offerId:        plan.offerId,
            offerLabel:     plan.label,
            price:          plan.price,
          },
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  if (checking) return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(0,168,84,0.2)", borderTop: "3px solid #0b6630", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'Inter', sans-serif" }}>
      <style>{CSS}</style>

      {/* Trial-expired banner */}
      {reason === "trial-expired" && (
        <div style={{
          background: "linear-gradient(135deg,#fff8e1,#fffde7)",
          borderBottom: "1.5px solid rgba(245,180,0,0.35)",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontSize: 14, color: "#7a5800", fontWeight: 600,
          animation: "slideDown 0.4s ease both",
        }}>
          <span style={{ fontSize: 20 }}>⏱️</span>
          Your free trial has ended. Upgrade to keep using AI calorie tracking.
        </div>
      )}

      {/* Hero */}
      <section style={{
        position: "relative", background: "#1a5c35",
        padding: "60px 24px 64px", textAlign: "center", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(45,122,60,0.55) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", marginBottom: 26 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            border: "1px solid rgba(245,230,66,0.45)",
            borderRadius: 999, padding: "7px 16px",
            fontSize: 11, fontWeight: 700, color: "#f5e642",
            letterSpacing: "1.8px", textTransform: "uppercase",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642" }} />
            AI · QR Code Scanner · Calorie Tracking
          </span>
        </div>

        <h1 style={{
          position: "relative",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(36px, 6vw, 52px)",
          fontWeight: 800, color: "#fff",
          lineHeight: 1.07, letterSpacing: -1.5, marginBottom: 18,
        }}>
          Know exactly what<br />
          <span style={{ color: "#f5e642" }}>you're eating.</span>
        </h1>

        <p style={{
          position: "relative",
          fontSize: 15, color: "rgba(255,255,255,0.62)",
          lineHeight: 1.8, maxWidth: 440, margin: "0 auto 42px",
        }}>
          Scan any meal with AI or share your plate via QR code — get instant
          calorie breakdowns in under 3 seconds.
        </p>

        <div style={{
          position: "relative",
          display: "flex", justifyContent: "center",
          alignItems: "flex-start", gap: 48, flexWrap: "wrap",
        }}>
          {[["50K+","Meals scanned"],["6","Specialists"],["98%","AI accuracy"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 40px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 className="pr-fade" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28, fontWeight: 800, color: "#1a3329",
            marginBottom: 8, letterSpacing: -0.5,
          }}>
            Choose your plan
          </h2>
          <p style={{ fontSize: 14, color: "#5a7a6e" }}>Start free, upgrade anytime. No hidden fees.</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(192,57,43,0.2)", borderRadius: 14,
            padding: "14px 20px", marginBottom: 24,
            color: "#c0392b", fontSize: 13.5,
            display: "flex", alignItems: "center", gap: 12,
            maxWidth: 600, margin: "0 auto 24px",
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)}
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#c0392b", fontWeight: 700, fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Grid — columns adapt to number of offers */}
        <div
          className="pr-grid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(Math.max(plans.length, 1), 3)}, 1fr)`,
            gap: 22, alignItems: "start",
          }}
        >
          {plans.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#5a7a6e", fontSize: 14, padding: "40px 0" }}>
              No plans available at the moment.
            </div>
          ) : (
            plans.map((plan, i) => (
              <PlanCard
                key={plan.offerId}
                plan={plan}
                index={i}
                onSelect={handleSelect}
                trialUsed={trialUsed}
                loadingId={loadingId}
              />
            ))
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "#5a7a6e" }}>
          🔒 Secure payments · Cancel anytime · Free trial requires no credit card
        </div>
      </div>
    </div>
  );
}

