import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green-deep:    #1a3329;
  --green-mid:     #2d6b50;
  --green-bright:  #4f9e7a;
  --accent:        #a8e02c;
  --accent-border: rgba(168,224,44,0.35);
  --glass-bg:      rgba(255,255,255,0.45);
  --text-dark:     #1a3329;
  --text-mid:      #4a6b5a;
  --text-soft:     #8aaa96;
  --border-light:  rgba(168,224,44,0.3);
}

.rp-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5ee 0%, #d4ede0 45%, #eafaf0 100%);
font-family: Inter, sans-serif;
  padding: 44px 20px 80px;
  position: relative;
  overflow-x: hidden;
}

.rp-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, rgba(168,224,44,0.07) 1.5px, transparent 1.5px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

.rp-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}
.rp-orb-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(45,107,80,0.16), transparent 70%);
  top: -120px; right: -100px;
}
.rp-orb-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(168,224,44,0.11), transparent 70%);
  bottom: 80px; left: -80px;
}

/* ── Header ── */
.rp-header {
  text-align: center;
  margin-bottom: 38px;
  position: relative;
  z-index: 1;
}

.rp-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--green-deep);
  color: #c8e6c9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 18px;
  border-radius: 100px;
  margin-bottom: 18px;
  box-shadow: 0 4px 16px rgba(26,51,41,0.22);
}

.rp-badge-dot {
  width: 6px; height: 6px;
  background: #a8e02c;
  border-radius: 50%;
  animation: blink 2s ease infinite;
}
@keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(1.5)} }

.rp-title {
font-family: Inter, sans-serif;
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 800;
  color: var(--text-dark);
  line-height: 1.15;
  margin-bottom: 10px;
  letter-spacing: -0.4px;
}
.rp-title span { color: var(--green-mid); }

.rp-subtitle {
  font-size: 13.5px;
  color: var(--text-mid);
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.65;
}

/* ── Progress ── */
.rp-progress-wrap {
  max-width: 540px;
  margin: 0 auto 30px;
  position: relative;
  z-index: 1;
}
.rp-steps { display: flex; align-items: flex-start; }
.rp-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}
.rp-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 14px; left: 54%;
  width: 92%;
  height: 1.5px;
  background: rgba(168,224,44,0.2);
  z-index: 0;
  transition: background 0.4s;
}
.rp-step.done:not(:last-child)::after { background: var(--green-mid); }

.rp-step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1.5px solid rgba(168,224,44,0.3);
  background: rgba(255,255,255,0.4);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: var(--text-soft);
  z-index: 1;
  transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 2px 10px rgba(26,51,41,0.06);
}
.rp-step.active .rp-step-dot {
  border-color: var(--green-mid);
  background: var(--green-mid);
  color: #fff;
  box-shadow: 0 0 0 5px rgba(45,107,80,0.15), 0 4px 14px rgba(45,107,80,0.28);
}
.rp-step.done .rp-step-dot {
  border-color: var(--green-mid);
  background: var(--green-mid);
  color: #a8e02c;
}
.rp-step-label {
  font-size: 10px; font-weight: 700;
  color: var(--text-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.rp-step.active .rp-step-label,
.rp-step.done  .rp-step-label { color: var(--green-mid); }

/* ── Glass Card ── */
.rp-card {
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255,255,255,0.52);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-radius: 24px;
  padding: 36px 38px;
  border-top:    1.5px solid rgba(168,224,44,0.65);
  border-left:   1.5px solid rgba(168,224,44,0.45);
  border-bottom: 1.5px solid rgba(45,107,80,0.28);
  border-right:  1.5px solid rgba(45,107,80,0.28);
  box-shadow: 0 8px 40px rgba(26,51,41,0.09), inset 0 0 24px rgba(255,255,255,0.38);
  animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
  position: relative;
  z-index: 1;
  overflow: hidden;
}
.rp-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(168,224,44,0.55), transparent);
  pointer-events: none;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Section titles ── */
.rp-section-title {
font-family: Inter, sans-serif;


font-size: 18px; font-weight: 800;
  color: var(--text-dark);
  margin-bottom: 4px;
  letter-spacing: -0.3px;
}
.rp-section-sub {
  font-size: 12.5px;
  color: var(--text-soft);
  margin-bottom: 24px;
}

/* ── Fields ── */
.rp-field { margin-bottom: 16px; }
.rp-field label {
  display: block;
  font-size: 10.5px; font-weight: 700;
  color: var(--text-dark);
  letter-spacing: 0.09em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.rp-input, .rp-textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border-light);
  border-radius: 12px;
font-family: Inter, sans-serif;
  font-size: 13.5px;
  color: var(--text-dark);
  background: rgba(255,255,255,0.5);
  backdrop-filter: blu
  r(8px);
  outline: none;
  transition: all 0.22s;
  box-shadow: 0 2px 8px rgba(26,51,41,0.04);
}
.rp-input:focus, .rp-textarea:focus {
  border-color: rgba(45,107,80,0.55);
  background: rgba(255,255,255,0.82);
  box-shadow: 0 0 0 3px rgba(45,107,80,0.1);
}
.rp-input::placeholder, .rp-textarea::placeholder { color: var(--text-soft); }
.rp-textarea { resize: vertical; min-height: 100px; line-height: 1.65; }

.rp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 500px) { .rp-row { grid-template-columns: 1fr; } }

/* ── Tags ── */
.rp-tags-wrap {
  display: flex; flex-wrap: wrap; gap: 7px;
  padding: 9px 12px;
  border: 1.5px solid var(--border-light);
  border-radius: 12px;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
  min-height: 44px; cursor: text;
  transition: all 0.22s;
}
.rp-tags-wrap:focus-within {
  border-color: rgba(45,107,80,0.55);
  background: rgba(255,255,255,0.82);
  box-shadow: 0 0 0 3px rgba(45,107,80,0.1);
}
.rp-tag {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(45,107,80,0.11);
  border: 1px solid rgba(45,107,80,0.18);
  color: var(--green-deep);
  font-size: 11.5px; font-weight: 600;
  padding: 3px 10px; border-radius: 100px;
}
.rp-tag button {
  background: none; border: none; cursor: pointer;
  color: var(--green-mid); font-size: 14px; line-height: 1;
  padding: 0; opacity: 0.65; transition: opacity 0.15s;
}
.rp-tag button:hover { opacity: 1; }
.rp-tag-input {
  border: none; outline: none;
font-family: Inter, sans-serif;
  font-size: 13px; color: var(--text-dark);
  background: transparent; min-width: 120px; flex: 1;
}
.rp-tag-hint { font-size: 10.5px; color: var(--text-soft); margin-top: 5px; }

/* ── Offer Cards ── */
.rp-offer-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
@media (max-width: 440px) { .rp-offer-grid { grid-template-columns: 1fr; } }

.rp-offer-card {
  border: 1.5px solid var(--border-light);
  border-radius: 16px;
  padding: 22px 16px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
  text-align: center;
  background: rgba(255,255,255,0.32);
  backdrop-filter: blur(12px);
  position: relative; overflow: hidden;
}
.rp-offer-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(168,224,44,0.5), transparent);
  opacity: 0; transition: opacity 0.25s;
}
.rp-offer-card:hover {
  border-color: rgba(45,107,80,0.38);
  background: rgba(255,255,255,0.55);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(26,51,41,0.09);
}
.rp-offer-card:hover::after { opacity: 1; }
.rp-offer-card.selected {
  border-color: rgba(45,107,80,0.65);
  background: rgba(45,107,80,0.08);
  box-shadow: 0 0 0 3px rgba(45,107,80,0.1), 0 8px 22px rgba(26,51,41,0.09);
}
.rp-offer-card.selected::after { opacity: 1; }

.rp-offer-icon { font-size: 30px; margin-bottom: 10px; }
.rp-offer-label { font-size: 13.5px; font-weight: 700; color: var(--text-dark); font-family: Inter, sans-serif; }
.rp-offer-desc  { font-size: 11.5px; color: var(--text-soft); margin-top: 5px; line-height: 1.4; }
.rp-offer-check {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; color: var(--green-mid); font-weight: 700;
  margin-top: 10px;
  background: rgba(45,107,80,0.1);
  border-radius: 100px; padding: 2px 10px;
}

/* ── Divider ── */
.rp-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-light), transparent);
  margin: 20px 0;
}

/* ── Char hint ── */
.rp-char-hint {
  font-size: 10.5px; color: var(--text-soft);
  margin-top: 5px; text-align: right;
}

/* ── Nav Buttons ── */
.rp-nav {
  display: flex; align-items: center; gap: 10px;
  margin-top: 26px;
}
.rp-btn-back {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1.5px solid var(--border-light);
  background: rgba(255,255,255,0.38);
  backdrop-filter: blur(8px);
  color: var(--green-mid);
font-family: Inter, sans-serif;
  font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.rp-btn-back:hover {
  background: rgba(255,255,255,0.65);
  border-color: rgba(45,107,80,0.4);
}
.rp-btn-next {
  flex: 1;
  padding: 12px 24px;
  border-radius: 12px; border: none;
  background: linear-gradient(135deg, var(--green-deep), var(--green-mid));
  color: #a8e02c;
font-family: Inter, sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.25s;
  box-shadow: 0 4px 18px rgba(26,51,41,0.22);
}
.rp-btn-next:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(26,51,41,0.28);
}
.rp-btn-next:disabled { opacity: 0.42; cursor: not-allowed; transform: none; }

/* ── Error ── */
.err-box {
  background: rgba(229,62,62,0.08);
  border: 1px solid rgba(229,62,62,0.22);
  border-radius: 10px;
  padding: 10px 14px; font-size: 13px;
  color: #c53030; margin-bottom: 18px;
  backdrop-filter: blur(6px);
}

/* ── Success ── */
.rp-success { text-align: center; padding: 14px 0; }
.rp-success-icon {
  width: 80px; height: 80px;
  background: linear-gradient(135deg, var(--green-deep), var(--green-mid));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 34px;
  margin: 0 auto 22px;
  box-shadow: 0 8px 30px rgba(26,51,41,0.28), 0 0 0 8px rgba(45,107,80,0.1);
  animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both;
}
@keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

.rp-success h2 {
font-family: Inter, sans-serif;
  font-size: 24px; font-weight: 800;
  color: var(--text-dark); margin-bottom: 10px;
}
.rp-success p { font-size: 13.5px; color: var(--text-mid); line-height: 1.65; }
.rp-success-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(45,107,80,0.1);
  border: 1px solid rgba(45,107,80,0.2);
  color: var(--green-mid);
  font-size: 12px; font-weight: 700;
  padding: 5px 14px; border-radius: 100px; margin-top: 16px;
}

/* ── Spinner ── */
@keyframes spin { to { transform: rotate(360deg); } }
.rp-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(168,224,44,0.25);
  border-top-color: #a8e02c;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.65s linear infinite;
}
`;

const STEPS = ["Identity", "Experience", "Offers"];

const OFFER_OPTIONS = [
  { value: "PLAN",    icon: "📋", label: "Meal Plan", desc: "Custom PDF nutrition plans for clients" },
  { value: "PACKAGE", icon: "📦", label: "Package",   desc: "Sessions + personalised plan + chat" },
];

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput("");
  };

  const remove = (tag) => onChange(value.filter(t => t !== tag));

  return (
    <>
      <div className="rp-tags-wrap">
        {value.map(tag => (
          <span key={tag} className="rp-tag">
            {tag}
            <button type="button" onClick={() => remove(tag)}>×</button>
          </span>
        ))}
        <input
          className="rp-tag-input"
          value={input}
          placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
      <div className="rp-tag-hint">Press Enter or comma to add</div>
    </>
  );
}

export default function CreateResumePage() {
  const { fetchUser } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const [form, setForm] = useState({
    bio:             "",
    education:       "",
    workplace:       "",
    experienceYears: "",
    specializations: [],
    certifications:  [],
    offersTypes:     [],
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleOffer = (val) =>
    set("offersTypes",
      form.offersTypes.includes(val)
        ? form.offersTypes.filter(v => v !== val)
        : [...form.offersTypes, val]
    );

  const stepValid = () => {
    if (step === 0) return form.bio.trim().length >= 20;
    if (step === 1) return form.experienceYears !== "" && form.specializations.length > 0;
    if (step === 2) return form.offersTypes.length > 0;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/resume`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio:             form.bio,
          education:       form.education,
          workplace:       form.workplace,
          experienceYears: parseInt(form.experienceYears, 10),
          specializations: form.specializations,
          certifications:  form.certifications,
          offersTypes:     form.offersTypes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save resume");
      await fetchUser();
      setDone(true);
      setTimeout(() => navigate("/resume"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepClass = (i) =>
    i < step ? "rp-step done" : i === step ? "rp-step active" : "rp-step";

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-page">
        <div className="rp-orb rp-orb-1" />
        <div className="rp-orb rp-orb-2" />

        {/* ── Header ── */}
        <div className="rp-header">
          <div className="rp-badge">
            <span className="rp-badge-dot" />
            Profile Setup
          </div>
          <h1 className="rp-title">Build your <span>professional</span> resume</h1>
          <p className="rp-subtitle">This is what clients see when browsing nutritionists on the platform.</p>
        </div>

        {/* ── Progress ── */}
        {!done && (
          <div className="rp-progress-wrap">
            <div className="rp-steps">
              {STEPS.map((label, i) => (
                <div key={label} className={stepClass(i)}>
                  <div className="rp-step-dot">{i < step ? "✓" : i + 1}</div>
                  <div className="rp-step-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Glass Card ── */}
        <div className="rp-card" key={done ? "done" : step}>

          {/* SUCCESS */}
          {done ? (
            <div className="rp-success">
              <div className="rp-success-icon">✓</div>
              <h2>Resume created!</h2>
              <p>Your professional profile is now live on the platform.<br />Redirecting you to your dashboard…</p>
              <div className="rp-success-badge">
                <span style={{ width: 6, height: 6, background: "#a8e02c", borderRadius: "50%", display: "inline-block" }} />
                Profile is live
              </div>
            </div>

          /* STEP 0 */
          ) : step === 0 ? (
            <>
              <div className="rp-section-title">About you</div>
              <div className="rp-section-sub">Write a compelling bio and add your workplace details.</div>
              {error && <div className="err-box">⚠️ {error}</div>}

              <div className="rp-field">
                <label>Bio *</label>
                <textarea
                  className="rp-textarea"
                  placeholder="Describe your approach to nutrition, your philosophy and what sets you apart…"
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                />
                <div className="rp-char-hint" style={{ color: form.bio.length >= 20 ? "#2d6b50" : undefined }}>
                  {form.bio.length} / 20 min chars
                </div>
              </div>

              <div className="rp-divider" />

              <div className="rp-row">
                <div className="rp-field">
                  <label>Education</label>
                  <input className="rp-input" placeholder="e.g. MSc Nutritional Science"
                    value={form.education} onChange={e => set("education", e.target.value)} />
                </div>
                <div className="rp-field">
                  <label>Workplace</label>
                  <input className="rp-input" placeholder="e.g. Wellness Clinic"
                    value={form.workplace} onChange={e => set("workplace", e.target.value)} />
                </div>
              </div>

              <div className="rp-nav">
                <button className="rp-btn-next" disabled={!stepValid()} onClick={() => setStep(1)}>
                  Continue →
                </button>
              </div>
            </>

          /* STEP 1 */
          ) : step === 1 ? (
            <>
              <div className="rp-section-title">Experience & skills</div>
              <div className="rp-section-sub">Your years of experience, specializations and certifications.</div>
              {error && <div className="err-box">⚠️ {error}</div>}

              <div className="rp-field">
                <label>Years of experience *</label>
                <input className="rp-input" type="number" min="0" max="50" placeholder="e.g. 5"
                  value={form.experienceYears} onChange={e => set("experienceYears", e.target.value)}
                  style={{ maxWidth: 150 }} />
              </div>

              <div className="rp-divider" />

              <div className="rp-field">
                <label>Specializations *</label>
                <TagInput value={form.specializations} onChange={v => set("specializations", v)}
                  placeholder="e.g. Weight Loss, Diabetes…" />
              </div>

              <div className="rp-field">
                <label>Certifications</label>
                <TagInput value={form.certifications} onChange={v => set("certifications", v)}
                  placeholder="e.g. Registered Dietitian…" />
              </div>

              <div className="rp-nav">
                <button className="rp-btn-back" onClick={() => setStep(0)}>← Back</button>
                <button className="rp-btn-next" disabled={!stepValid()} onClick={() => setStep(2)}>
                  Continue →
                </button>
              </div>
            </>

          /* STEP 2 */
          ) : (
            <>
              <div className="rp-section-title">What will you offer?</div>
              <div className="rp-section-sub">Select the services you want to provide to clients.</div>
              {error && <div className="err-box">⚠️ {error}</div>}

              <div className="rp-offer-grid">
                {OFFER_OPTIONS.map(o => (
                  <div
                    key={o.value}
                    className={`rp-offer-card ${form.offersTypes.includes(o.value) ? "selected" : ""}`}
                    onClick={() => toggleOffer(o.value)}
                  >
                    <div className="rp-offer-icon">{o.icon}</div>
                    <div className="rp-offer-label">{o.label}</div>
                    <div className="rp-offer-desc">{o.desc}</div>
                    {form.offersTypes.includes(o.value) && (
                      <div className="rp-offer-check">✓ Selected</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="rp-nav">
                <button className="rp-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="rp-btn-next" disabled={!stepValid() || loading} onClick={submit}>
                  {loading
                    ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                        <span className="rp-spinner" /> Saving…
                      </span>
                    : "Launch my profile ✦"
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}