import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import Header from "../components/Header";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body, html {
  font-family: 'DM Sans', sans-serif;
  background: #f0f7f4;
  color: #1a2e25;
}

.nl-body {
  display: flex;
  height: calc(100vh - 100px);
  padding: 0 4% 20px;
  gap: 24px;
  overflow: hidden;
}

.nl-sidebar {
  width: 220px;
  background: #fff;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid #e2ece8;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 2px 16px rgba(61,155,115,0.07);
  overflow-y: auto;
  flex-shrink: 0;
  height: fit-content;
  max-height: calc(100vh - 120px);
}
.nl-section-label {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 10px 14px 4px;
}
.nl-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  color: #556;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  font-family: 'DM Sans', sans-serif;
}
.nl-nav-item:hover { background: #f0f7f4; color: #3d9b73; }
.nl-nav-item.active {
  background: linear-gradient(135deg, #3d9b73, #2a6b4f);
  color: white;
  box-shadow: 0 4px 14px rgba(61,155,115,0.3);
}

.nl-main {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.nl-main::-webkit-scrollbar { width: 4px; }
.nl-main::-webkit-scrollbar-thumb { background: #e2ece8; border-radius: 10px; }
`;

const MENU = [
  { section: "MAIN", to: ".", icon: "📊", label: "Overview" }, // ✅
  { section: "MAIN", to: "patients", icon: "🧑‍⚕️", label: "Patients" },
  { section: "MAIN", to: "plans", icon: "🥗", label: "Diet Plans" },
  { section: "MAIN", to: "consultations", icon: "📅", label: "Consultations" },
  { section: "MAIN", to: "chat", icon: "💬", label: "Messages" },
  { section: "MAIN", to: "posts", icon: "✍️", label: "Blog Posts" },
    { section: "SETTINGS", to: "notifs",   icon: "🔔", label: "Notifications" }, 
  { section: "SETTINGS", to: "profile", icon: "👤", label: "My Profile" },
];
export default function NutritionistLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <style>{CSS}</style>

      <Header />

      <div className="nl-body">
        <aside className="nl-sidebar">
          {["MAIN", "SETTINGS"].map(section => (
            <div key={section}>
              <div className="nl-section-label">{section}</div>
              {MENU.filter(m => m.section === section).map(m => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.to === "/resume"}
                  className={({ isActive }) =>
                    `nl-nav-item ${isActive ? "active" : ""}`
                  }
                >
                  <span>{m.icon}</span>
                  {m.label}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        <main className="nl-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}