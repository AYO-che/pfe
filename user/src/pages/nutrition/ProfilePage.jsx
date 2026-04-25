import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.np-card{
  background:#fff;border-radius:20px;padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);margin-bottom:16px;
  animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
.np-card:hover{box-shadow:0 4px 24px rgba(26,51,41,0.1);}

.np-field{
  background:#f7faf8;border-radius:10px;padding:11px 14px;
  border:1.5px solid rgba(79,158,122,0.08);font-size:14px;
  color:#1a3329;font-weight:500;min-height:42px;
  transition:border-color 0.2s;
}
.np-field:hover{border-color:rgba(79,158,122,0.2);}
.np-field.empty{color:#c0d0c8;font-style:italic;}

.np-input{
  width:100%;border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  padding:10px 13px;font-size:13.5px;font-family:'DM Sans',sans-serif;
  color:#1a3329;background:#f7faf8;outline:none;
  transition:all 0.2s;box-sizing:border-box;resize:none;
}
.np-input:focus{border-color:#4f9e7a;background:#fff;box-shadow:0 0 0 3px rgba(79,158,122,0.1);}
.np-input::placeholder{color:#9ab8ae;}

.np-label{
  font-size:11px;font-weight:700;color:#9ab8ae;
  letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;
  display:block;
}

.np-tag{
  background:#e8f5ef;color:#2d6b50;font-size:11px;font-weight:700;
  padding:3px 10px;border-radius:20px;
  border:1px solid rgba(45,107,80,0.15);
}

.np-offer-tag{
  background:#f7faf8;color:#1a3329;font-size:12px;font-weight:600;
  padding:5px 12px;border-radius:20px;
  border:1.5px solid rgba(79,158,122,0.15);
  display:inline-flex;align-items:center;gap:5px;
}

.np-cert-tag{
  background:#f0f7f4;color:#2d6b50;font-size:12px;font-weight:600;
  padding:5px 12px;border-radius:20px;
  border:1px solid rgba(45,107,80,0.12);
}

.np-save-btn{
  background:linear-gradient(135deg,#1a3329,#2d6b50);color:#f5e642;
  border:none;border-radius:10px;padding:10px 22px;font-size:13px;
  font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;
  transition:all 0.22s;display:inline-flex;align-items:center;gap:6px;
}
.np-save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(26,51,41,0.28);}
.np-save-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none;}

.np-edit-btn{
  background:#f7faf8;color:#3d6b57;
  border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  padding:10px 22px;font-size:13px;font-weight:700;
  cursor:pointer;font-family:'DM Sans',sans-serif;
  transition:all 0.22s;
}
.np-edit-btn:hover{background:#eef7f2;}

.np-tags-wrap{
  display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;
  border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  background:#f7faf8;min-height:44px;cursor:text;transition:border-color 0.2s;
}
.np-tags-wrap:focus-within{border-color:#4f9e7a;background:#fff;box-shadow:0 0 0 3px rgba(79,158,122,0.1);}
.np-tag-pill{display:inline-flex;align-items:center;gap:5px;background:#e8f5ef;color:#1a3329;font-size:12px;font-weight:600;padding:3px 10px;border-radius:100px;}
.np-tag-pill button{background:none;border:none;cursor:pointer;color:#2d6b50;font-size:14px;line-height:1;padding:0;}
.np-tag-input{border:none;outline:none;font-family:'DM Sans',sans-serif;font-size:13px;color:#1a3329;background:transparent;min-width:120px;flex:1;}
.np-hint{font-size:11px;color:#9ab8ae;margin-top:4px;}

.np-section-title{
  font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
  color:#1a3329;margin-bottom:18px;
  display:flex;align-items:center;justify-content:space-between;
}
`;

const OFFER_ICONS = {
  PLAN:         { icon: "📋", label: "Meal Plan"    },
  CONSULTATION: { icon: "💬", label: "Consultation" },
};

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
      <div className="np-tags-wrap">
        {value.map(tag => (
          <span key={tag} className="np-tag-pill">
            {tag}
            <button type="button" onClick={() => remove(tag)}>×</button>
          </span>
        ))}
        <input
          className="np-tag-input"
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
      <div className="np-hint">Press Enter or comma to add</div>
    </>
  );
}

export default function NutritionProfilePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [resume,  setResume]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    bio:             "",
    education:       "",
    workplace:       "",
    experienceYears: "",
    specializations: [],
    certifications:  [],
    offersTypes:     [],
  });

  // ── Fetch resume on mount ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_URL}/resume`, { credentials: "include" });
        if (!res.ok) throw new Error();
        const data = await res.json();
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
      } catch {
        setError("Could not load resume.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // ── Save (PATCH) ───────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
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
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
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
    </div>
  );

  return (
    <>
      <style>{CSS}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22, animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>My Profile</div>
        <div style={{ fontSize: 13, color: "#9ab8ae", marginTop: 4 }}>Your public nutritionist profile</div>
      </div>

      {/* Success / error banners */}
      {success && (
        <div style={{ background: "#f0fdf7", border: "1px solid rgba(45,107,80,0.2)", borderRadius: 12, padding: "11px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, color: "#2d6b50", display: "flex", alignItems: "center", gap: 8 }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid rgba(229,62,62,0.2)", borderRadius: 12, padding: "11px 16px", marginBottom: 16, fontSize: 13, color: "#c53030" }}>
          {error}
        </div>
      )}

      {/* ── Hero card ── */}
      <div className="np-card" style={{ animationDelay: "0.05s" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, flexShrink: 0,
              background: "linear-gradient(135deg,#1a3329,#2d6b50)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#f5e642", fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: 22,
            }}>{initials}</div>
            <div>
              <div style={{ fontFamily: "Syne,sans-serif", fontSize: 18, fontWeight: 800, color: "#1a3329" }}>
                Dr. {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 13, color: "#9ab8ae", marginTop: 3 }}>{user?.email}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className="np-tag">✓ Verified Nutritionist</span>
                {resume?.experienceYears && (
                  <span className="np-tag">{resume.experienceYears} yrs experience</span>
                )}
                {resume?.ratingAverage > 0 && (
                  <span className="np-tag">⭐ {resume.ratingAverage.toFixed(1)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Edit / Save buttons */}
          {!editing ? (
            <button className="np-edit-btn" onClick={() => setEditing(true)}>✏️ Edit</button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="np-edit-btn" onClick={() => { setEditing(false); setError(""); }}>Cancel</button>
              <button className="np-save-btn" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "✓ Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Bio & Workplace ── */}
      <div className="np-card" style={{ animationDelay: "0.10s" }}>
        <div className="np-section-title">About</div>
        <div style={{ marginBottom: 16 }}>
          <div className="np-label">Bio</div>
          {editing
            ? <textarea className="np-input" rows={4} value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Describe your approach and philosophy…" />
            : <div className={`np-field ${!resume?.bio ? "empty" : ""}`} style={{ lineHeight: 1.6 }}>{resume?.bio || "No bio added yet"}</div>
          }
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <div className="np-label">Education</div>
            {editing
              ? <input className="np-input" value={form.education} onChange={e => set("education", e.target.value)} placeholder="e.g. MSc Nutritional Science" />
              : <div className={`np-field ${!resume?.education ? "empty" : ""}`}>{resume?.education || "—"}</div>
            }
          </div>
          <div>
            <div className="np-label">Workplace</div>
            {editing
              ? <input className="np-input" value={form.workplace} onChange={e => set("workplace", e.target.value)} placeholder="e.g. Wellness Clinic" />
              : <div className={`np-field ${!resume?.workplace ? "empty" : ""}`}>{resume?.workplace || "—"}</div>
            }
          </div>
          <div>
            <div className="np-label">Years of Experience</div>
            {editing
              ? <input className="np-input" type="number" min="0" max="50" value={form.experienceYears} onChange={e => set("experienceYears", e.target.value)} placeholder="e.g. 8" />
              : <div className={`np-field ${!resume?.experienceYears ? "empty" : ""}`}>{resume?.experienceYears ? `${resume.experienceYears} years` : "—"}</div>
            }
          </div>
        </div>
      </div>

      {/* ── Specializations ── */}
      <div className="np-card" style={{ animationDelay: "0.15s" }}>
        <div className="np-section-title">Specializations</div>
        {editing
          ? <TagInput value={form.specializations} onChange={v => set("specializations", v)} placeholder="e.g. Weight Loss…" />
          : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {resume?.specializations?.length
                ? resume.specializations.map(s => <span key={s} className="np-cert-tag">✦ {s}</span>)
                : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13 }}>No specializations added yet</span>
              }
            </div>
          )
        }
      </div>

      {/* ── Certifications ── */}
      <div className="np-card" style={{ animationDelay: "0.20s" }}>
        <div className="np-section-title">Certifications</div>
        {editing
          ? <TagInput value={form.certifications} onChange={v => set("certifications", v)} placeholder="e.g. Registered Dietitian…" />
          : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {resume?.certifications?.length
                ? resume.certifications.map(c => <span key={c} className="np-cert-tag">🎓 {c}</span>)
                : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13 }}>No certifications added yet</span>
              }
            </div>
          )
        }
      </div>

      {/* ── Offer Types ── */}
      <div className="np-card" style={{ animationDelay: "0.25s" }}>
        <div className="np-section-title">Services Offered</div>
        {editing ? (
          <div style={{ display: "flex", gap: 12 }}>
            {Object.entries(OFFER_ICONS).map(([val, { icon, label }]) => (
              <div
                key={val}
                onClick={() => {
                  set("offersTypes",
                    form.offersTypes.includes(val)
                      ? form.offersTypes.filter(v => v !== val)
                      : [...form.offersTypes, val]
                  );
                }}
                style={{
                  flex: 1, border: `2px solid ${form.offersTypes.includes(val) ? "#2d6b50" : "rgba(79,158,122,0.15)"}`,
                  borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                  background: form.offersTypes.includes(val) ? "#e8f5ef" : "#f7faf8",
                  textAlign: "center", transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3329" }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {resume?.offersTypes?.length
              ? resume.offersTypes.map(o => {
                  const meta = OFFER_ICONS[o];
                  return meta
                    ? <span key={o} className="np-offer-tag">{meta.icon} {meta.label}</span>
                    : null;
                })
              : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13 }}>No services added yet</span>
            }
          </div>
        )}
      </div>

      {/* ── Stats (read only) ── */}
      <div className="np-card" style={{ animationDelay: "0.30s" }}>
        <div className="np-section-title">Stats</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {[
            { label: "Rating",      value: resume?.ratingAverage ? `⭐ ${resume.ratingAverage.toFixed(1)}` : "No ratings yet" },
            { label: "Member since", value: resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—" },
            { label: "Last updated", value: resume?.updatedAt  ? new Date(resume.updatedAt).toLocaleDateString("en-GB",  { month: "short", year: "numeric" }) : "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "#f7faf8", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(79,158,122,0.08)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ab8ae", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3329" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}