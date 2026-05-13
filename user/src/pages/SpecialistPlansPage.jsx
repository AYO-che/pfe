import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pulse  { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }

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
  width: 100%;
  padding: 14px 0;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  border: none;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.pr-btn:hover    { transform: translateY(-2px); filter: brightness(1.06); }
.pr-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }

@media (max-width: 900px) {
  .pr-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
}
`;

// Which card is "featured" based on position
const FEATURED_INDEX = 1;

function Check({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

function PlanCard({ offer, index, onSelect }) {
  const accent   = "#2d7a4f";
  const featured = index === FEATURED_INDEX;

  // Build feature bullets from offer fields
  const features = [
    `${offer.sessionsCount} session${offer.sessionsCount > 1 ? "s" : ""} with your nutritionist`,
    "Personalized nutrition plan included",
    offer.chatDays > 0 ? `${offer.chatDays} days of chat access` : null,
    `${offer.durationDays} days subscription`,
    "Zoom video sessions",
    "Cancel anytime",
  ].filter(Boolean);

  // Badge label based on sessions count
  const badge =
    offer.sessionsCount === 1 ? "Starter" :
    offer.sessionsCount === 2 ? "Most Popular" :
                                "Best Value";

  return (
    <div
      className={`pr-card pr-fade${featured ? " featured" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Top accent bar */}
      <div style={{
        height: 5,
        background: featured
          ? "linear-gradient(90deg,#1a3329,#2d6b50)"
          : `${accent}25`,
      }} />

      {/* Featured ribbon */}
      {featured && (
        <div style={{
          background: "linear-gradient(135deg,#1a3329,#2d6b50)",
          padding: "7px 20px", textAlign: "center",
          fontSize: 11.5, fontWeight: 800, color: "#f5e642",
          letterSpacing: 0.5, textTransform: "uppercase",
        }}>
          ⭐ Most Popular
        </div>
      )}

      <div style={{ padding: "26px 24px 28px", display: "flex", flexDirection: "column", flex: 1 }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${accent}10`, border: `1px solid ${accent}28`,
          borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700,
          color: accent, textTransform: "uppercase", letterSpacing: 0.4,
          marginBottom: 18, width: "fit-content",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, display: "inline-block", animation: "pulse 2s infinite" }} />
          {badge}
        </div>

        {/* Plan name */}
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", marginBottom: 4 }}>
          {offer.name}
        </div>

        {/* Sessions count pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#e8f5ef", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#1a3329", marginBottom: 12, width: "fit-content" }}>
          📅 {offer.sessionsCount} Session{offer.sessionsCount > 1 ? "s" : ""}
          {offer.chatDays > 0 && ` · 💬 ${offer.chatDays}d Chat`}
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
          <span style={{
            fontFamily: "'Syne',sans-serif", fontSize: 36, fontWeight: 800,
            color: featured ? "#2d7a4f" : "#1a3329", lineHeight: 1,
          }}>
            ${Number(offer.price).toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "#5a7a6e", fontWeight: 500, marginBottom: 14 }}>
          {offer.durationDays} days access
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(79,158,122,0.1)", marginBottom: 18 }} />

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, flex: 1 }}>
          {features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#2a4a3e" }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: `${accent}12`, border: `1.5px solid ${accent}35`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Check color={accent} />
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
            ? { background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", boxShadow: "0 6px 20px rgba(26,51,41,0.25)" }
            : { background: "transparent", color: accent, border: `1.5px solid ${accent}` }
          }
        >
          Meet Your Expert <ArrowRight />
        </button>

      </div>
    </div>
  );
}

export default function SpecialistPlansPage() {
  const navigate = useNavigate();
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

useEffect(() => {
  fetch("http://localhost:5000/offers/packages", { credentials: "include" })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => setOffers(data.offers ?? []))
    .catch(() => setError("Failed to load plans"))
    .finally(() => setLoading(false));
}, []);

  const handleSelect = (offer) => {
    // Pass the selected offer to Specialists page
    // Specialists page will show nutritionists who have this offer type
    navigate("/specialists", {
      state: {
        selectedOffer: {
          id:           offer.id,
          name:         offer.name,
          price:        offer.price,
          durationDays: offer.durationDays,
          sessionsCount: offer.sessionsCount,
          chatDays:     offer.chatDays,
        },
      },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e8f5ee 0%,#eafaf0 100%)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)", padding: "52px 24px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, right: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,230,66,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="pr-fade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12.5, fontWeight: 700, color: "#f5e642", marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642", animation: "pulse 2s ease infinite", display: "inline-block" }} />
            Specialist Nutrition Packages
          </div>

          <h1 className="pr-fade" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,5vw,52px)", fontWeight: 800, color: "#fff", letterSpacing: -1.5, lineHeight: 1.06, marginBottom: 14, animationDelay: "0.1s" }}>
            Real guidance from<br /><span style={{ color: "#f5e642" }}>certified experts.</span>
          </h1>

          <p className="pr-fade" style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.8, animationDelay: "0.2s" }}>
            Work 1-on-1 with a certified nutritionist via{" "}
            <strong style={{ color: "rgba(255,255,255,0.9)" }}>video sessions</strong>,
            get a personalised plan, and chat access — all in one package.
          </p>

          <div className="pr-fade" style={{ display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap", animationDelay: "0.3s" }}>
            {[["500+", "Patients helped"], ["4.85★", "Avg. rating"], ["6", "Specialists"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 className="pr-fade" style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: "#1a3329", marginBottom: 8, letterSpacing: -0.5 }}>
            Choose your package
          </h2>
          <p className="pr-fade" style={{ fontSize: 14.5, color: "#5a7a6e", animationDelay: "0.1s" }}>
            Every package includes sessions + a personalised plan + chat access.
          </p>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 60, color: "#5a7a6e", fontSize: 15 }}>Loading packages...</div>}
        {error   && <div style={{ textAlign: "center", padding: 60, color: "#e53e3e", fontSize: 15 }}>{error}</div>}

        {!loading && !error && offers.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#5a7a6e", fontSize: 15 }}>No packages available yet.</div>
        )}

        {!loading && !error && offers.length > 0 && (
          <div className="pr-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(offers.length, 3)},1fr)`, gap: 24, alignItems: "start" }}>
            {offers.map((offer, i) => (
              <PlanCard key={offer.id} offer={offer} index={i} onSelect={handleSelect} />
            ))}
          </div>
        )}

        <div className="pr-fade" style={{ textAlign: "center", marginTop: 32, fontSize: 13, color: "#5a7a6e", animationDelay: "0.4s" }}>
          🔒 Secure payments · Cancel anytime · All specialists are certified
        </div>
      </div>

      <Footer />
    </div>
  );
}