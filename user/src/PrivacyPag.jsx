import Header from "./Header";

const SECTIONS = [
    {
        title: "What we collect",
        text: "We collect your name, email address, and basic health information you provide when signing up — such as your goals, weight, and dietary preferences. We also collect usage data to improve your experience."
    },
    {
        title: "How we use it",
        text: "Your data is used solely to personalise your health plan, provide nutritionist sessions, and improve our AI recommendations. We never use your data for advertising purposes."
    },
    {
        title: "Who we share it with",
        text: "We do not sell your data. We may share limited information with certified nutritionists assigned to your account, and with trusted service providers (hosting, analytics) who are bound by strict confidentiality agreements."
    },
    {
        title: "How we protect it",
        text: "All data is encrypted in transit and at rest. We follow industry-standard security practices and conduct regular audits to ensure your information stays safe."
    },
    {
        title: "Your rights",
        text: "You can request to view, edit, or permanently delete your data at any time by contacting us. You also have the right to export your data in a readable format."
    },
    {
        title: "Cookies",
        text: "We use essential cookies to keep you logged in and remember your preferences. We do not use third-party tracking cookies."
    },
    {
        title: "Contact us",
        text: "If you have any questions about this policy, reach us at privacy@chrisalis.com — we aim to respond within 48 hours."
    },
];

export default function PrivacyPage() {
    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e3f2fd 0%,#e8f5e9 100%)", fontFamily: "'DM Sans',sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}`}
            </style>

            <Header />

            <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px 96px" }}>

                {/* Badge */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(79,158,122,0.25)", borderRadius: 999, padding: "5px 16px 5px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", boxShadow: "0 2px 10px rgba(45,107,80,0.08)" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
                        Legal
                    </span>
                </div>

                {/* Title */}
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(28px,5vw,46px)", fontWeight: 800, color: "#2d7a50", textAlign: "center", letterSpacing: -2, lineHeight: 1.1, marginBottom: 12 }}>
                    Privacy Policy
                </h1>
                <p style={{ textAlign: "center", fontSize: 14, color: "#7a9e8e", marginBottom: 52 }}>
                    Last updated: March 2026 · Effective immediately
                </p>

                {/* Intro */}
                <p style={{ fontSize: 15.5, color: "#4a6a5e", lineHeight: 1.85, marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid rgba(79,158,122,0.15)" }}>
                    At Chrisalis, your privacy is fundamental — not an afterthought. This page explains in plain language what data we collect, why we collect it, and how we protect it.
                </p>

                {/* Sections */}
                <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                    {SECTIONS.map((s, i) => (
                        <div key={s.title} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 800, color: "#7a9e8e", letterSpacing: 1 }}>0{i + 1}</span>
                                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329", borderBottom: "2px solid rgba(245,230,66,0.5)", paddingBottom: 2 }}>{s.title}</h2>
                            </div>
                            <p style={{ fontSize: 15, color: "#4a6a5e", lineHeight: 1.85, paddingLeft: 28, borderLeft: "2px solid rgba(79,158,122,0.15)" }}>
                                {s.text}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}