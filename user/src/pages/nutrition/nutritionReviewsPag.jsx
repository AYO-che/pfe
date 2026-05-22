import { useEffect, useState } from "react";

const API_URL = "https://chrysalise-server.onrender.com";

const GlassCard = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    borderTop:    "1.5px solid rgba(168,224,44,0.85)",
    borderLeft:   "1.5px solid rgba(168,224,44,0.85)",
    borderBottom: "1.5px solid rgba(0,168,84,0.75)",
    borderRight:  "1.5px solid rgba(0,168,84,0.75)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(15,89,47,0.10), inset 0 0 12px rgba(255,255,255,0.5)",
    overflow: "hidden",
    transition: "all 0.3s ease",
    ...style,
  }}>
    {children}
  </div>
);

function Avatar({ user, size = 44, radius = 12 }) {
  const [err, setErr] = useState(false);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  if (!user?.image || err) return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0,
      background: "linear-gradient(135deg,#0b6630,#2d6b50)",
      border: "1.5px solid rgba(168,224,44,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter',sans-serif", fontSize: size * 0.32,
      fontWeight: 800, color: "#a8e02c",
    }}>{initials}</div>
  );
  return (
    <img src={user.image} alt={initials} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0, border: "1.5px solid rgba(168,224,44,0.4)" }} />
  );
}

function StarDisplay({ rating, size = 16 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? "#f5a623" : "none"}
          stroke={i <= rating ? "#f5a623" : "rgba(0,168,84,0.25)"}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

const RATING_META = {
  1: { label: "Poor",      color: "#c0392b", bg: "rgba(192,57,43,0.1)"  },
  2: { label: "Fair",      color: "#b8a200", bg: "rgba(184,162,0,0.1)"  },
  3: { label: "Good",      color: "#1a6fa0", bg: "rgba(26,111,160,0.1)" },
  4: { label: "Very Good", color: "#0b6630", bg: "rgba(11,102,48,0.1)"  },
  5: { label: "Excellent", color: "#0b6630", bg: "rgba(11,102,48,0.1)"  },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NutritionReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState(0); // 0 = all

  useEffect(() => {
    fetch(`${API_URL}/reviews`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setReviews(data.reviews ?? []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 0
    ? reviews
    : reviews.filter(r => r.rating === filter);

  const avg = reviews.length
    ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
    : null;

  const dist = [5,4,3,2,1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100)
      : 0,
  }));

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .rv-card { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .rv-skeleton {
          border-radius: 16px; height: 100px;
          background: linear-gradient(90deg,rgba(240,247,243,0.8) 25%,rgba(224,237,232,0.8) 50%,rgba(240,247,243,0.8) 75%);
          background-size: 200% 100%; animation: shimmer 1.4s infinite;
          margin-bottom: 12px;
        }
        .rv-filter-btn { transition: all 0.18s ease; }
        .rv-filter-btn:hover { transform: translateY(-1px); }
        .rv-review-card:hover {
          background: rgba(255,255,255,0.32) !important;
          box-shadow: 0 10px 36px rgba(15,89,47,0.16) !important;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="rv-card" style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>Feedback</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", letterSpacing: -0.5 }}>Patient Reviews</div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4 }}>What your patients say about you</div>
      </div>

      {/* ── Stats Hero ── */}
      {!loading && reviews.length > 0 && (
        <GlassCard className="rv-card" style={{ marginBottom: 20, padding: "0" }}>
          {/* Green strip */}
          <div style={{
            background: "linear-gradient(135deg,#0b6630 0%,#2d6b50 55%,#1a5e3a 100%)",
            padding: "24px 28px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(168,224,44,0.08) 1.5px,transparent 1.5px)", backgroundSize: "22px 22px" }} />
            <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(168,224,44,0.08)" }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              {/* Big average */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 56, fontWeight: 800, color: "#a8e02c", lineHeight: 1 }}>{avg}</div>
                <div style={{ marginTop: 6 }}><StarDisplay rating={Math.round(parseFloat(avg))} size={18} /></div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
              </div>

              {/* Divider */}
              <div style={{ width: 1, height: 80, background: "rgba(168,224,44,0.2)", flexShrink: 0 }} />

              {/* Distribution bars */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, minWidth: 200 }}>
                {dist.map(d => (
                  <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(255,255,255,0.7)", width: 14, textAlign: "right" }}>{d.star}</div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#f5a623" style={{ flexShrink: 0 }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${d.pct}%`, background: "linear-gradient(90deg,#a8e02c,#f5e642)", borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", width: 24, textAlign: "right" }}>{d.count}</div>
                  </div>
                ))}
              </div>

              {/* Quick stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "5★ Reviews", val: dist[0].count, color: "#a8e02c" },
                  { label: "Avg Rating", val: avg,           color: "#f5e642" },
                  { label: "Total",      val: reviews.length, color: "#fff"   },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── Filter tabs ── */}
      {!loading && reviews.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { val: 0, label: "All" },
            { val: 5, label: "★★★★★" },
            { val: 4, label: "★★★★" },
            { val: 3, label: "★★★" },
            { val: 2, label: "★★" },
            { val: 1, label: "★" },
          ].map(tab => (
            <button key={tab.val} className="rv-filter-btn" onClick={() => setFilter(tab.val)} style={{
              padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer",
              fontFamily: "'Inter',sans-serif", fontSize: 12.5, fontWeight: 700,
              background: filter === tab.val
                ? "#0b6630"
                : "rgba(255,255,255,0.3)",
              backdropFilter: "blur(8px)",
              color: filter === tab.val ? "#a8e02c" : "#5a7a6e",
              boxShadow: filter === tab.val ? "0 4px 14px rgba(11,102,48,0.3)" : "none",
              border: filter === tab.val ? "none" : "1px solid rgba(168,224,44,0.25)",
            }}>
              {tab.label}
              <span style={{
                marginLeft: 6, fontSize: 11,
                background: filter === tab.val ? "rgba(168,224,44,0.2)" : "rgba(0,168,84,0.1)",
                color: filter === tab.val ? "#a8e02c" : "#5a7a6e",
                borderRadius: 999, padding: "1px 7px",
              }}>
                {tab.val === 0 ? reviews.length : reviews.filter(r => r.rating === tab.val).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && [1,2,3].map(i => (
        <div key={i} className="rv-skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}

      {/* ── Empty ── */}
      {!loading && reviews.length === 0 && (
        <GlassCard style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329", marginBottom: 8 }}>No reviews yet</div>
          <div style={{ fontSize: 13.5, color: "#5a7a6e", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
            Once patients complete sessions and leave reviews, they'll appear here.
          </div>
        </GlassCard>
      )}

      {/* ── No results for filter ── */}
      {!loading && reviews.length > 0 && filtered.length === 0 && (
        <GlassCard style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, color: "#1a3329", marginBottom: 6 }}>No {filter}★ reviews</div>
          <div style={{ fontSize: 13, color: "#5a7a6e" }}>Try selecting a different filter.</div>
        </GlassCard>
      )}

      {/* ── Reviews list ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((review, i) => {
          const reviewer = review.patient ?? review.client;
          const meta     = RATING_META[review.rating] ?? RATING_META[3];

          return (
            <div key={review.id} className="rv-card rv-review-card" style={{
              animationDelay: `${i * 0.06}s`,
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              borderTop:    "1.5px solid rgba(168,224,44,0.85)",
              borderLeft:   "1.5px solid rgba(168,224,44,0.85)",
              borderBottom: "1.5px solid rgba(0,168,84,0.75)",
              borderRight:  "1.5px solid rgba(0,168,84,0.75)",
              borderRadius: 18,
              padding: "18px 20px",
              boxShadow: "0 6px 24px rgba(15,89,47,0.08), inset 0 0 10px rgba(255,255,255,0.45)",
              transition: "all 0.25s ease",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <Avatar user={reviewer} size={46} radius={12} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>
                        {reviewer?.firstName} {reviewer?.lastName}
                      </div>
                      <div style={{ fontSize: 11.5, color: "#8a9a8e", marginTop: 2 }}>{fmtDate(review.createdAt)}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <StarDisplay rating={review.rating} size={15} />
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px",
                        borderRadius: 999, background: meta.bg, color: meta.color,
                        border: `1px solid ${meta.color}22`,
                        fontFamily: "'Inter',sans-serif",
                      }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {/* Rating number pill */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(6px)", borderRadius: 10, padding: "5px 12px", border: "1px solid rgba(168,224,44,0.2)", marginBottom: review.comment ? 12 : 0 }}>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: meta.color }}>{review.rating}</span>
                    <span style={{ fontSize: 11, color: "#8a9a8e" }}>/ 5</span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div style={{
                      background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)",
                      borderRadius: 12, padding: "12px 14px",
                      border: "1px solid rgba(168,224,44,0.2)",
                      fontSize: 13.5, color: "#2a4a3e", lineHeight: 1.65,
                      fontFamily: "'Inter',sans-serif",
                    }}>
                      "{review.comment}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
