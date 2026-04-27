import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { useAuth } from "../context/Authcontext";

const CATEGORY_ACCENT = {
  "Weight Loss":     "#2d7a4f",
  "Muscle Gain":     "#1a6fa0",
  "Diabetes":        "#c07a00",
  "Heart Health":    "#c0392b",
  "Gut Health":      "#2d7a4f",
  "Mental Wellness": "#7a3fa0",
  "Sports":          "#1a6fa0",
};

const CATEGORY_COVERS = {
  "Weight Loss":     "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
  "Muscle Gain":     "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "Diabetes":        "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80",
  "Heart Health":    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "Gut Health":      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
  "Mental Wellness": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
  "Sports":          "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
};

function mapPlan(p) {
  const category = p.goals?.[0] ?? "General";
  const accent    = CATEGORY_ACCENT[category] ?? "#2d7a4f";
  const coverImg  = p.images?.[0] ?? CATEGORY_COVERS[category] ?? CATEGORY_COVERS["Weight Loss"];
  return {
    id:               p.id,
    category,
    accent,
    coverImg,
    name:             p.title,
    price:            p.offer ? `$${Number(p.offer.price).toFixed(2)}` : "—",
    period:           "/mo",
    duration:         p.offer ? `${p.offer.durationDays} days` : "",
    desc:             p.offer?.description ?? "",
    popular:          p.offer?.includesSessions ?? false,
    specialist:       p.nutrition ? `${p.nutrition.firstName} ${p.nutrition.lastName}` : "Specialist",
    specialistTitle:  "Nutritionist",
    specialistAvatar: p.nutrition?.image ?? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80",
    features:         p.goals ?? [],
    content:          p.content,
  };
}

function SkeletonCard() {
  return (
    <div className="pl-card" style={{ minHeight: 420 }}>
      <div style={{ height: 175, background: "#e8e8e8" }} />
      <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="pl-skeleton" style={{ height: 14, width: "80%" }} />
        <div className="pl-skeleton" style={{ height: 14, width: "60%" }} />
        <div className="pl-skeleton" style={{ height: 44, borderRadius: 12 }} />
        {[1,2,3].map(i => (
          <div key={i} className="pl-skeleton" style={{ height: 12, width: `${70 - i*10}%` }} />
        ))}
        <div className="pl-skeleton" style={{ height: 46, borderRadius: 14, marginTop: "auto" }} />
      </div>
    </div>
  );
}

function PlanCard({ plan, index, onBuy, buying }) {
  return (
    <div
      className={`pl-card pl-fade ${plan.popular ? "popular" : ""}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div style={{ position: "relative", height: 175, overflow: "hidden", flexShrink: 0 }}>
        <img src={plan.coverImg} alt={plan.category} className="pl-cover-img" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.65) 100%)" }} />
        <div className="pl-shimmer" />

        {plan.popular && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "#2d7a4f", color: "#fff", fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: 999, letterSpacing: 0.4, textTransform: "uppercase" }}>
            ⭐ Popular
          </div>
        )}

        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)" }}>
            {plan.category}
          </span>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 3, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{plan.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#f5e642", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{plan.price}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{plan.period}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.75)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "3px 9px", border: "1px solid rgba(255,255,255,0.15)" }}>{plan.duration}</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, padding: "16px 18px 20px", background: "#fff" }}>
        <p style={{ fontSize: 13, color: "#5a7a6e", lineHeight: 1.65, margin: 0 }}>{plan.desc}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f7faf8", borderRadius: 12, padding: "10px 12px", border: `1px solid ${plan.accent}20` }}>
          <img src={plan.specialistAvatar} alt={plan.specialist} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${plan.accent}40` }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: plan.accent, letterSpacing: 0.4, textTransform: "uppercase" }}>Specialist</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a3329" }}>{plan.specialist}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {plan.features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
              <div style={{ width: 17, height: 17, borderRadius: "50%", background: `${plan.accent}15`, border: `1.5px solid ${plan.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={plan.accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span style={{ color: "#2a4a3e", lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "rgba(79,158,122,0.1)" }} />

        <button
          className="pl-buy-btn"
          onClick={() => onBuy(plan)}
          disabled={buying === plan.id}
          style={{
            background: plan.popular ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "transparent",
            color: plan.popular ? "#f5e642" : plan.accent,
            border: plan.popular ? "none" : `1.5px solid ${plan.accent}`,
            boxShadow: plan.popular ? "0 6px 18px rgba(26,51,41,0.22)" : "none",
          }}
        >
          {buying === plan.id
            ? <span className="pl-spinner" />
            : <>
                Buy Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </>
          }
        </button>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const navigate       = useNavigate();
  const { isLoggedIn } = useAuth();

  const [plans,          setPlans]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [buying,         setBuying]         = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch("/plans", { signal: controller.signal });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setPlans((data.plans ?? []).map(mapPlan));
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const categories = ["All", ...new Set(plans.map(p => p.category))];
  const filtered = activeCategory === "All" ? plans : plans.filter(p => p.category === activeCategory);

  const handleBuy = (plan) => {
    setBuying(plan.id);
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: "/payment", planId: plan.id } });
    } else {
      navigate("/payment", { state: { planId: plan.id } });
    }
    setTimeout(() => setBuying(null), 3000);
  };

  return (
    <div className="plans-page">

      <section className="plans-hero">
        <div className="plans-hero-dots" />
        <div className="plans-hero-inner">
          <div className="pl-fade plans-hero-badge">
            <span className="plans-hero-badge-dot" />
            {loading ? "Loading plans…" : `${plans.length} specialist-designed plans`}
          </div>

          <h1 className="pl-fade pl-hero-title" style={{ animationDelay: "0.1s" }}>
            Find the plan built<br />for <span style={{ color: "#f5e642" }}>your goals.</span>
          </h1>
          <p className="pl-fade plans-hero-sub" style={{ animationDelay: "0.2s" }}>
            Every plan is crafted by a certified specialist and personalised to your health profile.
          </p>

          <div className="pl-fade pl-stats" style={{ animationDelay: "0.3s" }}>
            {[[`${plans.length}+`, "Plans"], ["6", "Specialists"], ["98%", "Satisfaction"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="plans-container">

        {error && (
          <div className="plans-error">
            ⚠️ {error} —
            <button onClick={() => window.location.reload()} className="plans-error-retry">Retry</button>
          </div>
        )}

        {!loading && (
          <div className="pl-cats">
            {categories.map(cat => (
              <button
                key={cat}
                className="pl-cat-btn"
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "rgba(255,255,255,0.7)",
                  color: activeCategory === cat ? "#f5e642" : "#2d6b50",
                  border: `1.5px solid ${activeCategory === cat ? "transparent" : "rgba(79,158,122,0.25)"}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {!loading && (
          <div className="plans-count">
            {filtered.length} plan{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" ? ` for ${activeCategory}` : " available"}
          </div>
        )}

        <div className="pl-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} index={i} onBuy={handleBuy} buying={buying} />
              ))
          }
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div className="plans-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>No plans yet</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>Check back soon — new plans are on the way.</div>
          </div>
        )}

      </div>

    </div>
  );
}