import { useState, useRef, useEffect } from "react";
import Header from "./Header";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes scanLine { 0%{top:0%} 50%{top:90%} 100%{top:0%} }
@keyframes barFill  { from{width:0%} to{width:var(--w)} }
@keyframes popIn    { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
@keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }
@keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

.cal-fade-up { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both }
.cal-fade-in { animation: fadeIn 0.5s ease both }
.cal-pop-in  { animation: popIn  0.45s cubic-bezier(0.34,1.56,0.64,1) both }

.cal-scan-beam {
  position: absolute; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent 0%, #f5e642 20%, #fff 50%, #f5e642 80%, transparent 100%);
  animation: scanLine 1.8s ease-in-out infinite;
  box-shadow: 0 0 18px rgba(245,230,66,0.9), 0 0 40px rgba(245,230,66,0.4);
  z-index: 10;
}

.cal-bar-anim {
  height: 100%; border-radius: 999px;
  animation: barFill 1.1s cubic-bezier(0.34,1.2,0.64,1) both;
}

.cal-upload-zone { transition: all 0.28s ease; cursor: pointer; }
.cal-upload-zone:hover {
  border-color: #f5e642 !important;
  background: rgba(245,230,66,0.04) !important;
  box-shadow: 0 0 0 4px rgba(245,230,66,0.08), 0 8px 32px rgba(26,51,41,0.1) !important;
}

.cal-step-card { transition: all 0.26s ease; }
.cal-step-card:hover { transform: translateY(-5px); box-shadow: 0 16px 40px rgba(26,51,41,0.13) !important; }

.cal-panel { transition: all 0.25s ease; }
.cal-panel:hover { transform: translateY(-3px); }

.cal-log-btn { transition: all 0.22s ease; }
.cal-log-btn:hover {
  background: linear-gradient(135deg,#3d9b73,#2a6b4f) !important;
  color: #fff !important;
  border-color: transparent !important;
  box-shadow: 0 8px 24px rgba(45,107,80,0.35) !important;
}
`;

const STEP_IMGS = [
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80",
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=600&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
];

const SAMPLE_FOODS = [
    { label: "Salad", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&q=80" },
    { label: "Pizza", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&q=80" },
    { label: "Sushi", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=120&q=80" },
    { label: "Pasta", img: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=120&q=80" },
];

const MOCK = {
    food: "Grilled Chicken Salad",
    confidence: 94,
    calories: 342,
    weight: "~320g",
    grade: "A",
    gradeColor: "#2d7a4f",
    daily: { cal: 342, total: 2000 },
};

const STEPS = [
    { num: "01", title: "Photograph your meal", desc: "Take a clear photo of any dish, snack or drink from directly above for best results.", img: STEP_IMGS[0] },
    { num: "02", title: "AI scans the image", desc: "Our computer vision model detects every ingredient and estimates portion weight automatically.", img: STEP_IMGS[1] },
    { num: "03", title: "Receive your report", desc: "Get an instant calorie count with your daily intake percentage and a personalised health grade.", img: STEP_IMGS[2] },
];

export default function CaloriesAI() {
    const fileRef = useRef(null);
    const [stage, setStage] = useState("idle");
    const [imgSrc, setImgSrc] = useState(null);
    const [drag, setDrag] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    useEffect(() => {
        if (!document.getElementById("cal-ai-css")) {
            const s = document.createElement("style");
            s.id = "cal-ai-css"; s.textContent = CSS;
            document.head.appendChild(s);
        }
        const onResize = () => setW(window.innerWidth);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const mob = w < 768;

    const loadFile = (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => { setImgSrc(e.target.result); setStage("preview"); };
        reader.readAsDataURL(file);
    };

    const startScan = () => {
        setStage("scanning"); setProgress(0);
        let p = 0;
        const iv = setInterval(() => {
            p += Math.random() * 14 + 5;
            if (p >= 100) {
                p = 100; clearInterval(iv);
                setTimeout(() => { setResult(MOCK); setStage("result"); }, 500);
            }
            setProgress(Math.min(p, 100));
        }, 160);
    };

    const reset = () => { setStage("idle"); setImgSrc(null); setResult(null); setProgress(0); };

    const dailyPct = result ? Math.round((result.daily.cal / result.daily.total) * 100) : 0;

    return (
        <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'DM Sans',sans-serif" }}>

            {/* ══ HEADER ديالك ══ */}
            <Header />

            {/* ══ HERO ══ */}
            <section style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)", padding: mob ? "52px 24px 48px" : "68px 56px 64px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: -120, right: -120, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,230,66,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
                    <div className="cal-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12.5, fontWeight: 700, color: "#f5e642", marginBottom: 22, letterSpacing: 0.5 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f5e642", animation: "pulse 2s ease infinite", display: "inline-block" }} />
                        Instant Calorie Detection · AI Powered
                    </div>
                    <h1 className="cal-fade-up" style={{ fontFamily: "'Syne',sans-serif", fontSize: mob ? "clamp(34px,9vw,52px)" : "clamp(48px,5.5vw,68px)", fontWeight: 800, color: "#fff", letterSpacing: -2.5, lineHeight: 1.02, marginBottom: 18, animationDelay: "0.1s" }}>
                        Know exactly what<br />
                        <span style={{ color: "#f5e642" }}>you're eating.</span>
                    </h1>
                    <p className="cal-fade-up" style={{ fontSize: mob ? 15 : 17, color: "rgba(255,255,255,0.68)", maxWidth: 500, margin: "0 auto", lineHeight: 1.8, animationDelay: "0.22s" }}>
                        Upload a photo of any meal. Our AI analyses the image and returns the calorie count with your personalised daily intake progress — in under 3 seconds.
                    </p>
                </div>
            </section>

            {/* ══ MAIN ══ */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: mob ? "40px 20px 80px" : "56px 40px 100px" }}>

                <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : stage === "result" ? "1fr 1fr" : "1fr", gap: 28, marginBottom: stage === "idle" ? 72 : 0 }}>

                    {/* ── IDLE ── */}
                    {stage === "idle" && (
                        <div className="cal-fade-up cal-upload-zone"
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDrag(true); }}
                            onDragLeave={() => setDrag(false)}
                            onDrop={e => { e.preventDefault(); setDrag(false); loadFile(e.dataTransfer.files[0]); }}
                            style={{ border: `2px dashed ${drag ? "#f5e642" : "rgba(79,158,122,0.3)"}`, borderRadius: 28, padding: mob ? "52px 24px" : "72px 40px", textAlign: "center", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", boxShadow: "0 4px 24px rgba(26,51,41,0.07)" }}>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => loadFile(e.target.files[0])} />

                            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "linear-gradient(135deg,#1a3329,#2d6b50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 12px 32px rgba(26,51,41,0.2)", animation: "float 4s ease-in-out infinite" }}>
                                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                </svg>
                            </div>

                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#1a3329", marginBottom: 10 }}>Drop your meal photo here</div>
                            <div style={{ fontSize: 14.5, color: "#5a7a6e", marginBottom: 32, lineHeight: 1.7 }}>Drag & drop or click to select · JPG, PNG, WEBP</div>

                            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", borderRadius: 999, padding: "13px 32px", fontSize: 14.5, fontWeight: 700, letterSpacing: 0.3, boxShadow: "0 8px 24px rgba(26,51,41,0.25)" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Upload Photo
                            </div>

                            <div style={{ marginTop: 44, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                                {SAMPLE_FOODS.map(f => (
                                    <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.9)", border: "1.5px solid rgba(79,158,122,0.15)", borderRadius: 999, padding: "5px 14px 5px 6px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50" }}>
                                        <img src={f.img} alt={f.label} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                                        {f.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── PREVIEW ── */}
                    {stage === "preview" && (
                        <div className="cal-pop-in" style={{ borderRadius: 28, overflow: "hidden", background: "#fff", boxShadow: "0 12px 40px rgba(26,51,41,0.13)" }}>
                            <div style={{ position: "relative" }}>
                                <img src={imgSrc} alt="meal" style={{ width: "100%", maxHeight: 440, objectFit: "cover", display: "block" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 55%,rgba(26,51,41,0.55))" }} />
                                <button onClick={reset} style={{ position: "absolute", top: 16, right: 16, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#1a3329" }}>✕</button>
                                <div style={{ position: "absolute", bottom: 20, left: 24, fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>Ready to analyse</div>
                            </div>
                            <div style={{ padding: "26px 28px 28px" }}>
                                <p style={{ fontSize: 14, color: "#5a7a6e", lineHeight: 1.7, marginBottom: 24 }}>Our AI will scan the image, identify the food, and calculate the exact calorie count with your daily intake percentage.</p>
                                <button onClick={startScan} style={{ width: "100%", background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", border: "none", borderRadius: 14, padding: "16px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 24px rgba(26,51,41,0.28)" }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    Analyse with AI
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── SCANNING ── */}
                    {stage === "scanning" && (
                        <div className="cal-fade-in" style={{ borderRadius: 28, overflow: "hidden", background: "#fff", boxShadow: "0 12px 40px rgba(26,51,41,0.13)" }}>
                            <div style={{ position: "relative" }}>
                                <img src={imgSrc} alt="meal" style={{ width: "100%", maxHeight: 440, objectFit: "cover", display: "block", filter: "brightness(0.55)" }} />
                                <div className="cal-scan-beam" />
                                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(245,230,66,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(245,230,66,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
                                    <div style={{ width: 72, height: 72, borderRadius: "50%", border: "3px solid rgba(245,230,66,0.25)", borderTopColor: "#f5e642", animation: "spin 0.75s linear infinite" }} />
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>Scanning…</div>
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Detecting food & calculating calories</div>
                                </div>
                            </div>
                            <div style={{ padding: "26px 28px 28px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#2d6b50" }}>AI Processing</span>
                                    <span style={{ fontSize: 13.5, fontWeight: 800, color: "#1a3329" }}>{Math.round(progress)}%</span>
                                </div>
                                <div style={{ height: 10, background: "#f0f4f2", borderRadius: 999, overflow: "hidden", marginBottom: 18 }}>
                                    <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#2d9e7a,#f5e642)", borderRadius: 999, transition: "width 0.16s ease", boxShadow: "0 0 12px rgba(245,230,66,0.5)" }} />
                                </div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {["Detecting food", "Estimating portions", "Counting calories", "Grading meal"].map((t, i) => (
                                        <span key={t} style={{ fontSize: 12, fontWeight: 600, color: progress > i * 25 ? "#2d7a4f" : "#bbb", background: progress > i * 25 ? "#e8f5e9" : "#f5f5f5", borderRadius: 999, padding: "4px 12px", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: 5 }}>
                                            {progress > i * 25 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── RESULT LEFT ── */}
                    {stage === "result" && result && (
                        <div className="cal-pop-in" style={{ borderRadius: 28, overflow: "hidden", background: "#fff", boxShadow: "0 12px 40px rgba(26,51,41,0.13)" }}>
                            <div style={{ position: "relative" }}>
                                <img src={imgSrc} alt="meal" style={{ width: "100%", maxHeight: 340, objectFit: "cover", display: "block" }} />
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 45%,rgba(26,51,41,0.72))" }} />
                                <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.95)", borderRadius: 999, padding: "5px 14px", fontSize: 12.5, fontWeight: 700, color: "#2d6b50", display: "flex", alignItems: "center", gap: 6 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    {result.confidence}% confidence
                                </div>
                                <button onClick={reset} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#1a3329" }}>✕</button>
                                <div style={{ position: "absolute", bottom: 18, left: 20, right: 20 }}>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{result.food}</div>
                                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Estimated portion: {result.weight}</div>
                                </div>
                            </div>
                            <div style={{ padding: "22px 24px 24px" }}>
                                <button onClick={reset} className="cal-log-btn" style={{ width: "100%", background: "transparent", color: "#2d6b50", border: "1.5px solid rgba(79,158,122,0.35)", borderRadius: 14, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                                    Scan another meal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── RESULT RIGHT ── */}
                    {stage === "result" && result && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                            {/* Calories */}
                            <div className="cal-pop-in cal-panel" style={{ background: "linear-gradient(135deg,#1a3329,#2a6b4f)", borderRadius: 28, padding: "36px 32px", boxShadow: "0 12px 36px rgba(26,51,41,0.28)", animationDelay: "0.06s" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Total Calories</div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 24 }}>
                                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: mob ? 72 : 88, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{result.calories}</span>
                                    <span style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>kcal</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                                    <span>Daily intake used</span>
                                    <span style={{ color: "#f5e642" }}>{dailyPct}% of {result.daily.total} kcal</span>
                                </div>
                                <div style={{ height: 10, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
                                    <div className="cal-bar-anim" style={{ "--w": `${dailyPct}%`, background: "linear-gradient(90deg,#3d9b73,#f5e642)", boxShadow: "0 0 14px rgba(245,230,66,0.6)" }} />
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 7 }}>
                                    <span>0 kcal</span><span>{result.daily.total} kcal</span>
                                </div>
                            </div>

                            {/* Grade */}
                            <div className="cal-pop-in cal-panel" style={{ background: "#fff", borderRadius: 24, padding: "26px 28px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", animationDelay: "0.12s", display: "flex", alignItems: "center", gap: 20 }}>
                                <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#e8f5e9,#d0ede0)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 40, fontWeight: 800, color: result.gradeColor, lineHeight: 1 }}>{result.grade}</span>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329", marginBottom: 5 }}>Health Grade</div>
                                    <div style={{ fontSize: 13.5, color: "#5a7a6e", lineHeight: 1.6 }}>This meal fits comfortably within a healthy daily calorie budget.</div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="cal-pop-in cal-panel" style={{ background: "#fff", borderRadius: 24, padding: "24px 28px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", animationDelay: "0.18s" }}>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#5a7a6e", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 }}>Remaining today</div>
                                <div style={{ display: "flex", gap: 12 }}>
                                    {[
                                        { val: result.daily.total - result.daily.cal, label: "kcal left", color: "#2d7a4f", bg: "#f7faf8", border: "none" },
                                        { val: result.daily.total, label: "daily goal", color: "#1a6fa0", bg: "#f7faf8", border: "none" },
                                        { val: `${dailyPct}%`, label: "consumed", color: "#b8a200", bg: "linear-gradient(135deg,#fefde8,#fdf6c0)", border: "1.5px solid rgba(245,230,66,0.4)" },
                                    ].map(item => (
                                        <div key={item.label} style={{ flex: 1, textAlign: "center", background: item.bg, borderRadius: 16, padding: "16px 8px", border: item.border }}>
                                            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.val}</div>
                                            <div style={{ fontSize: 11.5, color: "#5a7a6e", marginTop: 5, fontWeight: 600 }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="cal-pop-in" style={{ animationDelay: "0.24s" }}>
                                <button className="cal-log-btn" style={{ width: "100%", background: "#fff", color: "#1a5e44", border: "2px solid rgba(79,158,122,0.3)", borderRadius: 18, padding: "17px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                                    Save to Food Diary
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ══ HOW IT WORKS ══ */}
                {stage === "idle" && (
                    <div className="cal-fade-up" style={{ animationDelay: "0.25s" }}>
                        <div style={{ textAlign: "center", marginBottom: 44 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(245,230,66,0.1)", border: "1px solid rgba(245,230,66,0.28)", borderRadius: 999, padding: "5px 16px 5px 10px", fontSize: 12.5, fontWeight: 700, color: "#b8a200", marginBottom: 18 }}>
                                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#1a3329" }}>✦</span>
                                Simple 3-step process
                            </span>
                            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: mob ? "clamp(28px,7vw,42px)" : "clamp(32px,4vw,50px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.06 }}>
                                How it{" "}
                                <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>works</span>
                            </h2>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 20 : 24 }}>
                            {STEPS.map(s => (
                                <div key={s.num} className="cal-step-card" style={{ borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                                    <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                                        <img src={s.img} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(26,51,41,0.2),rgba(26,51,41,0.5))" }} />
                                        <div style={{ position: "absolute", top: 16, left: 16, background: "#f5e642", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "#1a3329" }}>{s.num}</div>
                                    </div>
                                    <div style={{ padding: "22px 22px 26px" }}>
                                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#1a3329", marginBottom: 8 }}>{s.title}</div>
                                        <div style={{ fontSize: 14, color: "#5a7a6e", lineHeight: 1.7 }}>{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}