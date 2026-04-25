import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Stars({ count }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="sp-star"
          style={{ opacity: count >= i ? 1 : 0.25, transition: "opacity 0.15s" }}>★</span>
      ))}
    </div>
  );
}

function DoctorModal({ sp, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", height: 200 }}>
          <img src={sp.resume?.images?.[0] || "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,rgba(26,51,41,0.75))" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#1a3329", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <img src={sp.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"} alt={sp.firstName} style={{ position: "absolute", bottom: -32, left: 24, width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }} />
        </div>

        <div style={{ padding: "44px 28px 32px", overflowY: "auto", maxHeight: "60vh" }}>

          {/* Name & Bio */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", marginBottom: 4 }}>{sp.firstName} {sp.lastName}</div>
            <div style={{ fontSize: 14, color: "#4f9e7a", fontWeight: 600, marginBottom: 12 }}>{sp.resume?.bio}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329" }}>{sp.resume?.ratingAverage || "—"}</span>
            </div>

            {/* Education & Workplace */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[{ label: "Education", val: sp.resume?.education, col: "1 / -1" }, { label: "Workplace", val: sp.resume?.workplace }].map(item => (
                <div key={item.label} style={{ background: "#f7faf8", borderRadius: 14, padding: "12px 14px", gridColumn: item.col || "auto" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#4f9e7a", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "#1a3329", fontWeight: 500, lineHeight: 1.5 }}>{item.val || "—"}</div>
                </div>
              ))}
            </div>

            {/* Experience */}
            {sp.resume?.experienceYears && (
              <div style={{ background: "#f0f9f4", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🏅</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a3329" }}>{sp.resume.experienceYears} years of experience</span>
              </div>
            )}

            {/* Specializations */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {(sp.resume?.specializations || []).map(s => <span key={s} className="sp-tag">{s}</span>)}
            </div>

            {/* Certifications */}
            {(sp.resume?.certifications || []).length > 0 && (
              <div style={{ background: "#fafdf9", borderRadius: 14, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#4f9e7a", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Certifications</div>
                {sp.resume.certifications.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#1a3329", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#4f9e7a" }}>✓</span> {c}
                  </div>
                ))}
              </div>
            )}

            {/* Offer Types */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(sp.resume?.offersTypes || []).map(t => (
                <span key={t} style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", borderRadius: 999, padding: "4px 14px", fontSize: 11.5, fontWeight: 700 }}>
                  {t === "CONSULTATION" ? "🎥 Consultation" : "📋 Plans"}
                </span>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(79,158,122,0.12)", marginBottom: 24 }} />

          {/* Reviews */}
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 16 }}>
              Patient Reviews
            </div>
            {(!sp.reviews || sp.reviews.length === 0) ? (
              <div style={{ fontSize: 13, color: "#5a7a6e", textAlign: "center", padding: "20px 0" }}>No reviews yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sp.reviews.map(c => (
                  <div key={c.id} className="sp-comment-card">
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329" }}>{c.client?.firstName} {c.client?.lastName}</span>
                          <span style={{ fontSize: 11.5, color: "#5a7a6e" }}>{new Date(c.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                        </div>
                        <Stars count={c.rating} />
                        <p style={{ fontSize: 13.5, color: "#2a4a3e", lineHeight: 1.7, marginTop: 6, fontStyle: "italic" }}>"{c.comment}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OurTeam() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

 useEffect(() => {
  Promise.all([
    fetch("http://localhost:5000/nutritionists/public?type=CONSULTATION").then(r => r.json()),
    fetch("http://localhost:5000/nutritionists/public?type=PLAN").then(r => r.json()),
  ])
    .then(([consultation, plan]) => {
      const c = Array.isArray(consultation) ? consultation : [];
      const p = Array.isArray(plan) ? plan : [];
      const all = [...c, ...p];
      const unique = all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
      setDoctors(unique);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, []);
  const filtered = filter === "all" ? doctors : doctors.filter(d =>
    filter === "consultation"
      ? d.resume?.offersTypes?.includes("CONSULTATION")
      : d.resume?.offersTypes?.includes("PLAN")
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'DM Sans',sans-serif" }}>

      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)", padding: "64px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12.5, fontWeight: 700, color: "#f5e642", marginBottom: 22 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Our Medical Team
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(36px,6vw,60px)", fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1.04, marginBottom: 16 }}>
            Meet our <span style={{ color: "#f5e642" }}>team.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.68)", lineHeight: 1.8 }}>
            Certified nutrition specialists dedicated to transforming your health journey.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 36 }}>
            {[[doctors.length || "—", "Specialists"], ["500+", "Patients helped"], ["4.85", "Avg. rating"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 0" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["all", "All"], ["consultation", "Consultation"], ["plan", "Plans"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ background: filter === val ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "#fff", color: filter === val ? "#f5e642" : "#2d6b50", border: `1.5px solid ${filter === val ? "transparent" : "rgba(79,158,122,0.25)"}`, borderRadius: 999, padding: "8px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.22s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#5a7a6e", fontSize: 16, padding: "60px 0" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#5a7a6e", fontSize: 16, padding: "60px 0" }}>No specialists found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
            {filtered.map((sp, i) => (
              <div key={sp.id} className="sp-card sp-fade-up" style={{ animationDelay: `${i * 0.1}s`, cursor: "pointer" }} onClick={() => setSelected(sp)}>
                <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                  <img src={sp.resume?.images?.[0] || "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,rgba(26,51,41,0.65))" }} />
                  <img src={sp.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"} alt={sp.firstName} style={{ position: "absolute", bottom: -28, left: 20, width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }} />
                  {/* Offer type badges */}
                  <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4 }}>
                    {(sp.resume?.offersTypes || []).map(t => (
                      <span key={t} style={{ background: t === "CONSULTATION" ? "#2d7a4f" : "#1a6fa0", color: "#fff", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>
                        {t === "CONSULTATION" ? "🎥 Consult" : "📋 Plans"}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "36px 20px 14px" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#1a3329", marginBottom: 3 }}>{sp.firstName} {sp.lastName}</div>
                  <div style={{ fontSize: 13, color: "#4f9e7a", fontWeight: 600, marginBottom: 10 }}>{sp.resume?.bio?.slice(0, 60)}...</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>{sp.resume?.ratingAverage || "—"}</span>
                  </div>
                  {sp.resume?.experienceYears && (
                    <div style={{ fontSize: 12.5, color: "#5a7a6e", marginBottom: 10 }}>🏅 {sp.resume.experienceYears} years experience</div>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(sp.resume?.specializations || []).slice(0, 3).map(s => <span key={s} className="sp-tag">{s}</span>)}
                  </div>
                </div>

                <div style={{ padding: "12px 20px 18px", borderTop: "1px solid rgba(79,158,122,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, color: "#5a7a6e" }}>{sp.resume?.workplace?.slice(0, 30) || "—"}</div>
                  <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 700 }}>View Profile →</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <DoctorModal sp={selected} onClose={() => setSelected(null)} />}

    </div>
  );
}