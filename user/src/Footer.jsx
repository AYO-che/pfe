import { useState } from "react";
import { Link } from "react-router-dom";

const LINKS = [
    { label: "About Us", href: "/about" },
    { label: "Blogs", href: "/blogs" },
    { label: "Our Specialists", href: "/specialists" },
    { label: "Calorie Tracker", href: "/calories" },
    { label: "Privacy Policy", href: "/privacy" },
];



const STATS = [
    { num: "5K+", label: "Members" },
    { num: "98%", label: "Satisfaction" },
    { num: "10+", label: "Specialists" },
];

export default function Footer() {
    return (
        <footer style={{
            background: "linear-gradient(160deg, #2e8c63 0%, #1e5c3a 100%)",
            fontFamily: "'DM Sans', sans-serif",
            position: "relative",
            overflow: "hidden",
        }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

            {/* soft noise overlay for depth */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(0,0,0,0.08) 0%, transparent 50%)", pointerEvents: "none" }} />
            {/* subtle top highlight line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.18)", pointerEvents: "none" }} />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px 0", position: "relative", zIndex: 1 }}>

                {/* ── Main row ── */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 56, justifyContent: "space-between", marginBottom: 48 }}>

                    {/* Brand */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 280 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#f5e642", letterSpacing: -0.5 }}>Chrisalis</span>
                        </div>

                        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.62)", lineHeight: 1.85 }}>
                            Your complete health metamorphosis — AI nutrition, specialist plans, and expert follow-up care in one place.
                        </p>

                        {/* Stats */}
                        <div style={{ display: "flex", gap: 0, background: "rgba(0,0,0,0.12)", borderRadius: 14, overflow: "hidden" }}>
                            {STATS.map((s, i) => (
                                <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.num}</div>
                                    <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>


                    </div>

                    {/* Links */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Quick Links</div>
                        {LINKS.map(l => <FooterLink key={l.label} label={l.label} href={l.href} />)}
                    </div>

                    {/* Quote */}
                    <div style={{ maxWidth: 250, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            <div style={{ width: 28, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.6)" }} />
                            <div style={{ width: 8, height: 3, borderRadius: 999, background: "#f5e642" }} />
                        </div>
                        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1.7, fontStyle: "italic" }}>
                            "Prevention is better than cure."
                        </p>
                       
                    </div>

                </div>

                {/* ── Bottom bar ── */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)" }}>© 2026 Chrisalis. All rights reserved.</p>
                    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f5e642", display: "inline-block", boxShadow: "0 0 5px rgba(245,230,66,0.55)" }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>All systems operational</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.38)" }}>Made with ♥ for your health journey</p>
                </div>

            </div>
        </footer>
    );
}

function FooterLink({ label, href }) {
    const [hov, setHov] = useState(false);
    return (
        <Link to={href}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                fontSize: 14,
                color: hov ? "#ffffff" : "rgba(255,255,255,0.62)",
                textDecoration: "none",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontWeight: hov ? 600 : 400,
                padding: "6px 0",
            }}>
            <span style={{
                width: 4, height: 4, borderRadius: "50%",
                background: hov ? "#f5e642" : "rgba(255,255,255,0.25)",
                display: "inline-block", flexShrink: 0,
                transition: "background 0.2s ease",
                boxShadow: hov ? "0 0 5px rgba(245,230,66,0.5)" : "none",
            }} />
            {label}
        </Link>
    );
}

