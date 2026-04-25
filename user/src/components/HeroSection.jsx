import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hs1.jpg";
import B1 from "../assets/B1.jpg";
import A1 from "../assets/A1.jpg";
import B2 from "../assets/B2.jpg";
import A2 from "../assets/A2.jpg";
import B3 from "../assets/B3.jpg";
import A3 from "../assets/A3.jpg";
import D1 from "../assets/D1.jpg";
import mindsetImg from "../assets/mindsetImg.jpg";
import hydrationImg from "../assets/hydrationImg.jpg";
import feat1 from "../assets/1.png";
import feat2 from "../assets/2.png";
import feat3 from "../assets/3.png";
import feat4 from "../assets/4.png";

const STATS_HERO = [
  { num: "5K+", label: "Members transformed" },
  { num: "98%", label: "Success rate" },
  { num: "10+", label: "Specialists" },
];

const CSS = [
  "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');",
  "@keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }",
  "@keyframes fadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }",
  "@keyframes imgScale { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }",
  "@keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }",
  ".h-badge { animation:fadeDown 0.6s ease 0.05s both }",
  ".h-title { animation:fadeUp  0.7s ease 0.15s both }",
  ".h-sub   { animation:fadeUp  0.7s ease 0.28s both }",
  ".h-btns  { animation:fadeUp  0.7s ease 0.40s both }",
  ".h-stats { animation:fadeUp  0.7s ease 0.52s both }",
  ".h-img   { animation:imgScale 0.9s ease 0.2s both }",
].join("\n");

// ── FEATURE ROWS DATA ─────────────────────────────────────────────────────────
const FEATURE_ROWS = [
   {
    img: feat1,
    imgSide: "left",
    title: "Easy Meal Planning and Templates",
    desc: "Effortlessly plan and send meal plans to clients with our simple meal planner. No more Word, Excel, or WhatsApp scrolling required to find out which plan you sent. Whatever you sent is recorded for your future reference.",
    pills: [
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /></svg>,
        label: "Meal Planning",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M3 9h6" /><path d="M3 15h6" /><path d="M15 3v18" /><path d="M15 9h6" /><path d="M15 15h6" /></svg>,
        label: "Ready to use Templates",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
        label: "One click send",
      },
    ],
  },
  {
    img: feat2,
    imgSide: "right",
    title: "Effective Communication, Chat and Video Calls",
    desc: "No more scattered client information — our platform keeps everything tidy and in one place. Communicate seamlessly through integrated chat and video.",
    pills: [
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
        label: "Integrated Chat & Video",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>,
        label: "Send Files & Images",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
        label: "Same as WhatsApp",
      },
    ],
  },
  {
    img: feat3,
    imgSide: "left",
    title: "Auto Appointments, Follow-ups, ToDo List",
    desc: "Effortlessly manage appointments & follow-ups and never miss a beat with automatic tracking at the tap of a button — no more manual tracking or chasing down clients.",
    pills: [
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        label: "Easy Follow-ups",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
        label: "Manage ToDo List",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
        label: "Notifications & Reminders",
      },
    ],
  },
  {
    img: feat4,
    imgSide: "right",
    title: "Payment and Reminders",
    desc: "Eliminate the hassle of manually tracking payment timelines and reminding clients with our automated system. No more missed payments or awkward follow-ups — stay organised and on top of everything with ease.",
    pills: [
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
        label: "Payment Management",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
        label: "No Missed Payment",
      },
      {
        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
        label: "Payment Simplified",
      },
    ],
  },
  
  
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [btnH, setBtnH] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [vis, setVis] = useState(false);
  const secRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("hero-css")) {
      const s = document.createElement("style");
      s.id = "hero-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.1 }
    );
    if (secRef.current) io.observe(secRef.current);
    return () => { window.removeEventListener("resize", onResize); io.disconnect(); };
  }, []);

  const mob = w < 768;
  const fade = (delay = 0) => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(20px)",
    transition: `all 0.65s ease ${delay}s`,
  });

  return (
    <>
      {/* ══════════════ SECTION 1 — Hero ══════════════ */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#e3f2fd 0%,#e8f5e9 100%)", fontFamily: "'DM Sans',sans-serif", minHeight: mob ? "auto" : "90vh", display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(45,107,80,0.06) 1.5px,transparent 1.5px)", backgroundSize: "30px 30px", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(200,230,201,0.45) 0%,transparent 70%)", top: "-200px", right: "-150px", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(187,222,251,0.4) 0%,transparent 70%)", bottom: "-140px", left: "-100px", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", width: "100%", padding: mob ? "56px 24px 48px" : w < 1024 ? "60px 40px" : "0 56px", display: "flex", flexDirection: mob ? "column" : "row", alignItems: "center", gap: mob ? 36 : 24 }}>
          <div style={{ flex: "0 0 46%", width: mob ? "100%" : "46%", paddingRight: mob ? 0 : 32 }}>
            <h1 className="h-title" style={{ fontFamily: "'Syne',sans-serif", fontSize: mob ? "clamp(38px,9vw,54px)" : "clamp(46px,4.8vw,68px)", fontWeight: 800, color: "#1a3329", lineHeight: 1.05, letterSpacing: -2, marginBottom: 22 }}>
              Good health<br />starts with<br />
              <span style={{ position: "relative", display: "inline-block", color: "#2d6b50" }}>
                good nutrition
                <svg viewBox="0 0 260 14" style={{ position: "absolute", bottom: -8, left: 0, width: "100%", height: 12, overflow: "visible" }}>
                  <path d="M4 9 Q130 1 256 9" fill="none" stroke="#f5e642" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </span>.
            </h1>
            <p className="h-sub" style={{ fontSize: 16, color: "#4a6a5e", lineHeight: 1.75, maxWidth: 420, marginBottom: 36 }}>
              Like a chrysalis transforms into something beautiful —{" "}
              <strong style={{ color: "#2d6b50", fontWeight: 600 }}>Chrysalis</strong>{" "}
              guides your complete health metamorphosis with AI nutrition, specialist plans, and expert follow-up care.
            </p>
            <div className="h-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 44 }}>
              <button onClick={() => navigate("/about")} onMouseEnter={() => setBtnH(true)} onMouseLeave={() => setBtnH(false)}
                style={{ background: btnH ? "linear-gradient(135deg,#2a8a62,#1f5c3e)" : "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", borderTop: "none", borderRight: "none", borderBottom: "none", borderLeft: "3px solid #f5e642", borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: btnH ? "0 10px 28px rgba(45,107,80,0.45)" : "0 4px 16px rgba(45,107,80,0.28)", transform: btnH ? "translateY(-2px)" : "translateY(0)", transition: "all 0.22s ease", display: "inline-flex", alignItems: "center", gap: 10 }}>
                MORE ABOUT CHRYSALIS
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
            <div className="h-stats" style={{ display: "flex", gap: 28, flexWrap: "wrap", paddingTop: 24, borderTop: "1px solid rgba(79,158,122,0.15)" }}>
              {STATS_HERO.map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#1a3329", lineHeight: 1 }}>{s.num}</div>
                  <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "0 0 54%", width: mob ? "100%" : "54%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="h-img" style={{ position: "relative", width: "100%", maxWidth: mob ? 460 : 580 }}>
              <div style={{ position: "absolute", inset: "10% 5%", borderRadius: 32, background: "linear-gradient(135deg,rgba(165,214,167,0.5),rgba(144,202,249,0.4))", filter: "blur(28px)", zIndex: 0 }} />
              <img src={heroImg} alt="Health transformation" style={{ position: "relative", zIndex: 1, width: "100%", borderRadius: 28, display: "block", objectFit: "cover", boxShadow: "0 20px 60px rgba(26,51,41,0.16)", animation: "floatY 6s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 2 — Tools ══════════════ */}
      <section ref={secRef} style={{ background: "#ffffff", padding: mob ? "64px 24px 72px" : "88px 24px 100px", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: mob ? 48 : 64, ...fade(0) }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(30px,4.5vw,52px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08, marginBottom: 16 }}>
              Tools built for{" "}
              <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>your goals</span>
            </h2>
            <p style={{ fontSize: 16.5, color: "#5a7a6e", maxWidth: 500, margin: "0 auto", lineHeight: 1.75 }}>
              Whether you want to lose weight, eat better, or simply feel great — Chrysalis gives you the right tools to get there.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 28 : 36 }}>
            {[
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>, color: "#e8f5e9", accent: "#2d7a4f", title: "Track. Learn. Progress.", desc: "A smart food diary helps you understand your habits and gives you insights to reach your goals faster." },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M15 3v18" /><path d="M3 9h6" /><path d="M3 15h6" /><path d="M15 9h6" /><path d="M15 15h6" /></svg>, color: "#e3f2fd", accent: "#1a6fa0", title: "Log meals effortlessly.", desc: "Scan barcodes, save favourite recipes, and use quick-add tools to track your nutrition in seconds." },
              { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>, color: "#fff8e1", accent: "#f5e642", title: "Stay motivated. Always.", desc: "Join a thriving community, get expert tips, and enjoy 24/7 support to keep you on track every day." },
            ].map((item, i) => (
              <ToolCard key={item.title} item={item} delay={0.15 + i * 0.12} vis={vis} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SECTION 3 — Feature Rows ══════════════ */}
      <FeatureRowsSection mob={mob} />

      {/* ══════════════ SECTION 4 — Blogs ══════════════ */}
      <BlogsSection mob={mob} />

      {/* ══════════════ SECTION 5 — Reviews ══════════════ */}
      <ReviewsSection mob={mob} />

      <ContactButton onClick={() => setContactOpen(true)} />
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} mob={mob} />}
    </>
  );
}

// ══════════════ FEATURE ROWS SECTION ══════════════
function FeatureRowsSection({ mob }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.05 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ fontFamily: "'DM Sans',sans-serif" }}>
      {FEATURE_ROWS.map((row, i) => (
        <FeatureRow key={row.title} row={row} index={i} mob={mob} vis={vis} />
      ))}
    </section>
  );
}

function FeatureRow({ row, index, mob, vis }) {
  const isImgLeft = row.imgSide === "left";
  const delay = 0.08 + index * 0.07;
  const bg = index % 2 === 0 ? "#ffffff" : "#f7faf8";

  return (
    <div style={{
      background: bg,
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: mob ? "52px 24px" : "80px 56px",
        display: "flex",
        flexDirection: mob ? "column" : isImgLeft ? "row" : "row-reverse",
        alignItems: "center",
        gap: mob ? 36 : 80,
      }}>

        {/* Image */}
        <div style={{ flex: "0 0 46%", width: mob ? "100%" : "46%" }}>
          <img
            src={row.img}
            alt={row.title}
            style={{ width: "100%", display: "block", objectFit: "contain" }}
          />
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: mob ? "clamp(20px,5vw,28px)" : "clamp(22px,2.2vw,32px)",
            fontWeight: 800,
            color: "#1a3329",
            letterSpacing: -0.8,
            lineHeight: 1.25,
            marginBottom: 14,
          }}>
            {row.title}
          </h3>

          <p style={{
            fontSize: 15,
            color: "#4a6a5e",
            lineHeight: 1.8,
            marginBottom: 32,
            maxWidth: 440,
          }}>
            {row.desc}
          </p>

          {/* Pills — horizontal exactly like screenshots */}
          <div style={{
            display: "flex",
            flexDirection: "row",
            gap: 32,
            flexWrap: mob ? "wrap" : "nowrap",
          }}>
            {row.pills.map((pill) => (
              <div key={pill.label} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                minWidth: 80,
              }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(45,107,80,0.15)",
                  background: "#f2faf5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2d7a4f",
                  flexShrink: 0,
                }}>
                  {pill.icon}
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#1a3329",
                  textAlign: "center",
                  lineHeight: 1.4,
                  maxWidth: 90,
                }}>
                  {pill.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Subtle divider between rows */}
      {index < FEATURE_ROWS.length - 1 && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 56px" }}>
          <div style={{ height: 1, background: "rgba(45,107,80,0.07)" }} />
        </div>
      )}
    </div>
  );
}

function ToolCard({ item, delay, vis }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "36px 28px 32px", borderRadius: 22, background: hov ? item.color : "#fafafa", border: `1.5px solid ${hov ? item.accent + "30" : "rgba(0,0,0,0.06)"}`, boxShadow: hov ? `0 16px 40px ${item.accent}18` : "0 2px 8px rgba(0,0,0,0.04)", transform: hov ? "translateY(-6px)" : "translateY(0)", transition: "all 0.26s ease", opacity: vis ? 1 : 0, transitionDelay: `${delay}s` }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: hov ? item.accent : item.color, display: "flex", alignItems: "center", justifyContent: "center", color: hov ? "#fff" : item.accent, marginBottom: 24, boxShadow: hov ? `0 8px 22px ${item.accent}44` : "none", transition: "all 0.26s ease" }}>
        {item.icon}
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329", marginBottom: 12, lineHeight: 1.2 }}>{item.title}</div>
      <div style={{ fontSize: 14.5, color: "#5a7a6e", lineHeight: 1.75 }}>{item.desc}</div>
    </div>
  );
}

// ── BLOGS ─────────────────────────────────────────────────────────────────────
const BLOGS = [
  { tag: "Nutrition", title: "10 Foods That Naturally Boost Your Metabolism", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
  { tag: "Weight Loss", title: "Why Crash Diets Always Fail — And What Works Instead", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80" },
  { tag: "Mindset", title: "Building Habits That Actually Stick Long-Term", img: mindsetImg },
  { tag: "Recipes", title: "High-Protein Breakfast Ideas Under 400 Calories", img: "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=800&q=80" },
  { tag: "Hydration", title: "How Much Water Do You Really Need Each Day?", img: hydrationImg },
  { tag: "Gut Health", title: "The Gut-Brain Connection: Eat Your Way to Better Mood", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" },
];

const TESTIMONIALS = [
  { name: "Sarah M.", goal: "Lost 18kg", quote: "Chrysalis completely changed how I think about food. In 4 months I lost 18kg without ever feeling deprived.", before: B1, after: A1, tag: "Weight Loss", accent: "#2d7a4f", color: "#e8f5e9" },
  { name: "Karim A.", goal: "Gained muscle & energy", quote: "The personalised plan and nutritionist sessions gave me the structure I needed. I feel stronger than ever at 42.", before: B2, after: A2, tag: "Muscle Gain", accent: "#1a6fa0", color: "#e3f2fd" },
  { name: "Lina R.", goal: "Managed diabetes", quote: "My blood sugar is finally under control. The AI meal planner takes all the guesswork out of eating healthy.", before: B3, after: A3, tag: "Health", accent: "#7a3fa0", color: "#f3e8fd" },
];

function BlogsSection({ mob }) {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const visible = mob ? 1 : 3;
  const max = BLOGS.length - visible;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => i >= max ? 0 : i + 1), 10000);
    return () => clearInterval(t);
  }, [max]);

  return (
    <section ref={ref} style={{ background: "#f7faf8", padding: mob ? "64px 24px" : "88px 56px", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: mob ? 36 : 52, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease" }}>
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(79,158,122,0.25)", borderRadius: 999, padding: "5px 16px 5px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", marginBottom: 14, boxShadow: "0 2px 10px rgba(45,107,80,0.08)" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
              Blogs
            </span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(26px,3.8vw,46px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08 }}>
              Health tips {"&"}{" "}
              <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>expert insights</span>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ fn: () => setIdx(i => Math.max(0, i - 1)), dis: idx === 0, d: "M15 18l-6-6 6-6" }, { fn: () => setIdx(i => Math.min(max, i + 1)), dis: idx >= max, d: "M9 18l6-6-6-6" }].map((btn, i) => (
              <button key={i} onClick={btn.fn} disabled={btn.dis} style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(45,107,80,0.2)", background: btn.dis ? "#f0f0f0" : "#fff", color: btn.dis ? "#ccc" : "#2d6b50", cursor: btn.dis ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={btn.d} /></svg>
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 24, transform: `translateX(calc(-${idx * (100 / visible)}% - ${idx * 24 / visible}px))`, transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
            {BLOGS.map((b, i) => <BlogCard key={b.title} blog={b} visible={visible} vis={vis} delay={i * 0.07} />)}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 999, border: "none", background: i === idx ? "#f5e642" : "rgba(45,107,80,0.2)", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
          ))}
        </div>

        {/* ── Before & After ── */}
        <div style={{ marginTop: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 52, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease 0.3s" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(79,158,122,0.25)", borderRadius: 999, padding: "5px 16px 5px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", marginBottom: 14 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
              Real stories
            </span>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08 }}>
              Before &{" "}
              <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>after Chrysalis</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 20 : 24 }}>
            {TESTIMONIALS.map((t, i) => <TestiCard key={t.name} t={t} vis={vis} delay={0.4 + i * 0.12} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogCard({ blog, visible, vis, delay }) {
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: `0 0 calc(${100 / visible}% - ${24 * (visible - 1) / visible}px)`, borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: hov ? "0 16px 40px rgba(26,51,41,0.14)" : "0 2px 10px rgba(0,0,0,0.06)", transform: hov ? "translateY(-5px)" : "translateY(0)", transition: "all 0.28s ease", opacity: vis ? 1 : 0, transitionDelay: `${delay}s` }}>
      <div style={{ position: "relative", overflow: "hidden", height: 210 }}>
        <img src={blog.img} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.05)" : "scale(1)", transition: "transform 0.45s ease", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(26,51,41,0.38)", opacity: hov ? 1 : 0, transition: "opacity 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => navigate("/blogs")} style={{ background: "#fff", color: "#1a5e44", border: "none", borderRadius: 999, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            More Blogs
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        </div>
        <span style={{ position: "absolute", top: 14, left: 14, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, padding: "4px 12px", borderRadius: 999 }}>{blog.tag}</span>
      </div>
      <div style={{ padding: "18px 20px 22px", fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", lineHeight: 1.45 }}>{blog.title}</div>
    </div>
  );
}

function TestiCard({ t, vis, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 22, overflow: "hidden", background: "#fff", border: `1.5px solid ${hov ? t.accent + "40" : "rgba(0,0,0,0.06)"}`, boxShadow: hov ? `0 16px 40px ${t.accent}18` : "0 2px 10px rgba(0,0,0,0.05)", transform: hov ? "translateY(-5px)" : "translateY(0)", transition: "all 0.28s ease", opacity: vis ? 1 : 0, transitionDelay: `${delay}s`, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 200 }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src={t.before} alt="before" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: "grayscale(60%)", display: "block" }} />
          <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>Before</span>
        </div>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src={t.after} alt="after" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
          <span style={{ position: "absolute", bottom: 8, right: 8, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>After</span>
        </div>
      </div>
      <div style={{ height: 3, background: `linear-gradient(90deg,${t.accent},${t.color})` }} />
      <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 }}>
        <span style={{ alignSelf: "flex-start", background: t.color, color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase" }}>{t.tag}</span>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#1a3329" }}>{t.name}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>{t.goal}</div>
        <p style={{ fontSize: 14, color: "#5a7a6e", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{t.quote}"</p>
      </div>
    </div>
  );
}

// ── REVIEWS ───────────────────────────────────────────────────────────────────
const REVIEWS = [
  { name: "Sarah M.", role: "Lost 18kg in 4 months", quote: "Chrysalis completely changed my relationship with food. The AI meal planner felt like having a personal nutritionist in my pocket. I finally understood what my body actually needed.", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80", stars: 5 },
  { name: "Karim B.", role: "Gained muscle & improved energy", quote: "I was skeptical at first, but after just two weeks on my custom plan I had more energy than I've had in years. The specialist sessions made all the difference — real advice, real results.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80", stars: 5 },
  { name: "Amira L.", role: "Managing diabetes through nutrition", quote: "My doctor was amazed at my last check-up. The chronic disease plan on Chrysalis taught me exactly how to eat for my condition. I feel in control for the first time in years.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", img: D1, stars: 5 },
];

function ReviewsSection({ mob }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref} style={{ background: "#ffffff", padding: mob ? "64px 24px 72px" : "88px 48px 100px", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: mob ? 44 : 64, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(232,245,233,0.9)", border: "1px solid rgba(79,158,122,0.25)", borderRadius: 999, padding: "5px 16px 5px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", marginBottom: 16, boxShadow: "0 2px 10px rgba(45,107,80,0.08)" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
            Real stories
          </span>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(26px,3.8vw,48px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08, marginBottom: 14 }}>
            Transformations that{" "}
            <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>speak for themselves</span>
          </h2>
          <p style={{ fontSize: 16, color: "#5a7a6e", maxWidth: 460, margin: "0 auto", lineHeight: 1.75 }}>
            Real members, real results. Here's what the Chrysalis community has to say.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: mob ? 32 : 48 }}>
          {REVIEWS.map((r, i) => (
            <ReviewCard key={r.name} review={r} flip={i % 2 !== 0} mob={mob} vis={vis} delay={0.1 + i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, flip, mob, vis, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", flexDirection: mob ? "column" : flip ? "row-reverse" : "row", borderRadius: 24, overflow: "hidden", boxShadow: hov ? "0 20px 50px rgba(26,51,41,0.13)" : "0 4px 16px rgba(0,0,0,0.07)", transform: hov ? "translateY(-4px)" : "translateY(0)", transition: "all 0.3s ease", opacity: vis ? 1 : 0, transitionDelay: `${delay}s`, background: "#fff" }}>
      <div style={{ flex: "0 0 42%", minHeight: mob ? 220 : 300, overflow: "hidden", position: "relative" }}>
        <img src={review.img} alt={review.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transform: hov ? "scale(1.05)" : "scale(1)", transition: "transform 0.5s ease" }} />
        <div style={{ position: "absolute", inset: 0, background: flip ? "linear-gradient(to left, rgba(26,51,41,0.25), transparent)" : "linear-gradient(to right, rgba(26,51,41,0.25), transparent)" }} />
      </div>
      <div style={{ flex: 1, padding: mob ? "28px 24px" : "40px 44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 20, background: hov ? "linear-gradient(135deg,#f7fdf9,#f0f9ff)" : "#fff", transition: "background 0.3s ease" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: review.stars }).map((_, i) => (
            <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#f5a623" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          ))}
        </div>
        <p style={{ fontSize: mob ? 15 : 17, color: "#2a4a3e", lineHeight: 1.8, fontStyle: "italic", margin: 0, borderLeft: "3px solid #4f9e7a", paddingLeft: 18 }}>"{review.quote}"</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={review.avatar} alt={review.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "2px solid #e8f5e9", flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329" }}>{review.name}</div>
            <div style={{ fontSize: 12.5, color: "#4f9e7a", fontWeight: 600 }}>{review.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CONTACT BUTTON + MODAL ────────────────────────────────────────────────────
function ContactButton({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ position: "fixed", right: 24, bottom: 32, zIndex: 999, background: "#d7ecfa", color: "#1a5e44", border: "none", borderRadius: 999, padding: hov ? "13px 22px" : "13px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: hov ? "0 10px 28px rgba(45,107,80,0.45)" : "0 4px 18px rgba(45,107,80,0.35)", transform: hov ? "translateY(-2px)" : "translateY(0)", transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
      Text Us
    </button>
  );
}

function ContactModal({ onClose, mob }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await fetch("http://localhost:5000/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setSent(true);
    } catch (err) { console.error(err); } finally { setSending(false); }
  };
  const inp = (extra = {}) => ({ width: "100%", boxSizing: "border-box", border: "1.5px solid rgba(79,158,122,0.25)", borderRadius: 8, padding: "8px 11px", fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", color: "#1a3329", background: "#f7fdf9", outline: "none", transition: "border 0.2s ease", ...extra });
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: "fixed", right: 24, bottom: 90, width: 250, background: "linear-gradient(135deg,#d7ecfa 0%,#d7f8da 100%)", borderRadius: 16, padding: "14px 14px", boxShadow: "0 16px 48px rgba(0,0,0,0.2)", fontFamily: "'DM Sans',sans-serif", pointerEvents: "all", zIndex: 1001 }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f0f0f0", color: "#666", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", marginBottom: 8 }}>Message sent!</div>
            <div style={{ fontSize: 14, color: "#5a7a6e", lineHeight: 1.7 }}>Thanks for reaching out. Our team will get back to you shortly.</div>
            <button onClick={onClose} style={{ marginTop: 24, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", border: "none", borderRadius: 999, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#1a3329", marginBottom: 4 }}>Get in touch</div>
              <div style={{ fontSize: 11.5, color: "#5a7a6e", lineHeight: 1.5 }}>We'd love to hear from you. Send us a message and we'll respond within 24h.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#2d6b50", display: "block", marginBottom: 3 }}>Your Name</label>
                <input value={form.name} onChange={handle("name")} placeholder="e.g. Sarah Johnson" style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#2d6b50", display: "block", marginBottom: 3 }}>Email Address</label>
                <input value={form.email} onChange={handle("email")} type="email" placeholder="you@example.com" style={inp()} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#2d6b50", display: "block", marginBottom: 3 }}>Message</label>
                <textarea value={form.message} onChange={handle("message")} placeholder="How can we help you?" rows={3} style={inp({ resize: "none" })} />
              </div>
              <button onClick={submit} disabled={sending} style={{ background: sending ? "#a0c4b4" : "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: sending ? "default" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 16px rgba(45,107,80,0.28)", transition: "all 0.22s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sending ? "Sending..." : <>Send Message <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}