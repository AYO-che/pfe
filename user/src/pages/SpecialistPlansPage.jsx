import { authFetch } from "../context/Authcontext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp  { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pulse   { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
@keyframes spin    { to { transform: rotate(360deg) } }

.pr-fade    { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both }
.pr-fade-d1 { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both }
.pr-fade-d2 { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both }
.pr-fade-d3 { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.21s both }

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
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
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
  font-family: 'Inter', sans-serif;
  transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  border: none;
}
.pr-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
.pr-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 900px) {
  .pr-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
}
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Enrich specialist offers sorted by sessionsCount asc.
 * Positional badge rules:
 *  • 1 offer  → "Featured"
 *  • 2 offers → "Starter" / "Best Value" (featured)
 *  • 3+ offers→ first = "Starter", middle = "Most Popular" (featured), last = "Best Value"
 */
function enrichOffers(offers) {
  const total = offers.length;
  if (total === 0) return [];
  const midIndex = Math.floor((total - 1) / 2);

  return offers.map((offer, i) => {
    const isFeatured = total === 1 ? true : i === midIndex;

    let badge;
    if (total === 1)         badge = "Featured";
    else if (total === 2)    badge = i === 0 ? "Starter" : "Best Value";
    else if (i === 0)        badge = "Starter";
    else if (isFeatured)     badge = "Most Popular";
    else if (i === total-1)  badge = "Best Value";
    else                     badge = "Popular";

    return { ...offer, featured: isFeatured, badge };
  });
}

// ─── Icons ───────────────────────────────────────────────────────────────────

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

function PlanCard({ offer, index, onSelect }) {
  const { featured, badge } = offer;

  // Build feature list purely from offer fields — no hardcoded text dependency
  const features = [
    `${offer.sessionsCount} session${offer.sessionsCount > 1 ? "s" : ""} with your nutritionist`,
    "Personalized nutrition plan included",
    offer.chatDays > 0 ? `${offer.chatDays} days of chat access` : null,
    `${offer.durationDays} days subscription`,
    "Zoom video sessions",
    "Cancel anytime",
  ].filter(Boolean);

  return (
    <div
      className={`pr-card pr-fade${featured ? " featured" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 4,
        background: featured
          ? "linear-gradient(90deg,rgba(168,224,44,0.9),rgba(0,168,84,0.8))"
          : "rgba(168,224,44,0.3)",
      }} />

      {/* Featured ribbon */}
      {featured && (
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
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(10px)",
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
          {badge}
        </div>

        {/* Plan name */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 22, fontWeight: 800, color: "#1a3329", marginBottom: 8,
        }}>
          {offer.name}
        </div>

        {/* Sessions + chat pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(168,224,44,0.1)",
          border: "1px solid rgba(0,168,84,0.2)",
          borderRadius: 999, padding: "4px 12px",
          fontSize: 12, fontWeight: 700, color: "#0b6630",
          marginBottom: 14, width: "fit-content",
        }}>
          📅 {offer.sessionsCount} Session{offer.sessionsCount > 1 ? "s" : ""}
          {offer.chatDays > 0 && ` · 💬 ${offer.chatDays}d Chat`}
        </div>

        {/* Price */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 36, fontWeight: 800,
          color: featured ? "#0b6630" : "#1a3329",
          lineHeight: 1, marginBottom: 4,
        }}>
          ${Number(offer.price).toFixed(2)}
        </div>
        <div style={{ fontSize: 12.5, color: "#5a7a6e", fontWeight: 500, marginBottom: 16 }}>
          {offer.durationDays} days access
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(0,168,84,0.1)", marginBottom: 16 }} />

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22, flex: 1 }}>
          {features.map(f => (
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
        <button
          className="pr-btn"
          onClick={() => onSelect(offer)}
          style={featured
            ? { background: "linear-gradient(135deg,#0b6630,#2d7a4f)", color: "#fff", boxShadow: "0 6px 18px rgba(11,102,48,0.25)" }
            : { background: "rgba(168,224,44,0.15)", color: "#0b6630", border: "1.5px solid rgba(0,168,84,0.3)" }
          }
        >
          Meet Your Expert <ArrowRight />
        </button>

      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SpecialistPlansPage() {
  const navigate          = useNavigate();
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    authFetch("https://chrysalise-server.onrender.com/offers/packages", { credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        // Sort by sessionsCount ascending, then enrich with positional styling
        const sorted   = (data.offers ?? []).sort((a, b) => a.sessionsCount - b.sessionsCount);
        const enriched = enrichOffers(sorted);
        setOffers(enriched);
      })
      .catch(() => setError("Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (offer) => {
    navigate("/specialists", {
      state: {
        selectedOffer: {
          id:            offer.id,
          name:          offer.name,
          price:         offer.price,
          durationDays:  offer.durationDays,
          sessionsCount: offer.sessionsCount,
          chatDays:      offer.chatDays,
        },
      },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'Inter', sans-serif" }}>
      <style>{CSS}</style>
      <Header />

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

        <div style={{ position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" }}>

          <div className="pr-fade" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            border: "1px solid rgba(245,230,66,0.45)",
            borderRadius: 999, padding: "7px 16px",
            fontSize: 11, fontWeight: 700, color: "#f5e642",
            letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: 24,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642" }} />
            Specialist Nutrition Packages
          </div>

          <h1 className="pr-fade pr-fade-d1" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800, color: "#fff",
            lineHeight: 1.07, letterSpacing: -1.5, marginBottom: 16,
          }}>
            Real guidance from<br />
            <span style={{ color: "#f5e642" }}>certified experts.</span>
          </h1>

          <p className="pr-fade pr-fade-d2" style={{
            fontSize: 15, color: "rgba(255,255,255,0.62)",
            lineHeight: 1.8, maxWidth: 460, margin: "0 auto 40px",
          }}>
            Work 1-on-1 with a certified nutritionist via{" "}
            <strong style={{ color: "rgba(255,255,255,0.88)", fontWeight: 600 }}>video sessions</strong>,
            get a personalised plan, and chat access — all in one package.
          </p>

          <div className="pr-fade pr-fade-d3" style={{
            display: "flex", justifyContent: "center",
            alignItems: "flex-start", gap: 48, flexWrap: "wrap",
          }}>
            {[["500+","Patients helped"],["4.85★","Avg. rating"],["6","Specialists"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 className="pr-fade" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28, fontWeight: 800, color: "#1a3329",
            marginBottom: 8, letterSpacing: -0.5,
          }}>
            Choose your package
          </h2>
          <p style={{ fontSize: 14, color: "#5a7a6e" }}>
            Every package includes sessions + a personalised plan + chat access.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{ width: 40, height: 40, border: "3px solid rgba(0,168,84,0.2)", borderTop: "3px solid #0b6630", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,168,84,0.2)", borderRadius: 14,
            padding: "14px 20px", color: "#0b6630", fontSize: 13.5,
            display: "flex", alignItems: "center", gap: 12,
            maxWidth: 500, margin: "0 auto",
          }}>
            <span style={{ fontSize: 18 }}>🌿</span>
            <span>{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && offers.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#5a7a6e", fontSize: 15 }}>
            No packages available yet.
          </div>
        )}

        {/* Cards — grid adapts to number of offers (max 3 columns) */}
        {!loading && !error && offers.length > 0 && (
          <div
            className="pr-grid"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(offers.length, 3)}, 1fr)`,
              gap: 22, alignItems: "start",
            }}
          >
            {offers.map((offer, i) => (
              <PlanCard key={offer.id} offer={offer} index={i} onSelect={handleSelect} />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "#5a7a6e" }}>
          🔒 Secure payments · Cancel anytime · All specialists are certified
        </div>

      </div>

      <Footer />
    </div>
  );
}

