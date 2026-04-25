import Header from "../components/Header";

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
        <div className="privacy-page">
            <Header />

            <div className="privacy-container">

                <div className="privacy-badge-wrap">
                    <span className="privacy-badge">
                        <span className="privacy-badge-icon">✦</span>
                        Legal
                    </span>
                </div>

                <h1 className="privacy-title">Privacy Policy</h1>
                <p className="privacy-subtitle">Last updated: March 2026 · Effective immediately</p>

                <p className="privacy-intro">
                    At Chrisalis, your privacy is fundamental — not an afterthought. This page explains in plain language what data we collect, why we collect it, and how we protect it.
                </p>

                <div className="privacy-sections">
                    {SECTIONS.map((s, i) => (
                        <div key={s.title} className="privacy-section">
                            <div className="privacy-section-header">
                                <span className="privacy-section-num">0{i + 1}</span>
                                <h2 className="privacy-section-title">{s.title}</h2>
                            </div>
                            <p className="privacy-section-text">{s.text}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}