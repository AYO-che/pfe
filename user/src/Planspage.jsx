import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "./AuthContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes shimmer { 0%{left:-100%} 100%{left:150%} }

.pl-fade { animation: fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both }

.pl-card {
  border-radius: 22px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.32s cubic-bezier(0.22,1,0.36,1);
  background: #fff;
  box-shadow: 0 4px 20px rgba(26,51,41,0.1);
  border: 1.5px solid rgba(79,158,122,0.12);
}
.pl-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 56px rgba(26,51,41,0.18) !important;
}
.pl-card.popular {
  border: 2px solid #2d7a4f;
  box-shadow: 0 8px 32px rgba(45,122,79,0.18);
}
.pl-card:hover .pl-cover-img { transform: scale(1.06); }
.pl-card:hover .pl-shimmer { animation: shimmer 0.8s ease forwards; }

.pl-cover-img {
  width: 100%; height: 100%; object-fit: cover;
  display: block; transition: transform 0.5s ease;
}
.pl-shimmer {
  position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
  pointer-events: none; z-index: 10;
}

.pl-cat-btn {
  padding: 8px 20px; border-radius: 999px; font-size: 13.5px;
  font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif;
  transition: all 0.22s ease; white-space: nowrap;
}

.pl-buy-btn {
  width: 100%; padding: 13px 0; border-radius: 14px; font-size: 14.5px;
  font-weight: 700; cursor: pointer; font-family: 'DM Sans',sans-serif;
  border: none; transition: all 0.25s ease; margin-top: auto;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.pl-buy-btn:hover { transform: translateY(-2px); filter: brightness(1.06); }

/* Responsive */
@media (max-width: 640px) {
  .pl-grid { grid-template-columns: 1fr !important; }
  .pl-cats { flex-wrap: wrap !important; }
  .pl-hero-title { font-size: 32px !important; }
  .pl-stats { gap: 20px !important; }
  .pl-guarantee { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
}
@media (max-width: 900px) {
  .pl-grid { grid-template-columns: repeat(2,1fr) !important; }
}
`;

const CATEGORIES = ["All", "Weight Loss", "Muscle Gain", "Diabetes", "Heart Health", "Gut Health", "Mental Wellness", "Sports"];

const COVERS = {
  "Weight Loss": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
  "Muscle Gain": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "Diabetes": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80",
  "Heart Health": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "Gut Health": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
  "Mental Wellness": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
  "Sports": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
};

const PLANS = [
  // Weight Loss
  { id: 1, category: "Weight Loss", popular: false, name: "Slim Start", price: "$6.99", period: "/mo", duration: "1 month", desc: "The perfect starting point for your weight loss journey with essential tracking tools.", accent: "#2d7a4f", specialist: "Dr. Sarah Mitchell", specialistTitle: "Clinical Nutritionist", specialistAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80", features: ["Calorie tracker", "Hydration log", "Weekly meal tips", "Progress photos"] },
  { id: 2, category: "Weight Loss", popular: true, name: "Fat Burn Pro", price: "$9.99", period: "/mo", duration: "3 months", desc: "AI-powered nutrition tracking combined with personalised meal plans to accelerate fat loss.", accent: "#2d7a4f", specialist: "Dr. Sarah Mitchell", specialistTitle: "Clinical Nutritionist", specialistAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80", features: ["AI meal planner", "Barcode scanner", "Macro tracking", "Weekly check-in", "Custom recipes"] },
  { id: 3, category: "Weight Loss", popular: false, name: "Transform Elite", price: "$19.99", period: "/mo", duration: "6 months", desc: "Full specialist-led transformation program with 1-on-1 sessions and body analysis.", accent: "#2d7a4f", specialist: "Dr. Sarah Mitchell", specialistTitle: "Clinical Nutritionist", specialistAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80", features: ["Everything in Fat Burn Pro", "Weekly 1-on-1 sessions", "Body analysis", "24/7 support"] },
  { id: 4, category: "Weight Loss", popular: false, name: "Hormone Balance", price: "$13.99", period: "/mo", duration: "3 months", desc: "Designed for women dealing with PCOS or thyroid issues affecting weight management.", accent: "#a0397a", specialist: "Dr. Yasmine Larabi", specialistTitle: "Hormonal Health Expert", specialistAvatar: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&q=80", features: ["PCOS-friendly meals", "Thyroid support", "Cycle-based nutrition", "Hormonal tracking"] },
  // Muscle Gain
  { id: 5, category: "Muscle Gain", popular: false, name: "Muscle Starter", price: "$7.99", period: "/mo", duration: "2 months", desc: "Build lean muscle with proper nutrition timing and protein-focused meal planning.", accent: "#1a6fa0", specialist: "Dr. James Carter", specialistTitle: "Sports & Performance Dietitian", specialistAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&q=80", features: ["Protein & macro tracker", "Pre/post workout meals", "Supplement guide", "Recovery tips"] },
  { id: 6, category: "Muscle Gain", popular: true, name: "Athlete Pro", price: "$12.99", period: "/mo", duration: "4 months", desc: "Performance nutrition for serious athletes looking to gain strength and improve recovery.", accent: "#1a6fa0", specialist: "Dr. James Carter", specialistTitle: "Sports & Performance Dietitian", specialistAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&q=80", features: ["Advanced macro plan", "Sport-specific meals", "Performance analytics", "Bi-weekly sessions"] },
  // Diabetes
  { id: 7, category: "Diabetes", popular: true, name: "Glucose Control", price: "$14.99", period: "/mo", duration: "3 months", desc: "Manage blood sugar naturally with low-GI meal plans and weekly specialist check-ins.", accent: "#c07a00", specialist: "Dr. Omar Khalil", specialistTitle: "Chronic Disease Specialist", specialistAvatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&q=80", features: ["Low-GI meals", "Blood sugar log", "Carb management", "Weekly Dr. check-in", "Emergency guide"] },
  { id: 8, category: "Diabetes", popular: false, name: "Diabetes Care+", price: "$22.99", period: "/mo", duration: "6 months", desc: "Comprehensive diabetic care with lab analysis, medication timing and family planning.", accent: "#c07a00", specialist: "Dr. Omar Khalil", specialistTitle: "Chronic Disease Specialist", specialistAvatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&q=80", features: ["Everything in Glucose Control", "Bi-weekly sessions", "Lab result analysis", "Family meals"] },
  // Heart Health
  { id: 9, category: "Heart Health", popular: true, name: "Heart Shield", price: "$11.99", period: "/mo", duration: "3 months", desc: "Reduce cardiovascular risk with the Mediterranean diet and cholesterol management tools.", accent: "#c0392b", specialist: "Dr. Rafael Moreno", specialistTitle: "Cardiovascular Nutritionist", specialistAvatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&q=80", features: ["Mediterranean diet", "Cholesterol tracker", "Sodium management", "Heart recipes", "Monthly review"] },
  // Gut Health
  { id: 10, category: "Gut Health", popular: false, name: "Gut Reset", price: "$9.99", period: "/mo", duration: "2 months", desc: "Heal your gut and reduce IBS symptoms with a targeted anti-inflammatory protocol.", accent: "#2d7a4f", specialist: "Dr. Omar Khalil", specialistTitle: "Chronic Disease Specialist", specialistAvatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=80&q=80", features: ["Anti-inflammatory meals", "Probiotic guide", "IBS protocol", "Food sensitivity tracker"] },
  // Mental Wellness
  { id: 11, category: "Mental Wellness", popular: false, name: "Mind & Body", price: "$8.99", period: "/mo", duration: "2 months", desc: "Nourish your mind through food — reduce anxiety, improve sleep and boost daily energy.", accent: "#7a3fa0", specialist: "Dr. Nadia Benali", specialistTitle: "Family Nutritionist", specialistAvatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=80&q=80", features: ["Mood-boosting meals", "Stress-reducing diet", "Sleep nutrition", "Anti-anxiety foods"] },
  // Sports
  { id: 12, category: "Sports", popular: true, name: "Peak Performance", price: "$16.99", period: "/mo", duration: "4 months", desc: "Elite nutrition strategy for competitive athletes from race prep to off-season recovery.", accent: "#1a6fa0", specialist: "Dr. James Carter", specialistTitle: "Sports & Performance Dietitian", specialistAvatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&q=80", features: ["Competition prep", "Hydration strategy", "Periodised plan", "Recovery optimisation", "1-on-1 sessions"] },
];

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, index, onBuy }) {
  const coverImg = COVERS[plan.category];

  return (
    <div className={`pl-card pl-fade ${plan.popular ? "popular" : ""}`}
      style={{ animationDelay: `${index * 0.07}s` }}>

      {/* Cover Image */}
      <div style={{ position: "relative", height: 175, overflow: "hidden", flexShrink: 0 }}>
        <img src={coverImg} alt={plan.category} className="pl-cover-img" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.65) 100%)" }} />
        <div className="pl-shimmer" />

        {/* Popular badge */}
        {plan.popular && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "#2d7a4f", color: "#fff", fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: 999, letterSpacing: 0.4, textTransform: "uppercase" }}>
            ⭐ Popular
          </div>
        )}

        {/* Category badge */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)" }}>
            {plan.category}
          </span>
        </div>

        {/* Name + Price on image */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 3, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{plan.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#f5e642", textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{plan.price}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{plan.period}</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.75)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "3px 9px", border: "1px solid rgba(255,255,255,0.15)" }}>{plan.duration}</span>
          </div>
        </div>
      </div>

      {/* Card Body — white background */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13, padding: "16px 18px 20px", background: "#fff" }}>

        {/* Description */}
        <p style={{ fontSize: 13, color: "#5a7a6e", lineHeight: 1.65, margin: 0 }}>{plan.desc}</p>

        {/* Specialist */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f7faf8", borderRadius: 12, padding: "10px 12px", border: `1px solid ${plan.accent}20` }}>
          <img src={plan.specialistAvatar} alt={plan.specialist} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${plan.accent}40` }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: plan.accent, letterSpacing: 0.4, textTransform: "uppercase" }}>Specialist</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1a3329" }}>{plan.specialist}</div>
          </div>
        </div>

        {/* Features */}
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

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(79,158,122,0.1)" }} />

        {/* Button */}
        <button className="pl-buy-btn" onClick={() => onBuy(plan)}
          style={{
            background: plan.popular
              ? `linear-gradient(135deg,#1a3329,#2d6b50)`
              : `transparent`,
            color: plan.popular ? "#f5e642" : plan.accent,
            border: plan.popular ? "none" : `1.5px solid ${plan.accent}`,
            boxShadow: plan.popular ? "0 6px 18px rgba(26,51,41,0.22)" : "none",
          }}>
          Buy Now
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </button>

      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PlansPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");

  const handleBuy = (plan) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: "/payment", planId: plan.id } });
    } else {
      navigate("/payment", { state: { planId: plan.id } });
    }
  };

  const filtered = activeCategory === "All"
    ? PLANS
    : PLANS.filter(p => p.category === activeCategory);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #d7ecfa 0%, #d7f8da 100%)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <Header />

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)", padding: "68px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -120, right: -120, width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,230,66,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="pl-fade" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12.5, fontWeight: 700, color: "#f5e642", marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642", animation: "pulse 2s ease infinite", display: "inline-block" }} />
            12 specialist-designed plans
          </div>
          <h1 className="pl-fade pl-hero-title" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(32px,6vw,60px)", fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1.04, marginBottom: 16, animationDelay: "0.1s" }}>
            Find the plan built<br />for <span style={{ color: "#f5e642" }}>your goals.</span>
          </h1>
          <p className="pl-fade" style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", maxWidth: 440, margin: "0 auto", lineHeight: 1.8, animationDelay: "0.2s" }}>
            Every plan is crafted by a certified specialist and personalised to your health profile.
          </p>

          {/* Stats */}
          <div className="pl-fade pl-stats" style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 36, animationDelay: "0.3s", flexWrap: "wrap" }}>
            {[["12+", "Plans"], ["6", "Specialists"], ["98%", "Satisfaction"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* ── Category Filter ── */}
        <div className="pl-cats" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 28, scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} className="pl-cat-btn" onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "rgba(255,255,255,0.7)",
                color: activeCategory === cat ? "#f5e642" : "#2d6b50",
                border: `1.5px solid ${activeCategory === cat ? "transparent" : "rgba(79,158,122,0.25)"}`,
                backdropFilter: "blur(8px)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize: 13.5, color: "#2d6b50", fontWeight: 600, marginBottom: 20 }}>
          {filtered.length} plan{filtered.length !== 1 ? "s" : ""}{activeCategory !== "All" ? ` for ${activeCategory}` : " available"}
        </div>

        {/* ── Grid ── */}
        <div className="pl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
          {filtered.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} onBuy={handleBuy} />
          ))}
        </div>

        
      </div>

      <Footer />
    </div>
  );
}