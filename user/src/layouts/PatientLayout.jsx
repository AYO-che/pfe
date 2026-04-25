import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import Header from "../components/Header";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

body, html {
  font-family: 'DM Sans', sans-serif;
  background: #f2f7f5;
  color: #1a3329;
}

.pl-body {
  display: flex;
  min-height: calc(100vh - 100px);
  padding: 20px 4% 40px;
  gap: 20px;
  max-width: 1100px;
  margin: 0 auto;
}

.pl-sidebar {
  width: 228px; flex-shrink: 0;
  background: #fff;
  border-radius: 20px;
  padding: 18px 10px;
  border: 1px solid rgba(79,158,122,0.1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(26,51,41,0.06);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.pl-sb-section {
  font-size: 10px; font-weight: 700;
  color: #9ab8ae; letter-spacing: 1.1px;
  text-transform: uppercase;
  padding: 4px 12px; margin: 10px 0 3px;
}

.pl-sb-item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 12px; border-radius: 10px;
  font-size: 13px; font-weight: 600;
  color: #3d6b57; text-decoration: none;
  transition: all 0.18s ease;
  cursor: pointer; border: none;
  background: none; width: 100%;
  font-family: 'DM Sans', sans-serif;
  text-align: left;
}
.pl-sb-item:hover { background: #f0f7f4; color: #1a3329; }
.pl-sb-item.active {
  background: linear-gradient(135deg, #1a3329, #2d6b50);
  color: #f5e642;
  box-shadow: 0 4px 14px rgba(26,51,41,0.2);
}

.pl-main {
  flex-grow: 1; min-width: 0;
  animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}

@media (max-width: 768px) {
  .pl-sidebar { display: none; }
  .pl-body { padding: 16px 14px 40px; }
}
`;

const MENU = [
  { section: "ACCOUNT",       key: "info",     path: "/profile",        icon: "👤", label: "My Profile"       },
  { section: "CONSULTATIONS", key: "chatroom", path: "/profile/chat",   icon: "💬", label: "Chat Room"         },
  { section: "MY PLAN",       key: "plan",     path: "/profile/plan",   icon: "📋", label: "My Diet Plan"      },
  { section: "MY PLAN",       key: "progress", path: "/profile/progress",icon: "📈", label: "Progress"         },
  { section: "OTHER",         key: "notifs",   path: "/profile/notifs", icon: "🔔", label: "Notifications"     },
  { section: "OTHER",         key: "plans",    path: "/plans",          icon: "🥗", label: "Browse Plans"      },
  { section: "OTHER",         key: "calories", path: "/calories",       icon: "🤖", label: "AI Calories"       },
];

export default function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{CSS}</style>
      <Header />

      <div className="pl-body">
        {/* Sidebar */}
        <aside className="pl-sidebar">
          {["ACCOUNT", "CONSULTATIONS", "MY PLAN", "OTHER"].map(section => (
            <div key={section}>
              <div className="pl-sb-section">{section}</div>
              {MENU.filter(m => m.section === section).map(m => (
                <button
                  key={m.key}
                  className={`pl-sb-item ${location.pathname === m.path ? "active" : ""}`}
                  onClick={() => navigate(m.path)}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Page content */}
        <main className="pl-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}