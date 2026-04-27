import { useState, useRef } from "react";
import { useAuth } from "../../context/Authcontext";
import { CSS, MOCK_PLAN, Field, SectionTitle } from "./Shared";

export default function ProfileInfoPage() {
  const { user } = useAuth();
const isFirstTime = !user?.profile;
 const [form, setForm] = useState({
  firstName:         user?.firstName               || "",
  lastName:          user?.lastName                || "",
  dateOfBirth:       user?.profile?.dateOfBirth
    ? new Date(user.profile.dateOfBirth).toISOString().split("T")[0]
    : "",
  gender:            user?.profile?.gender         || "",
  weight:            user?.profile?.weight         || "",
  height:            user?.profile?.height         || "",
  goal:              user?.profile?.goal           || "",
  activityLevel:     user?.profile?.activityLevel  || "",
  medicalConditions: user?.profile?.medicalConditions?.join(", ") || "",
  allergies:         user?.profile?.allergies?.join(", ")         || "",
});

  const [avatar, setAvatar]   = useState(user?.avatar || null);
  const [editing, setEditing] = useState(isFirstTime);
  const [saved, setSaved]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const avatarRef             = useRef(null);

  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null;

  const bmiCat = !bmi ? null
    : bmi < 18.5 ? { label: "Underweight", color: "#1a6fa0", pct: 12  }
    : bmi < 25   ? { label: "Normal",      color: "#2d7a4f", pct: 38  }
    : bmi < 30   ? { label: "Overweight",  color: "#c07a00", pct: 63  }
    :              { label: "Obese",        color: "#c0392b", pct: 86  };

  const fullName       = `${form.firstName} ${form.lastName}`.trim();
  const profileComplete = form.firstName && form.lastName && form.weight && form.height && form.goal;
  const plan            = user?.plan || MOCK_PLAN;

  const handleAvatar = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => setAvatar(e.target.result);
    r.readAsDataURL(file);
  };
const handleSave = async () => {
  setSaving(true);
  try {
    const isNew = !user?.profile;

    // Save name to user
    await fetch(`http://localhost:5000/users/${user.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName:  form.lastName,
      }),
    });

    // Save profile health data
    const res = await fetch("http://localhost:5000/profile", {
      method:      isNew ? "POST" : "PATCH",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body: JSON.stringify({
        dateOfBirth:       form.dateOfBirth || null,
        gender:            form.gender      || null,
        weight:            form.weight      ? Number(form.weight) : null,
        height:            form.height      ? Number(form.height) : null,
        goal:              form.goal        || null,
        activityLevel:     form.activityLevel || null,
        medicalConditions: form.medicalConditions
          ? form.medicalConditions.split(",").map(s => s.trim()).filter(Boolean)
          : [],
        allergies: form.allergies
          ? form.allergies.split(",").map(s => s.trim()).filter(Boolean)
          : [],
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || "Save failed");
    }

    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3500);
  } catch (err) {
    alert(err.message);
  } finally {
    setSaving(false);
  }
};
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{CSS}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 100%)", padding: "36px 28px 96px", borderRadius: 24, marginBottom: -56, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.05) 1.5px,transparent 1.5px)", backgroundSize: "26px 26px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>
            {isFirstTime ? "Welcome aboard 🌱" : `Member since ${user?.joinDate || "2026"}`}
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            {isFirstTime ? "Let's set up your profile 👋" : `Hello, ${form.firstName || "there"} 👋`}
          </div>
          <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.48)", marginTop: 7 }}>
            {isFirstTime ? "Fill in your details to personalise your nutrition journey." : "Manage your personal info and health details."}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 72, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Top Card */}
        <div className="pr-card pr-fade-up" style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 22px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 78, height: 78, borderRadius: "50%", background: avatar ? "transparent" : "linear-gradient(135deg,#1a3329,#2d6b50)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 4px 16px rgba(26,51,41,0.16)", border: "3px solid rgba(245,230,66,0.28)" }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f5e642" }}>{form.firstName?.[0] || "?"}</span>}
            </div>
            <button onClick={() => avatarRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#f5e642", border: "2px solid #fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a3329" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatar(e.target.files[0])} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#1a3329" }}>
              {fullName || <span style={{ color: "#9ab8ae", fontStyle: "italic" }}>Complete your profile</span>}
            </div>
            {!isFirstTime && (
              <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}>
                {form.gender       && <span style={{ background: "#e8f5e9", color: "#2d7a4f",  borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{form.gender}</span>}
                {form.age          && <span style={{ background: "#e3f2fd", color: "#1a6fa0",  borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>Age {form.age}</span>}
                {form.goal         && <span style={{ background: "#fefde8", color: "#b8a200",  borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{form.goal}</span>}
                {form.activityLevel && <span style={{ background: "#f3e8fd", color: "#7a3fa0", borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>{form.activityLevel}</span>}
                {bmiCat            && <span style={{ background: "#f7faf8", color: bmiCat.color, borderRadius: 999, padding: "2px 10px", fontSize: 11.5, fontWeight: 600 }}>BMI {bmi} · {bmiCat.label}</span>}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {editing ? (
              <>
                {!isFirstTime && (
                  <button onClick={() => setEditing(false)} style={{ background: "transparent", border: "1.5px solid rgba(79,158,122,0.22)", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: "#5a7a6e", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
                )}
                <button className="pr-save-btn" onClick={handleSave} disabled={saving}>
                  {saving
                    ? <><span style={{ width: 12, height: 12, border: "2px solid rgba(245,230,66,0.4)", borderTopColor: "#f5e642", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Saving…</>
                    : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Save Profile</>}
                </button>
              </>
            ) : (
              <button className="pr-save-btn" onClick={() => setEditing(true)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Success banner */}
        {saved && (
          <div style={{ background: "#e8f5e9", border: "1px solid rgba(45,122,79,0.18)", borderRadius: 12, padding: "12px 16px", fontSize: 13.5, fontWeight: 600, color: "#2d7a4f", display: "flex", alignItems: "center", gap: 8, animation: "fadeIn 0.3s ease" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Profile saved successfully!
          </div>
        )}

        {/* First-time banner */}
        {isFirstTime && editing && (
          <div style={{ background: "linear-gradient(135deg,#f0fdf7,#e8f5f0)", border: "1.5px dashed rgba(79,158,122,0.35)", borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14, animation: "slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#d4eddf", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🌟</div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a5e3a", marginBottom: 2 }}>Welcome! Let's personalise your experience.</div>
              <div style={{ fontSize: 12.5, color: "#4a8a68", lineHeight: 1.6 }}>Fill in your details below and tap <strong>Save Profile</strong>.</div>
            </div>
          </div>
        )}

        {/* Form Grid */}
        <div className="pr-slide-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>

          {/* Personal Info */}
          <div className="pr-card">
            <SectionTitle bg="#e8f5e9" title="Personal Info" icon="👤" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="First Name" val={form.firstName} editing={editing} field="firstName" setForm={setForm} placeholder=" Fname" />
                <Field label="Last Name"  val={form.lastName}  editing={editing} field="lastName"  setForm={setForm} placeholder="Lname" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Age"    val={form.age}    editing={editing} field="age"    setForm={setForm} type="number" placeholder="age" />
                <Field label="Gender" val={form.gender} editing={editing} field="gender" setForm={setForm} options={["Female", "Male"]} />
              <Field label="Date of Birth" val={form.dateOfBirth} editing={editing} field="dateOfBirth" setForm={setForm} type="date" />
              
              </div>

            </div>
          </div>

          {/* Health Details */}
          <div className="pr-card">
            <SectionTitle bg="#e3f2fd" title="Health Details" icon="❤️" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Weight (kg)" val={form.weight} editing={editing} field="weight" setForm={setForm} type="number" placeholder="62" />
                <Field label="Height (cm)" val={form.height} editing={editing} field="height" setForm={setForm} type="number" placeholder="165" />
              </div>
              <Field label="Medical Conditions" val={form.medicalConditions} editing={editing} field="medicalConditions" setForm={setForm} placeholder="None" />
              <Field label="Allergies"           val={form.allergies}         editing={editing} field="allergies"         setForm={setForm} placeholder="e.g. Lactose intolerance" />
            </div>
          </div>

          {/* Goals & Activity */}
          <div className="pr-card">
            <SectionTitle bg="#fefde8" title="Goals & Activity" icon="🎯" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="My Goal" val={form.goal} editing={editing} field="goal" setForm={setForm}
                options={["Weight Loss", "Weight Gain", "Muscle Gain", "Maintain Weight", "Improve Health", "Manage Diabetes", "Other"]} />
              <Field label="Activity Level" val={form.activityLevel} editing={editing} field="activityLevel" setForm={setForm}
                options={["Sedentary", "Light", "Moderate", "Active", "Very Active"]} />
            </div>
          </div>

          {/* BMI */}
          {bmi && bmiCat && (
            <div className="pr-card">
              <SectionTitle bg="#f3e8fd" title="BMI Overview" icon="🔬" />
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 44, fontWeight: 800, color: bmiCat.color, lineHeight: 1, animation: "spinIn 0.5s ease" }}>{bmi}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: bmiCat.color, marginTop: 4 }}>{bmiCat.label}</div>
                </div>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <div style={{ height: 10, background: "linear-gradient(90deg,#1a6fa0,#2d7a4f,#c07a00,#c0392b)", borderRadius: 999, position: "relative", marginBottom: 8 }}>
                    <div style={{ position: "absolute", top: "50%", left: `${bmiCat.pct}%`, transform: "translate(-50%,-50%)", width: 18, height: 18, borderRadius: "50%", background: "#fff", border: `3px solid ${bmiCat.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ab8ae", fontWeight: 600 }}>
                    <span>&lt;18.5</span><span>18.5–25</span><span>25–30</span><span>&gt;30</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Incomplete warning */}
          {!profileComplete && !editing && (
            <div style={{ gridColumn: "1/-1", background: "#fefde8", border: "1px solid rgba(184,162,0,0.2)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#8a7200", marginBottom: 2 }}>Profile incomplete</div>
                <div style={{ fontSize: 12.5, color: "#b8a200" }}>Add your weight, height and goal to get personalised recommendations.</div>
              </div>
              <button onClick={() => setEditing(true)} style={{ background: "#b8a200", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>Complete →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}