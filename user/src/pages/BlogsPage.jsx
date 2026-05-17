import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer   { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
@keyframes expandIn  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }

.blog-glass-card {
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
}
.blog-glass-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 12px 40px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
  transform: translateY(-2px);
}
.blog-glass-card.is-open {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 12px 40px rgba(15,89,47,0.2), inset 0 0 16px rgba(255,255,255,0.75);
}

.blog-img-wrap {
  position: relative; height: 210px; overflow: hidden; flex-shrink: 0;
}
.blog-img-wrap img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.22,1,0.36,1); display: block;
}
.blog-glass-card:hover .blog-img-wrap img,
.blog-glass-card.is-open .blog-img-wrap img { transform: scale(1.04); }
.blog-img-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(15,40,28,0.55) 100%);
}
.blog-tag {
  position: absolute; top: 14px; left: 14px;
  background: rgba(11,102,48,0.85);
  backdrop-filter: blur(8px);
  color: #a8e02c;
  border: 1px solid rgba(168,224,44,0.35);
  border-radius: 999px;
  padding: 3px 11px;
  font-family: 'Inter', sans-serif;
  font-size: 10.5px; font-weight: 700; letter-spacing: 0.4px;
}
.blog-tag.community {
  background: rgba(11,102,48,0.85);
  color: #c7d2fe;
  border-color: rgba(165,180,252,0.35);
}

.blog-body { padding: 20px 22px 22px; }

.blog-cta {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px; font-weight: 700;
  cursor: pointer; transition: gap 0.2s ease;
  border: none; background: transparent; padding: 0;
}
.blog-glass-card:hover .blog-cta,
.blog-glass-card.is-open .blog-cta { gap: 9px; }

.blog-expanded {
  padding: 0 22px 22px;
  border-top: 1px solid rgba(0,168,84,0.1);
  animation: expandIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
}

.blog-skeleton {
  border-radius: 22px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.blogs-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(79,158,122,0.25);
  border-radius: 999px;
  padding: 5px 16px 5px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px; font-weight: 600; color: #2d6b50;
  box-shadow: 0 2px 10px rgba(45,107,80,0.08);
}
.blogs-badge-icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(135deg,#4f9e7a,#2a6b4f);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px;
}

/* ── Tab switcher ── */
.blogs-tabs {
  display: flex; gap: 8px; justify-content: center;
  margin-bottom: 36px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1.5px solid rgba(168,224,44,0.6);
  border-left: 1.5px solid rgba(168,224,44,0.6);
  border-bottom: 1.5px solid rgba(0,168,84,0.5);
  border-right: 1.5px solid rgba(0,168,84,0.5);
  border-radius: 18px;
  padding: 6px;
  width: fit-content;
  margin-left: auto; margin-right: auto;
  box-shadow: 0 4px 20px rgba(15,89,47,0.08), inset 0 0 8px rgba(255,255,255,0.4);
}
.blogs-tab-btn {
  padding: 10px 24px; border-radius: 14px; border: none;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; background: transparent; color: #1a3329;
}
.blogs-tab-btn.active {
  background: linear-gradient(135deg,#0b6630,#2d6b50);
  color: #f5e642;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.blogs-tab-btn:not(.active):hover { background: rgba(11,102,48,0.85); }

/* ── Type filter pills (community) ── */
.type-filters {
  display: flex; gap: 8px; flex-wrap: wrap;
  justify-content: center; margin-bottom: 28px;
}
.type-filter-btn {
  padding: 7px 16px; border-radius: 999px; border: none;
  font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  background: rgba(255,255,255,0.4);
  border: 1.5px solid rgba(168,224,44,0.3);
  color: #1a3329;
}
.type-filter-btn.active {
  background: rgba(11,102,48,0.85);
  color: #fff; border-color: transparent;
  box-shadow: 0 4px 14px rgba(11,102,48,0.85);
}
.type-filter-btn:not(.active):hover { background: rgba(255,255,255,0.6); }

/* ── Author row ── */
.blog-author {
  display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
}
.blog-author img {
  width: 28px; height: 28px; border-radius: 50%; object-fit: cover;
  border: 1.5px solid rgba(0,168,84,0.2);
}
.blog-author-fallback {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg,#1a3329,#2d6b50);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 800; color: rgba(245,230,66,0.8);
  flex-shrink: 0;
}

/* ── Empty state ── */
.blogs-empty {
  text-align: center; padding: 64px 24px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  border: 1.5px solid rgba(168,224,44,0.5);
  border-radius: 22px;
}
`;

const TYPE_OPTIONS = [
  { value: "ALL",          icon: "🌿", label: "All"           },
  { value: "EXPERIENCE",   icon: "✨", label: "Experiences"   },
  { value: "RECIPE",       icon: "🥗", label: "Recipes"       },
  { value: "BEFORE_AFTER", icon: "📸", label: "Before & After"},
];

const TYPE_LABELS = {
  EXPERIENCE:   "✨ Experience",
  RECIPE:       "🥗 Recipe",
  BEFORE_AFTER: "📸 Before & After",
};

const COVER_FALLBACK = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80";
const COMMUNITY_FALLBACK = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80";

function AuthorRow({ author, isNutritionist }) {
  const [imgError, setImgError] = useState(false);
  const initials = `${author?.firstName?.[0] ?? ""}${author?.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="blog-author">
      {author?.image && !imgError ? (
        <img src={author.image} alt={author.firstName} onError={() => setImgError(true)} />
      ) : (
        <div className="blog-author-fallback">{initials}</div>
      )}
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "#4a6a5e", fontFamily: "'Inter',sans-serif" }}>
        {author?.firstName} {author?.lastName}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
        background: isNutritionist ? "rgba(11,102,48,0.08)" : "rgba(79,70,229,0.08)",
        color: isNutritionist ? "#0b6630" : "#4f46e5",
        border: `1px solid ${isNutritionist ? "rgba(11,102,48,0.12)" : "rgba(79,70,229,0.12)"}`,
      }}>
        {isNutritionist ? "Nutritionist" : "Member"}
      </span>
    </div>
  );
}

function BlogCard({ item, open, onToggle, delay, isNutritionist }) {
  const coverImg = isNutritionist
    ? (item.images?.[0] || COVER_FALLBACK)
    : (item.images?.[0] || COMMUNITY_FALLBACK);

  const tagLabel = isNutritionist ? "Health" : (TYPE_LABELS[item.type] ?? item.type);
  const tagClass = isNutritionist ? "" : "community";
  const author   = isNutritionist ? item.author : item.author;

  return (
    <div
      className={`blog-glass-card anim-up ${open ? "is-open" : ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="blog-img-wrap">
        <img src={coverImg} alt={item.title} />
        <div className="blog-img-gradient" />
        <span className={`blog-tag ${tagClass}`}>{tagLabel}</span>
      </div>

      <div className="blog-body">
        <AuthorRow author={author} isNutritionist={isNutritionist} />

        <div style={{ fontSize: 10, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>
          {isNutritionist ? "Article" : "Community Post"}
        </div>

        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329", lineHeight: 1.3, marginBottom: 10 }}>
          {item.title}
        </h2>

        <p style={{ fontSize: 13.5, color: "#5a7a6e", lineHeight: 1.7, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>
          {item.content?.slice(0, 130)}…
        </p>

        <div style={{ height: 1, background: "rgba(0,168,84,0.1)", marginBottom: 16 }} />

        <button
          className="blog-cta"
          onClick={onToggle}
          style={{ color: open ? "#b8a200" : "#0b6630" }}
        >
          {open ? "Close" : "Read more"}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform 0.22s ease", transform: open ? "rotate(90deg)" : "none" }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="blog-expanded">
          <div style={{ paddingTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            {item.content?.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontSize: 14, color: "#4a6a5e", lineHeight: 1.9, fontFamily: "'Inter',sans-serif", paddingLeft: 14, borderLeft: "2px solid rgba(79,158,122,0.2)" }}>
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BlogsPage() {
  const [blogs,       setBlogs]       = useState([]);
  const [community,   setCommunity]   = useState([]);
  const [open,        setOpen]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [tab,         setTab]         = useState("blogs");
  const [typeFilter,  setTypeFilter]  = useState("ALL");

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/blog").then(r => r.json()),
      fetch("http://localhost:5000/community").then(r => r.json()),
    ])
      .then(([blogData, communityData]) => {
        setBlogs(blogData.posts ?? []);
        setCommunity(communityData.posts ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setOpen(prev => prev === id ? null : id);

  const filteredCommunity = typeFilter === "ALL"
    ? community
    : community.filter(p => p.type === typeFilter);

  const activeList        = tab === "blogs" ? blogs : filteredCommunity;
  const isNutritionist    = tab === "blogs";

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>
      <style>{CSS}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 96px" }}>

        {/* Header */}
        <div className="anim-up" style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <span className="blogs-badge">
              <span className="blogs-badge-icon">✦</span>
              {tab === "blogs" ? "Our Blog" : "Community"}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 14 }}>
            {tab === "blogs" ? (
              <>Health tips &{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a6fa0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>expert insights</span>
                  <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 3, borderRadius: 999, background: "linear-gradient(90deg,#f5e642,rgba(245,230,66,0.2))" }} />
                </span>
              </>
            ) : (
              <>Real stories from{" "}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a6fa0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>our members</span>
                  <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 3, borderRadius: 999, background: "linear-gradient(90deg,#c7d2fe,rgb(245, 230, 66), )" }} />
                </span>
              </>
            )}
          </h1>
          <p style={{ fontSize: 14, color: "#5a7a6e", lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
            {tab === "blogs"
              ? "Evidence-based articles from our nutritionists — written to help you transform."
              : "Recipes, experiences, and transformations shared by our community members."}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="blogs-tabs anim-up" style={{ animationDelay: "0.08s" }}>
          <button className={`blogs-tab-btn ${tab === "blogs" ? "active" : ""}`} onClick={() => { setTab("blogs"); setOpen(null); }}>
            📰 Expert Blog {blogs.length > 0 && `(${blogs.length})`}
          </button>
          <button className={`blogs-tab-btn ${tab === "community" ? "active" : ""}`} onClick={() => { setTab("community"); setOpen(null); }}>
            🌿 Community {community.length > 0 && `(${community.length})`}
          </button>
        </div>

        {/* Type filters — community only */}
        {tab === "community" && !loading && (
          <div className="type-filters anim-up" style={{ animationDelay: "0.12s" }}>
            {TYPE_OPTIONS.map(t => (
              <button
                key={t.value}
                className={`type-filter-btn ${typeFilter === t.value ? "active" : ""}`}
                onClick={() => { setTypeFilter(t.value); setOpen(null); }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} className="blog-skeleton" style={{ height: 260, animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && activeList.length === 0 && (
          <div className="blogs-empty">
            <div style={{ fontSize: 38, marginBottom: 14 }}>{tab === "blogs" ? "📰" : "🌿"}</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 6 }}>
              {tab === "blogs" ? "No articles yet" : "No posts yet"}
            </div>
            <div style={{ fontSize: 13, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>
              {tab === "blogs"
                ? "Check back soon — our nutritionists are writing for you."
                : "Be the first to share your experience with the community!"}
            </div>
          </div>
        )}

        {/* List */}
        {!loading && activeList.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {activeList.map((item, i) => (
              <BlogCard
                key={item.id}
                item={item}
                open={open === item.id}
                onToggle={() => toggle(item.id)}
                delay={i * 0.07}
                isNutritionist={isNutritionist}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}