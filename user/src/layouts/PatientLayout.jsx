import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body, html {
  font-family: 'DM Sans', sans-serif;
  background-color: #e8f5ef;
  color: #1a3329;
  min-height: 100vh;
  overflow-x: hidden;
}

.bg-texture {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background-image: url("https://www.transparenttextures.com/patterns/asfalt-dark.png");
  opacity: 0.06;
  pointer-events: none;
  z-index: -1;
}

/* ── Layout ── */
.layout-body {
  display: flex;
  min-height: calc(100vh - 90px);
  padding: 16px 2% 30px;
  gap: 14px;
  max-width: 1400px;
  margin: 0 auto;
}

.main {
  flex-grow: 1;
  min-width: 0;
  margin-left: 234px;
  background: transparent;
  position: relative;
  z-index: 1;
  transition: margin-left 0.3s ease;
}

/* ── Desktop Sidebar — fixed size, vertically centered, scrollable nav ── */
.sidebar {
  width: 220px;
  flex-shrink: 0;

  /* Fixed height — never grows with content */
  height: 520px;

  /* Vertically center in the viewport (accounting for header ~90px) */
  position: fixed;
  left: max(2%, calc((100vw - 1400px) / 2 + 2%));
  top: 50%;
  transform: translateY(-40%);

  /* Glass card look */
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.9);
  border-left:   1.5px solid rgba(168,224,44,0.9);
  border-bottom: 1.5px solid rgba(0,168,84,0.8);
  border-right:  1.5px solid rgba(0,168,84,0.8);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.15), inset 0 0 12px rgba(255,255,255,0.6);

  /* Internal layout — scrollable nav in the middle */
  display: flex;
  flex-direction: column;
  overflow: hidden;          /* clip the card corners */

  transition: background 0.3s ease, box-shadow 0.3s ease;
  z-index: 10;
}
.sidebar:hover {
  background: rgba(255,255,255,0.25);
  box-shadow: 0 10px 34px rgba(15,89,47,0.20), inset 0 0 16px rgba(255,255,255,0.8);
}

/* The scrollable area inside the sidebar */
.sidebar-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 10px 14px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,168,84,0.25) transparent;
}
.sidebar-scroll::-webkit-scrollbar { width: 4px; }
.sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,168,84,0.25);
  border-radius: 99px;
}
.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(0,168,84,0.45);
}

/* Subtle top/bottom fade to hint scroll */
.sidebar-scroll-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.sidebar-scroll-wrap::before,
.sidebar-scroll-wrap::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 18px;
  z-index: 2;
  pointer-events: none;
}
.sidebar-scroll-wrap::before {
  top: 0;
  background: linear-gradient(to bottom, rgba(240,252,244,0.85), transparent);
}
.sidebar-scroll-wrap::after {
  bottom: 0;
  background: linear-gradient(to top, rgba(240,252,244,0.85), transparent);
}

/* ── Mobile overlay ── */
.mobile-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,61,32,0.35);
  backdrop-filter: blur(3px);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.mobile-sidebar-overlay.open { opacity: 1; pointer-events: auto; }

/* ── Mobile sidebar drawer ── */
.mobile-sidebar {
  position: fixed;
  top: 0; left: 0;
  width: 250px; height: 100vh;
  background: rgba(255,255,255,0.97);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-right: 1.5px solid rgba(168,224,44,0.9);
  padding: 24px 14px;
  z-index: 100;
  transform: translateX(-110%);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto;
  scrollbar-width: none;
}
.mobile-sidebar.open { transform: translateX(0); }
.mobile-sidebar::-webkit-scrollbar { display: none; }

.mobile-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0,168,84,0.15);
}
.mobile-sidebar-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800; font-size: 17px; color: #0b6630;
}
.mobile-sidebar-close {
  background: rgba(255,255,255,0.25);
  border: 1px solid rgba(0,168,84,0.25);
  border-radius: 50%;
  width: 30px; height: 30px;
  display: flex; align-items: center; justify-content: center;
  color: #1a3329; font-size: 15px; cursor: pointer;
}

/* ── Hamburger ── */
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 24px; right: 24px;
  width: 52px; height: 52px;
  border-radius: 50%; border: none;
  background: #0b6630; color: #c6f135;
  box-shadow: 0 6px 20px rgba(11,102,48,0.4);
  cursor: pointer; z-index: 30;
  align-items: center; justify-content: center;
  font-size: 20px; font-family: monospace;
  transition: transform 0.2s, box-shadow 0.2s;
}
.mobile-menu-btn:hover { transform: scale(1.05); box-shadow: 0 8px 24px rgba(11,102,48,0.5); }
.mobile-menu-btn:active { transform: scale(0.95); }

/* ── Nav ── */
.section-label {
  font-size: 9px; font-weight: 700; color: #0b6630;
  letter-spacing: 1.2px; text-transform: uppercase;
  padding: 6px 10px; margin-top: 8px;
}

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 999px;
  font-size: 13px; font-weight: 600;
  cursor: pointer; border: none; background: none;
  width: 100%; text-align: left; color: #1a2e26;
  transition: 0.23s cubic-bezier(0.4,0,0.2,1);
  font-family: 'DM Sans', sans-serif;
}
.nav-item:hover { background: rgba(255,255,255,0.6); color: #0b6630; }
.nav-item.active { background: #0b6630; color: #fff; box-shadow: 0 4px 15px rgba(11,102,48,0.4); }

.mobile-sidebar .nav-item { padding: 10px 12px; font-size: 13.5px; }
.mobile-sidebar .nav-item:hover { background: rgba(11,102,48,0.07); }

/* icon pill */
.nav-icon-pill {
  width: 30px; height: 30px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform 0.2s;
}
.nav-item:hover .nav-icon-pill { transform: scale(1.1) rotate(-4deg); }
.nav-item.active .nav-icon-pill { filter: brightness(1.1); }

/* ── Glass cards (used in child pages) ── */
.glass-card, .sec-card {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.1), inset 0 0 10px rgba(255,255,255,0.5);
  overflow: hidden;
  transition: all 0.3s;
}
.glass-card:hover, .sec-card:hover { background: rgba(255,255,255,0.28); }

/* ── Buttons ── */
.pf-btn {
  border-radius: 20px; padding: 9px 18px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  display: inline-flex; align-items: center; gap: 7px;
  border: none; transition: all 0.2s;
}
.pf-btn-primary { background: #0b6630; color: #fff; box-shadow: 0 4px 14px rgba(11,102,48,0.3); }
.pf-btn-secondary { background: rgba(255,255,255,0.5); color: #1a3329; border: 1px solid rgba(168,224,44,0.4); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main { margin-left: 0; }
  .layout-body { padding: 14px 10px; }
  .mobile-menu-btn { display: flex; }
}
`;

/* ── Colorful SVG icons ── */
const ICONS = {
  info: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#2dd4bf"/>
      <circle cx="12" cy="9.5" r="3.2" fill="#fff"/>
      <path d="M5.8 19.5C7 16.8 9.3 15 12 15s5 1.8 6.2 4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  plan: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="13" height="17" rx="2.5" fill="#fbbf24"/>
      <rect x="7" y="7"    width="7" height="1.6" rx=".8" fill="#fff"/>
      <rect x="7" y="10.5" width="5" height="1.6" rx=".8" fill="#fef3c7"/>
      <rect x="7" y="14"   width="6" height="1.6" rx=".8" fill="#fef3c7"/>
      <circle cx="18.5" cy="18.5" r="4.5" fill="#f59e0b"/>
      <path d="M17 18.5h3M18.5 17v3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  progress: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#818cf8"/>
      <polyline points="5,17 9,11 13,14 19,7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="9"  cy="11" r="1.5" fill="#c7d2fe"/>
      <circle cx="13" cy="14" r="1.5" fill="#c7d2fe"/>
      <circle cx="19" cy="7"  r="1.5" fill="#c7d2fe"/>
    </svg>
  ),
  mood: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#fb923c"/>
      <circle cx="9"  cy="10" r="1.3" fill="#fff"/>
      <circle cx="15" cy="10" r="1.3" fill="#fff"/>
      <path d="M8.5 15 Q12 18.5 15.5 15" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="18" cy="5" r="3.5" fill="#f43f5e"/>
      <path d="M16.8 5h2.4M18 3.8v2.4" stroke="#fff" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  sessions: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#38bdf8"/>
      <rect x="3" y="4" width="18" height="6"  rx="3" fill="#0ea5e9"/>
      <rect x="7"    y="2" width="2.5" height="5" rx="1.25" fill="#0284c7"/>
      <rect x="14.5" y="2" width="2.5" height="5" rx="1.25" fill="#0284c7"/>
      <rect x="7"    y="14" width="3" height="3" rx="1" fill="#fff" opacity=".95"/>
      <rect x="10.5" y="14" width="3" height="3" rx="1" fill="#fff" opacity=".6"/>
      <rect x="14"   y="14" width="3" height="3" rx="1" fill="#fff" opacity=".3"/>
    </svg>
  ),
  notifs: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M5 11a7 7 0 0 1 14 0v4l2 3H3l2-3v-4z" fill="#fb7185"/>
      <circle cx="19" cy="5" r="3.5" fill="#f97316"/>
      <text x="17.5" y="7" fontSize="4.5" fill="#fff" fontWeight="bold">3</text>
      <path d="M9.5 20.5a2.5 2.5 0 0 0 5 0" stroke="#f43f5e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  chat: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-5 4V5z" fill="#f472b6"/>
      <path d="M19 8h0a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v3l-3-3" fill="#e879f9"/>
      <circle cx="7.5"  cy="8" r="1" fill="#fff"/>
      <circle cx="10.5" cy="8" r="1" fill="#fff"/>
    </svg>
  ),
  review: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l2.6 5.3 5.9.8-4.3 4.2 1 5.8L12 16.3l-5.2 2.8 1-5.8L3.5 9.1l5.9-.8z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round"/>
      <path d="M12 3l2.6 5.3 5.9.8-4.3 4.2 1 5.8L12 16.3" fill="#f59e0b"/>
    </svg>
  ),
  calories: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#6366f1"/>
      <path d="M8 16 Q10 8 12 12 Q14 16 16 8" stroke="#a5b4fc" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="8"  cy="16" r="1.2" fill="#c7d2fe"/>
      <circle cx="12" cy="12" r="1.2" fill="#c7d2fe"/>
      <circle cx="16" cy="8"  r="1.2" fill="#c7d2fe"/>
      <path d="M10 6.5 Q12 4 14 6.5" stroke="#c7d2fe" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  community: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3.5" fill="#34d399"/>
      <circle cx="17" cy="9" r="2.5" fill="#6ee7b7"/>
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" fill="#34d399"/>
      <path d="M16 14c2.2.3 4 2 4 4" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="19" cy="5" r="2.5" fill="#a7f3d0"/>
    </svg>
  ),
};

const ICON_BG = {
  info:      "#ccfbf1",
  plan:      "#fef9c3",
  progress:  "#ede9fe",
  mood:      "#fff7ed",
  sessions:  "#e0f2fe",
  notifs:    "#ffe4e6",
  chat:      "#fdf2f8",
  review:    "#fef3c7",
  calories:  "#eef2ff",
  community: "#d1fae5",
};

const BASE_MENU = [
  { section: "ACCOUNT", key: "info",      path: "/profile",           label: "My Profile"      },
  { section: "MY PLAN", key: "plan",      path: "/profile/plan",      label: "My Diet Plan"    },
  { section: "MY PLAN", key: "progress",  path: "/profile/progress",  label: "Progress"        },
  { section: "MY PLAN", key: "mood",      path: "/profile/mood",      label: "Mood & Symptoms" },
  { section: "MY PLAN", key: "sessions",  path: "/profile/sessions",  label: "My Sessions"     },
  { section: "OTHER",   key: "community", path: "/profile/community", label: "Community"       },
  { section: "OTHER",   key: "notifs",    path: "/profile/notifs",    label: "Notifications"   },
  { section: "OTHER",   key: "chat",      path: "/profile/chat",      label: "Chat"            },
  { section: "OTHER",   key: "review",    path: "/profile/review",    label: "Rate Sessions"   },
];

export default function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [hasAI,      setHasAI]      = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/subscriptions/mine`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const subs = data.subscriptions ?? [];
        const now  = new Date();
        const active = subs.find(s =>
          s.status === "ACTIVE" &&
          new Date(s.endDate) > now &&
          s.offer?.type === "AI_CALORIES"
        );
        setHasAI(!!active);
      })
      .catch(() => setHasAI(false));
  }, [user?.id]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const MENU = hasAI
    ? [
        ...BASE_MENU.slice(0, 5),
        { section: "OTHER", key: "calories", path: "/calories-ai", label: "AI Calories" },
        ...BASE_MENU.slice(5),
      ]
    : BASE_MENU;

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const renderMenuItems = () => (
    <>
      {["ACCOUNT", "MY PLAN", "OTHER"].map(section => (
        <div key={section}>
          <div className="section-label">{section}</div>
          {MENU.filter(m => m.section === section).map(m => (
            <button
              key={m.key}
              className={`nav-item${location.pathname === m.path ? " active" : ""}`}
              onClick={() => handleNav(m.path)}
            >
              <span className="nav-icon-pill" style={{ background: ICON_BG[m.key] }}>
                {ICONS[m.key]}
              </span>
              {m.label}
            </button>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-texture" />
      <Header />

      <div className="layout-body">

        {/* ── Desktop Sidebar ── */}
        <aside className="sidebar">
          {/* Scroll wrapper with top/bottom fade hints */}
          <div className="sidebar-scroll-wrap">
            <div className="sidebar-scroll">
              {renderMenuItems()}
            </div>
          </div>
        </aside>

        {/* ── Mobile overlay ── */}
        <div
          className={`mobile-sidebar-overlay${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* ── Mobile drawer ── */}
        <aside className={`mobile-sidebar${mobileOpen ? " open" : ""}`}>
          <div className="mobile-sidebar-header">
            <span className="mobile-sidebar-title">Menu</span>
            <button
              className="mobile-sidebar-close"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >✕</button>
          </div>
          {renderMenuItems()}
        </aside>

        <main className="main">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile hamburger ── */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Open menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>
    </>
  );
}