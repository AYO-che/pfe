import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "./assets/logo.jpg";
import p1 from "./assets/p1.jpg";
import p2 from "./assets/p2.jpg";
import p3 from "./assets/p3.jpg";
import { useAuth } from "./AuthContext";

const NAV_LINKS = ["Home", "Blogs"];

const PREMIUM_ITEMS = [
  { label: "AI Calories Calculator",            desc: "Track your daily intake with smart AI-powered insights.",       image: p1, href: "/calories" },
  { label: "Health Plans by Specialists",       desc: "Personalised programs crafted by certified nutritionists.",     image: p2, href: "/payment"  },
  { label: "Follow-up Care with a Nutritionist",desc: "Ongoing support and check-ins with your dedicated coach.",     image: p3, href: "/payment"  },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg-default:  linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%);
    --bg-hover:    #ffffff;
    --green-deep:  #1a3329;
    --green-mid:   #2d6b50;
    --green-light: #4f9e7a;
    --text:        #1a2e26;
    --text-muted:  #5a7a6e;
    --border:      #d0e8df;
    --radius-pill: 999px;
    --radius-card: 18px;
    --radius-hdr:  22px;
    --shadow-sm:   0 2px 10px rgba(26,51,41,0.07);
    --shadow-md:   0 10px 34px rgba(26,51,41,0.14);
    --transition:  0.23s cubic-bezier(0.4,0,0.2,1);
  }

  .hdr-root { font-family:'DM Sans',sans-serif; position:sticky; top:16px; z-index:100; max-width:1200px; margin:16px auto; padding:0 16px; }

  .hdr-shell { background:var(--bg-default); border:1px solid rgba(200,232,223,0.9); border-radius:var(--radius-hdr); box-shadow:var(--shadow-sm); transition:background var(--transition),box-shadow var(--transition); overflow:visible; position:relative; }
  .hdr-shell:hover { background:var(--bg-hover); box-shadow:var(--shadow-md); }

  .hdr-bar { display:flex; align-items:center; gap:10px; padding:0 20px; height:68px; }

  .hdr-nav { display:flex; align-items:center; gap:2px; flex:1; }
  @media (max-width:768px) { .hdr-nav { display:none; } }

  .nav-link { position:relative; padding:7px 13px; border-radius:var(--radius-pill); color:var(--text); text-decoration:none; font-size:14.5px; font-weight:500; transition:background var(--transition),color var(--transition); cursor:pointer; white-space:nowrap; background:transparent; border:none; font-family:'DM Sans',sans-serif; display:inline-flex; align-items:center; gap:5px; }
  .nav-link:hover, .nav-link.is-open { background:rgba(255,255,255,0.75); color:var(--green-mid); }

  .prem-badge { font-size:9.5px; font-weight:700; color:#fff; background:linear-gradient(135deg,#4f9e7a,#2d6b50); padding:2px 7px; border-radius:99px; letter-spacing:0.5px; text-transform:uppercase; }
  .prem-chevron { font-size:10px; color:var(--text-muted); display:inline-block; transition:transform var(--transition); }
  .nav-link.is-open .prem-chevron { transform:rotate(180deg); }

  .hdr-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; margin-left:auto; }

  .btn { border:none; border-radius:var(--radius-pill); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all var(--transition); white-space:nowrap; line-height:1; }
  .btn-ghost { border:1.5px solid rgba(79,158,122,0.5); background:rgba(255,255,255,0.6); color:var(--green-mid); padding:8px 18px; }
  .btn-ghost:hover { background:rgba(255,255,255,0.95); border-color:var(--green-light); }
  .btn-primary { background:linear-gradient(135deg,#3d9b73,#2a6b4f); color:#fff; padding:9px 20px; box-shadow:0 3px 10px rgba(45,107,80,0.30); }
  .btn-primary:hover { background:linear-gradient(135deg,#2a8a62,#1f5c3e); transform:translateY(-1px); box-shadow:0 5px 16px rgba(45,107,80,0.40); }
  @media (max-width:480px) { .btn-ghost { display:none; } .btn-primary { padding:8px 14px; font-size:13px; } }

  /* Avatar */
  .hdr-avatar-btn { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#1a3329,#2d6b50); border:2.5px solid rgba(245,230,66,0.5); cursor:pointer; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:#f5e642; transition:all 0.22s ease; box-shadow:0 3px 10px rgba(26,51,41,0.2); overflow:hidden; flex-shrink:0; }
  .hdr-avatar-btn:hover { transform:scale(1.08); box-shadow:0 5px 16px rgba(26,51,41,0.3); border-color:#f5e642; }

  /* Notif bell */
  .hdr-notif-btn { position:relative; width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.7); border:1px solid rgba(79,158,122,0.2); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.22s ease; flex-shrink:0; }
  .hdr-notif-btn:hover { background:#fff; box-shadow:0 3px 10px rgba(26,51,41,0.1); }
  .hdr-notif-badge { position:absolute; top:-3px; right:-3px; width:16px; height:16px; border-radius:50%; background:#f5e642; border:2px solid #fff; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; color:#1a3329; }

  /* User dropdown */
  .hdr-user-dropdown { position:absolute; top:calc(100% + 10px); right:0; width:220px; background:#fff; border:1px solid var(--border); border-radius:18px; box-shadow:var(--shadow-md); padding:10px; z-index:300; animation:dropIn 0.22s ease; }
  .hdr-user-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; font-size:14px; font-weight:500; color:var(--text); cursor:pointer; transition:background var(--transition); border:none; background:none; width:100%; font-family:'DM Sans',sans-serif; text-decoration:none; }
  .hdr-user-item:hover { background:rgba(79,158,122,0.08); color:var(--green-mid); }
  .hdr-user-item.danger { color:#e53e3e; }
  .hdr-user-item.danger:hover { background:rgba(229,62,62,0.07); }

  .hdr-burger { display:none; flex-direction:column; gap:5px; padding:8px; cursor:pointer; background:rgba(255,255,255,0.55); border:1px solid var(--border); border-radius:12px; transition:background var(--transition); }
  .hdr-burger:hover { background:rgba(255,255,255,0.9); }
  .hdr-burger span { display:block; width:20px; height:2px; background:var(--green-deep); border-radius:2px; transition:all var(--transition); }
  .hdr-burger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
  .hdr-burger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
  .hdr-burger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
  @media (max-width:768px) { .hdr-burger { display:flex; } }

  .prem-dropdown { position:absolute; top:calc(100% + 10px); left:50%; transform:translateX(-50%); width:min(740px,calc(100vw - 32px)); background:#fff; border:1px solid var(--border); border-radius:var(--radius-card); box-shadow:var(--shadow-md); padding:18px; display:grid; grid-template-columns:repeat(3,1fr); gap:12px; animation:dropIn 0.22s cubic-bezier(0.4,0,0.2,1); z-index:300; }
  @keyframes dropIn { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @media (max-width:620px) { .prem-dropdown { grid-template-columns:1fr; left:0; right:0; width:calc(100vw - 32px); transform:none; } }

  .prem-card { border-radius:14px; overflow:hidden; display:block; position:relative; aspect-ratio:4/3; background:#ddd; box-shadow:0 2px 8px rgba(0,0,0,0.08); transition:transform var(--transition),box-shadow var(--transition); cursor:pointer; }
  .prem-card:hover { transform:translateY(-4px) scale(1.015); box-shadow:0 12px 28px rgba(0,0,0,0.17); }
  .prem-card-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s ease; }
  .prem-card:hover .prem-card-img { transform:scale(1.07); }
  .prem-card-overlay { position:absolute; inset:0; background:linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.82) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:14px 14px 12px; }
  .prem-card-title { font-weight:700; font-size:12.5px; color:#fff; line-height:1.35; margin-bottom:4px; }
  .prem-card-desc  { font-size:11px; color:rgba(255,255,255,0.85); line-height:1.4; margin-bottom:10px; }
  .prem-card-arrow { align-self:flex-end; width:30px; height:30px; border-radius:50%; background:rgba(255,255,255,0.95); display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.18); transition:transform var(--transition); flex-shrink:0; }
  .prem-card:hover .prem-card-arrow { transform:translateX(3px); }
  .prem-card-arrow svg { width:13px; height:13px; stroke:var(--green-mid); fill:none; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }

  .mobile-menu { border-top:1px solid rgba(195,228,218,0.7); padding:14px 20px 20px; display:flex; flex-direction:column; gap:3px; animation:dropIn 0.2s ease; }
  @media (min-width:769px) { .mobile-menu { display:none !important; } }
  .mob-link { padding:10px 12px; border-radius:12px; color:var(--text); text-decoration:none; font-size:15px; font-weight:500; transition:background var(--transition),color var(--transition); display:flex; align-items:center; justify-content:space-between; cursor:pointer; background:none; border:none; width:100%; font-family:'DM Sans',sans-serif; }
  .mob-link:hover { background:rgba(255,255,255,0.75); color:var(--green-mid); }
  .mob-divider { height:1px; background:var(--border); margin:8px 0; }
  .mob-label { font-size:11px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:var(--text-muted); padding:4px 12px 6px; }
  .mob-prem-card { display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:12px; transition:background var(--transition); cursor:pointer; }
  .mob-prem-card:hover { background:rgba(255,255,255,0.75); }
  .mob-prem-thumb { width:44px; height:44px; border-radius:10px; object-fit:cover; flex-shrink:0; }
  .mob-prem-title { font-size:13.5px; font-weight:600; color:var(--text); }
  .mob-prem-desc  { font-size:11.5px; color:var(--text-muted); }
  .mob-actions { display:flex; gap:8px; margin-top:12px; }
  .mob-actions .btn { flex:1; text-align:center; padding:10px; }
`;

export default function Header() {
  const [premOpen, setPremOpen]             = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [mobilePremOpen, setMobilePremOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen]     = useState(false);
  const [isDesktop, setIsDesktop]           = useState(typeof window !== "undefined" ? window.innerWidth >= 769 : true);

  const premRef = useRef(null);
  const userRef = useRef(null);
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  // mock unread count — ربطي بـ AuthContext ديالك لاحقاً
  const unreadCount = user?.notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    if (document.getElementById("hdr-v3-css")) return;
    const s = document.createElement("style");
    s.id = "hdr-v3-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (premRef.current && !premRef.current.contains(e.target)) setPremOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 769);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const handlePremiumClick = (href) => { navigate(isLoggedIn ? href : "/login"); setPremOpen(false); };
  const handleLogout = () => { logout(); setUserMenuOpen(false); navigate("/"); };

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "U";

  return (
    <div className="hdr-root">
      <div className="hdr-shell">
        <div className="hdr-bar">

          {/* Logo */}
          <img src={logo} alt="logo" style={{ height: 140, marginRight: 20 }} />

          {/* Nav */}
          <nav className="hdr-nav">
            {NAV_LINKS.map(l => (
              l === "Blogs"
                ? <Link key={l} to="/blogs" className="nav-link">{l}</Link>
                : <Link key={l} to="/"      className="nav-link">{l}</Link>
            ))}
            <div ref={premRef} style={{ position: "relative" }}>
              <button className={`nav-link ${premOpen ? "is-open" : ""}`} onClick={() => setPremOpen(v => !v)} onMouseEnter={() => setPremOpen(true)}>
                Premium <span className="prem-badge">Pro</span> <span className="prem-chevron">▾</span>
              </button>
              {premOpen && (
                <div className="prem-dropdown" onMouseLeave={() => setPremOpen(false)}>
                  {PREMIUM_ITEMS.map(item => (
                    <div key={item.label} className="prem-card" onClick={() => handlePremiumClick(item.href)}>
                      <img src={item.image} alt={item.label} className="prem-card-img" />
                      <div className="prem-card-overlay">
                        <div className="prem-card-title">{item.label}</div>
                        <div className="prem-card-desc">{item.desc}</div>
                        <div className="prem-card-arrow"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="hdr-actions">
            {isDesktop && (
              isLoggedIn ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                  {/* 🔔 Notifications bell */}
                  <button className="hdr-notif-btn" onClick={() => navigate("/profile", { state: { tab: "notifs" } })}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2d6b50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && <span className="hdr-notif-badge">{unreadCount}</span>}
                  </button>

                  {/* 👤 Avatar */}
                  <div ref={userRef} style={{ position: "relative" }}>
                    <button className="hdr-avatar-btn" onClick={() => setUserMenuOpen(v => !v)}>
                      {user?.avatar
                        ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                        : <span>{firstName[0]}</span>}
                    </button>
                    {userMenuOpen && (
                      <div className="hdr-user-dropdown">
                        <div style={{ padding: "10px 12px 10px", borderBottom: "1px solid rgba(79,158,122,0.1)", marginBottom: 6 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329" }}>{user?.firstName} {user?.lastName}</div>
                          <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 2 }}>{user?.email}</div>
                        </div>
                        <Link to="/profile" className="hdr-user-item" onClick={() => setUserMenuOpen(false)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          My Profile
                        </Link>
                        <Link to="/calories" className="hdr-user-item" onClick={() => setUserMenuOpen(false)}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          Calories AI
                        </Link>
                        <div style={{ height: 1, background: "rgba(79,158,122,0.1)", margin: "6px 0" }} />
                        <button className="hdr-user-item danger" onClick={handleLogout}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button className="btn btn-ghost"   onClick={() => navigate("/login")}>Login</button>
                  <button className="btn btn-primary" onClick={() => navigate("/login")}>Sign up</button>
                </>
              )
            )}
            <button className={`hdr-burger ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
              <span/><span/><span/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            {NAV_LINKS.map(l => (
              l === "Blogs"
                ? <Link key={l} to="/blogs" className="mob-link">{l}</Link>
                : <Link key={l} to="/"      className="mob-link">{l}</Link>
            ))}
            <div className="mob-divider"/>
            <div className="mob-label">Premium</div>
            <button className="mob-link" onClick={() => setMobilePremOpen(v => !v)}>
              <span>All Premium Features</span>
              <span style={{ fontSize:12, transition:"transform 0.2s", transform:mobilePremOpen?"rotate(180deg)":"none", display:"inline-block" }}>▾</span>
            </button>
            {mobilePremOpen && PREMIUM_ITEMS.map(item => (
              <div key={item.label} className="mob-prem-card" onClick={() => handlePremiumClick(item.href)}>
                <img src={item.image} alt={item.label} className="mob-prem-thumb"/>
                <div><div className="mob-prem-title">{item.label}</div><div className="mob-prem-desc">{item.desc}</div></div>
              </div>
            ))}
            <div className="mob-divider"/>
            {isLoggedIn ? (
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ padding:"8px 12px", fontSize:13, fontWeight:600, color:"#1a3329" }}>{firstName}</div>
                <Link to="/profile" className="mob-link" onClick={() => setMobileOpen(false)}>My Profile</Link>
                <Link to="/profile" className="mob-link" onClick={() => setMobileOpen(false)}>
                  Notifications {unreadCount > 0 && <span style={{ background:"#f5e642", color:"#1a3329", borderRadius:999, padding:"1px 7px", fontSize:11, fontWeight:800 }}>{unreadCount}</span>}
                </Link>
                <button className="mob-link" style={{ color:"#e53e3e" }} onClick={handleLogout}>Log out</button>
              </div>
            ) : (
              <div className="mob-actions">
                <button className="btn btn-ghost"   onClick={() => navigate("/login")}>Login</button>
                <button className="btn btn-primary" onClick={() => navigate("/login")}>Sign up</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}