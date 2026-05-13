import { useState, useEffect } from "react";
import { useAuth } from "../../context/Authcontext";

const API_URL = "http://localhost:5000";

const OFFER_ICONS = {
  PLAN:        { icon: "📋", label: "Meal Plan"    },
  PACKAGE:     { icon: "📦", label: "Package"      },
  AI_CALORIES: { icon: "🤖", label: "AI Calories"  },
};

/* ── TagInput ── */
function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  const remove = (tag) => onChange(value.filter(t => t !== tag));
  return (
    <>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        padding: "10px 12px", border: "1.5px solid rgba(26,51,41,0.12)",
        borderRadius: 10, background: "#fafbfa", minHeight: 44, cursor: "text",
        transition: "border-color 0.2s",
      }}>
        {value.map(tag => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "#e8f5ef", color: "#1a3329", fontSize: 12,
            fontWeight: 600, padding: "3px 10px", borderRadius: 100,
          }}>
            {tag}
            <button type="button" onClick={() => remove(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#2d6b50", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
        <input
          value={input}
          placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          style={{
            border: "none", outline: "none",
            fontFamily: "'DM Sans',sans-serif", fontSize: 13,
            color: "#1a3329", background: "transparent",
            minWidth: 120, flex: 1,
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "#8a9a8e", marginTop: 4 }}>Press Enter or comma to add</div>
    </>
  );
}

/* ── Shared sub-components matching ProfileInfoPage style ── */
const Section = ({ title, subtitle, children, accent }) => (
  <div style={{
    background: "#fff", borderRadius: 20,
    border: "1px solid rgba(26,51,41,0.06)",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(26,51,41,0.04)",
  }}>
    <div style={{
      padding: "20px 24px 16px",
      borderBottom: "1px solid rgba(26,51,41,0.05)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent || "#2d6b50", flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a3329" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: "#8a9a8e", marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding: "8px 24px 20px" }}>{children}</div>
  </div>
);

const InfoRow = ({ label, value, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(26,51,41,0.05)" }}>
    <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>
    <span style={{ fontSize: 12, color: "#8a9a8e", fontWeight: 600, minWidth: 120 }}>{label}</span>
    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329", flex: 1, textAlign: "right" }}>{value || "—"}</span>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", textarea = false }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9a8e", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
    {textarea
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
          style={{ width: "100%", border: "1.5px solid rgba(26,51,41,0.12)", borderRadius: 10, padding: "10px 13px", fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", color: "#1a3329", background: "#fafbfa", outline: "none", resize: "vertical", boxSizing: "border-box", transition: "all 0.2s" }} />
      : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={{ width: "100%", border: "1.5px solid rgba(26,51,41,0.12)", borderRadius: 10, padding: "10px 13px", fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", color: "#1a3329", background: "#fafbfa", outline: "none", boxSizing: "border-box", transition: "all 0.2s" }} />
    }
  </div>
);

const ActionBtn = ({ onClick, children, variant = "primary", disabled = false }) => {
  const base = {
    borderRadius: 10, padding: "10px 18px", fontSize: 13,
    fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans',sans-serif",
    display: "inline-flex", alignItems: "center", gap: 8,
    border: "none", transition: "all 0.2s ease", opacity: disabled ? 0.6 : 1,
  };
  const variants = {
    primary:   { background: "#1a3329", color: "#fff" },
    secondary: { background: "#fff", color: "#5a7a6e", border: "1.5px solid rgba(26,51,41,0.12)" },
    danger:    { background: "transparent", color: "#8a3a2f", border: "1.5px solid rgba(192,57,43,0.18)" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>
  );
};

/* ════════════════════════════════════════════════════════ */
export default function NutritionProfilePage() {
  const { user } = useAuth();

  const [resume,  setResume]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState({
    bio:             "",
    education:       "",
    workplace:       "",
    experienceYears: "",
    specializations: [],
    certifications:  [],
    offersTypes:     [],
  });

  useEffect(() => {
    fetch(`${API_URL}/resume`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setResume(data);
        setForm({
          bio:             data.bio             ?? "",
          education:       data.education       ?? "",
          workplace:       data.workplace       ?? "",
          experienceYears: data.experienceYears ?? "",
          specializations: data.specializations ?? [],
          certifications:  data.certifications  ?? [],
          offersTypes:     data.offersTypes     ?? [],
        });
      })
      .catch(() => setError("Could not load resume."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res  = await fetch(`${API_URL}/resume`, {
        method:      "PATCH",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experienceYears: form.experienceYears ? parseInt(form.experienceYears, 10) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setResume(data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(79,158,122,0.2)", borderTop: "3px solid #2d6b50", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .anim-up    { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both }
        .anim-up-d1 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both }
        .anim-up-d2 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.16s both }
        .anim-up-d3 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.24s both }
        .anim-up-d4 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.32s both }
        input:focus, textarea:focus { border-color: #2d6b50 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(45,107,80,0.1) !important; }
      `}</style>

      {/* ── Top Bar ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid rgba(26,51,41,0.06)",
        padding: "16px 0 16px", position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "blur(12px)", marginBottom: 28,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329" }}>My Profile</div>
            <div style={{ fontSize: 12, color: "#8a9a8e", marginTop: 2 }}>Your public nutritionist profile</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {editing ? (
              <>
                <ActionBtn variant="secondary" onClick={() => { setEditing(false); setError(""); }}>Cancel</ActionBtn>
                <ActionBtn variant="primary" onClick={save} disabled={saving}>
                  {saving
                    ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Saving…</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Save</>
                  }
                </ActionBtn>
              </>
            ) : (
              <ActionBtn variant="primary" onClick={() => setEditing(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </ActionBtn>
            )}
          </div>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {saved && (
        <div className="anim-up" style={{
          background: "#e8f5e9", borderRadius: 14, padding: "14px 20px",
          fontSize: 14, fontWeight: 600, color: "#2d7a4f",
          display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
        }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#2d7a4f", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          Profile saved successfully
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid rgba(229,62,62,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#c53030" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Two Column Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>

        {/* ── LEFT: Identity Card ── */}
        <div className="anim-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Identity Card */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(26,51,41,0.06)", overflow: "hidden", boxShadow: "0 1px 2px rgba(26,51,41,0.04)" }}>
            {/* Header Strip */}
            <div style={{ height: 80, background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a5e3a 100%)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "20px 20px" }} />
            </div>

            <div style={{ padding: "0 24px 24px", position: "relative" }}>
              {/* Avatar overlapping strip */}
              <div style={{ marginTop: -40, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#1a3329,#2d6b50)", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(26,51,41,0.12)" }}>
                  {user?.image
                    ? <img src={user.image} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#f5e642" }}>{initials}</span>
                  }
                </div>
              </div>

              {/* Name */}
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329" }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: 12.5, color: "#8a9a8e", marginTop: 4 }}>{user?.email}</div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 14 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e8f5ef", color: "#2d7a4f", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 700 }}>✓ Verified</span>
                {resume?.experienceYears && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e3f2fd", color: "#1a6fa0", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 700 }}>{resume.experienceYears} yrs</span>
                )}
                {resume?.ratingAverage > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fefde8", color: "#b8a200", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 700 }}>⭐ {resume.ratingAverage.toFixed(1)}</span>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(26,51,41,0.06)", margin: "18px -24px 16px" }} />

              {/* Mini Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1a3329" }}>{resume?.specializations?.length || 0}</div>
                  <div style={{ fontSize: 10.5, color: "#8a9a8e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Specializations</div>
                </div>
                <div style={{ textAlign: "center", padding: "8px 0", borderLeft: "1px solid rgba(26,51,41,0.06)" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#1a3329" }}>{resume?.certifications?.length || 0}</div>
                  <div style={{ fontSize: 10.5, color: "#8a9a8e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Certifications</div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Card */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(26,51,41,0.06)", padding: "20px 24px", boxShadow: "0 1px 2px rgba(26,51,41,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9a8e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Services</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resume?.offersTypes?.length ? resume.offersTypes.map(o => {
                const meta = OFFER_ICONS[o];
                return meta ? (
                  <div key={o} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f7faf8", borderRadius: 10, border: "1px solid rgba(26,51,41,0.06)" }}>
                    <span style={{ fontSize: 18 }}>{meta.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1a3329" }}>{meta.label}</span>
                  </div>
                ) : null;
              }) : (
                <div style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13 }}>No services added yet</div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(26,51,41,0.06)", padding: "20px 24px", boxShadow: "0 1px 2px rgba(26,51,41,0.04)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9a8e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Stats</div>
            {[
              { label: "Rating",       value: resume?.ratingAverage ? `⭐ ${resume.ratingAverage.toFixed(1)}` : "No ratings yet", icon: "📊" },
              { label: "Member since", value: resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—", icon: "📅" },
              { label: "Last updated", value: resume?.updatedAt  ? new Date(resume.updatedAt).toLocaleDateString("en-GB",  { month: "short", year: "numeric" }) : "—", icon: "🔄" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(26,51,41,0.05)" }}>
                <span style={{ fontSize: 15, opacity: 0.6 }}>{icon}</span>
                <span style={{ fontSize: 12, color: "#8a9a8e", fontWeight: 600, flex: 1 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Details ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* About Section */}
          <div className="anim-up-d1">
            <Section title="About" subtitle="Your bio and background" accent="#2d7a4f">
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <InputField label="Bio" value={form.bio} onChange={v => set("bio", v)} placeholder="Describe your approach and philosophy…" textarea />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <InputField label="Education" value={form.education} onChange={v => set("education", v)} placeholder="e.g. MSc Nutritional Science" />
                    <InputField label="Workplace" value={form.workplace} onChange={v => set("workplace", v)} placeholder="e.g. Wellness Clinic" />
                  </div>
                  <div style={{ maxWidth: 200 }}>
                    <InputField label="Years of Experience" value={form.experienceYears} onChange={v => set("experienceYears", v)} placeholder="e.g. 8" type="number" />
                  </div>
                </div>
              ) : (
                <div>
                  {resume?.bio && (
                    <div style={{ fontSize: 13.5, color: "#3a4a40", lineHeight: 1.7, marginBottom: 16, padding: "12px 0" }}>
                      {resume.bio}
                    </div>
                  )}
                  <InfoRow label="Education"   value={resume?.education}       icon="🎓" />
                  <InfoRow label="Workplace"   value={resume?.workplace}       icon="🏥" />
                  <InfoRow label="Experience"  value={resume?.experienceYears ? `${resume.experienceYears} years` : null} icon="📅" />
                </div>
              )}
            </Section>
          </div>

          {/* Specializations Section */}
          <div className="anim-up-d2">
            <Section title="Specializations" subtitle="Your areas of expertise" accent="#1a6fa0">
              {editing ? (
                <TagInput value={form.specializations} onChange={v => set("specializations", v)} placeholder="e.g. Weight Loss, Diabetes…" />
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0" }}>
                  {resume?.specializations?.length
                    ? resume.specializations.map(s => (
                        <span key={s} style={{ background: "#e8f5ef", color: "#2d6b50", fontSize: 12.5, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(45,107,80,0.15)" }}>✦ {s}</span>
                      ))
                    : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13 }}>No specializations added yet</span>
                  }
                </div>
              )}
            </Section>
          </div>

          {/* Certifications Section */}
          <div className="anim-up-d3">
            <Section title="Certifications" subtitle="Your qualifications and credentials" accent="#b8a200">
              {editing ? (
                <TagInput value={form.certifications} onChange={v => set("certifications", v)} placeholder="e.g. Registered Dietitian…" />
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0" }}>
                  {resume?.certifications?.length
                    ? resume.certifications.map(c => (
                        <span key={c} style={{ background: "#fefde8", color: "#b8a200", fontSize: 12.5, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(184,162,0,0.2)" }}>🎓 {c}</span>
                      ))
                    : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13 }}>No certifications added yet</span>
                  }
                </div>
              )}
            </Section>
          </div>

          {/* Services Section */}
          <div className="anim-up-d4">
            <Section title="Services Offered" subtitle="What you offer to patients" accent="#7a3fa0">
              {editing ? (
                <div style={{ display: "flex", gap: 12 }}>
                  {Object.entries(OFFER_ICONS).map(([val, { icon, label }]) => (
                    <div
                      key={val}
                      onClick={() => set("offersTypes",
                        form.offersTypes.includes(val)
                          ? form.offersTypes.filter(v => v !== val)
                          : [...form.offersTypes, val]
                      )}
                      style={{
                        flex: 1, border: `2px solid ${form.offersTypes.includes(val) ? "#2d6b50" : "rgba(26,51,41,0.1)"}`,
                        borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                        background: form.offersTypes.includes(val) ? "#e8f5ef" : "#f7faf8",
                        textAlign: "center", transition: "all 0.2s",
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3329" }}>{label}</div>
                      {form.offersTypes.includes(val) && (
                        <div style={{ fontSize: 10, color: "#2d6b50", fontWeight: 700, marginTop: 4 }}>✓ Active</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "8px 0" }}>
                  {resume?.offersTypes?.length
                    ? resume.offersTypes.map(o => {
                        const meta = OFFER_ICONS[o];
                        return meta ? (
                          <span key={o} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0f7f4", color: "#1a3329", fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 20, border: "1.5px solid rgba(79,158,122,0.15)" }}>
                            {meta.icon} {meta.label}
                          </span>
                        ) : null;
                      })
                    : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13 }}>No services added yet</span>
                  }
                </div>
              )}
            </Section>
          </div>

        </div>
      </div>
    </div>
  );
}