//nutritionist
import { useState } from "react";
import { Outlet, NavLink, Navigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body, html {
  font-family: 'DM Sans', sans-serif;
  background: #e8f5ef;
  color: #1a3329;
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

.layout-body {
  display: flex;
  min-height: calc(100vh - 90px);
  padding: 16px 2% 30px;
  gap: 14px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Sidebar ── */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.9);
  border-left:   1.5px solid rgba(168,224,44,0.9);
  border-bottom: 1.5px solid rgba(0,168,84,0.8);
  border-right:  1.5px solid rgba(0,168,84,0.8);
  border-radius: 22px;
  padding: 18px 12px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.15), inset 0 0 12px rgba(255,255,255,0.6);
  position: fixed;
  left: max(2%, calc((100vw - 1400px) / 2 + 2%));
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
  transition: all 0.3s ease;
  z-index: 100;
}
.sidebar::-webkit-scrollbar { display: none; }
.sidebar:hover {
  background: rgba(255,255,255,0.25);
  box-shadow: 0 10px 34px rgba(15,89,47,0.20), inset 0 0 16px rgba(255,255,255,0.8);
}

/* ── Mobile overlay ── */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15,61,32,0.35);
  backdrop-filter: blur(3px);
  z-index: 99;
}
.sidebar-overlay.open { display: block; }

@media (max-width: 768px) {
  .sidebar {
    left: 0; top: 0;
    transform: translateX(-110%);
    border-radius: 0 22px 22px 0;
    height: 100vh; max-height: 100vh;
    width: 230px; padding-top: 28px;
  }
  .sidebar.mobile-open { transform: translateX(0); }
  .main { margin-left: 0 !important; }
  .layout-body { padding: 14px 10px; }
}

/* ── Hamburger ── */
.menu-toggle {
  display: none;
  position: fixed;
  bottom: 22px; left: 16px;
  z-index: 200;
  width: 48px; height: 48px;
  border-radius: 50%; border: none;
  background: #0b6630; color: #c6f135;
  font-size: 20px; cursor: pointer;
  align-items: center; justify-content: center;
  box-shadow: 0 4px 18px rgba(11,102,48,0.4);
  transition: background 0.2s, transform 0.2s;
  font-family: monospace;
}
.menu-toggle:hover { background: #0d7a38; transform: scale(1.06); }
@media (max-width: 768px) { .menu-toggle { display: flex; } }

/* ── Sidebar close btn ── */
.sidebar-close {
  display: none;
  position: absolute; top: 14px; right: 14px;
  background: rgba(255,255,255,0.25);
  border: 1px solid rgba(0,168,84,0.25);
  border-radius: 50%; width: 30px; height: 30px;
  align-items: center; justify-content: center;
  color: #1a3329; font-size: 16px; cursor: pointer;
}
@media (max-width: 768px) { .sidebar-close { display: flex; } }

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
  font-family: 'DM Sans', sans-serif; text-decoration: none;
}
.nav-item:hover { background: rgba(255,255,255,0.6); color: #0b6630; }
.nav-item.active { background: #0b6630; color: #fff; box-shadow: 0 4px 15px rgba(11,102,48,0.4); }

.nav-icon-pill {
  width: 30px; height: 30px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform 0.2s;
}
.nav-item:hover .nav-icon-pill { transform: scale(1.1) rotate(-4deg); }
.nav-item.active .nav-icon-pill { filter: brightness(1.1); }

/* ── Main ── */
.main {
  flex-grow: 1; min-width: 0;
  margin-left: 234px;
  background: transparent; position: relative; z-index: 1;
}
`;

const ICONS = {
  overview: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="#818cf8"/>
      <rect x="13" y="3" width="8" height="8" rx="2.5" fill="#6366f1"/>
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="#a5b4fc"/>
      <rect x="13" y="13" width="8" height="8" rx="2.5" fill="#7c3aed"/>
    </svg>
  ),
  patients: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3.8" fill="#fb923c"/>
      <path d="M2 20c0-3.5 3.1-6.3 7-6.3s7 2.8 7 6.3" stroke="#f97316" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="19" cy="8" r="2.5" fill="#fbbf24"/>
      <path d="M19 13c2.2 0 4 1.5 4 3.5" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  plans: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="14" rx="7" ry="5" fill="#4ade80"/>
      <ellipse cx="12" cy="11" rx="7" ry="5" fill="#22c55e"/>
      <ellipse cx="12" cy="8"  rx="7" ry="5" fill="#16a34a"/>
      <circle cx="8"  cy="8"  r="1.2" fill="#bbf7d0"/>
      <circle cx="12" cy="6"  r="1.2" fill="#bbf7d0"/>
      <circle cx="16" cy="8"  r="1.2" fill="#bbf7d0"/>
    </svg>
  ),
  consultations: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="17" rx="3" fill="#38bdf8"/>
      <rect x="3" y="4" width="18" height="6" rx="3" fill="#0ea5e9"/>
      <rect x="7" y="2" width="2.5" height="5" rx="1.25" fill="#0284c7"/>
      <rect x="14.5" y="2" width="2.5" height="5" rx="1.25" fill="#0284c7"/>
      <rect x="7"  y="14" width="3" height="3" rx="1" fill="#fff" opacity=".95"/>
      <rect x="10.5" y="14" width="3" height="3" rx="1" fill="#fff" opacity=".6"/>
      <rect x="14" y="14" width="3" height="3" rx="1" fill="#fff" opacity=".3"/>
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
  posts: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="13" height="17" rx="2.5" fill="#fbbf24"/>
      <rect x="7" y="7"  width="7" height="1.6" rx=".8" fill="#fff"/>
      <rect x="7" y="10.5" width="5" height="1.6" rx=".8" fill="#fef3c7"/>
      <rect x="7" y="14" width="6" height="1.6" rx=".8" fill="#fef3c7"/>
      <circle cx="18.5" cy="18.5" r="4.5" fill="#f59e0b"/>
      <path d="M17 18.5h3M18.5 17v3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
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
  profile: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#2dd4bf"/>
      <circle cx="12" cy="9.5" r="3.2" fill="#fff"/>
      <path d="M5.8 19.5C7 16.8 9.3 15 12 15s5 1.8 6.2 4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  ),
};

const ICON_BG = {
  overview:      "#ede9fe",
  patients:      "#fff7ed",
  plans:         "#dcfce7",
  consultations: "#e0f2fe",
  chat:          "#fdf2f8",
  posts:         "#fef9c3",
  notifs:        "#ffe4e6",
  profile:       "#ccfbf1",
};

const MENU = [
  { section: "MAIN",     to: ".",             iconKey: "overview",      label: "Overview"      },
  { section: "MAIN",     to: "patients",      iconKey: "patients",      label: "Patients"      },
  { section: "MAIN",     to: "plans",         iconKey: "plans",         label: "Diet Plans"    },
  { section: "MAIN",     to: "consultations", iconKey: "consultations", label: "Consultations" },
  { section: "MAIN",     to: "chat",          iconKey: "chat",          label: "Messages"      },
  { section: "MAIN",     to: "posts",         iconKey: "posts",         label: "Blog Posts"    },
  { section: "SETTINGS", to: "notifs",        iconKey: "notifs",        label: "Notifications" },
  { section: "SETTINGS", to: "profile",       iconKey: "profile",       label: "My Profile"    },
  { section: "SETTINGS", to: "reviews",        iconKey: "profile",       label: "Reviews" },
];

export default function NutritionistLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "NUTRITION") return <Navigate to="/" replace />;
  if (!user.stripeAccountId) return <Navigate to="/nutritionist-setup" replace />;
  if (!user.hasResume) return <Navigate to="/resume/create" replace />;

  const closeSidebar = () => setMobileOpen(false);

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-texture" />
      <Header />

      <div className={`sidebar-overlay${mobileOpen ? " open" : ""}`} onClick={closeSidebar} />

      <div className="layout-body">
        <aside className={`sidebar${mobileOpen ? " mobile-open" : ""}`}>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close menu">✕</button>

          {["MAIN", "SETTINGS"].map(section => (
            <div key={section}>
              <div className="section-label">{section}</div>
              {MENU.filter(m => m.section === section).map(m => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.to === "."}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  onClick={closeSidebar}
                >
                  <span
                    className="nav-icon-pill"
                    style={{ background: ICON_BG[m.iconKey] }}
                  >
                    {ICONS[m.iconKey]}
                  </span>
                  {m.label}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        <main className="main">
          <Outlet />
        </main>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>
    </>
  );
}