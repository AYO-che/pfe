import { useState, useEffect, useRef } from "react";

const API_URL = "https://chrysalise-server.onrender.com";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.cp-card{
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top: 1.5px solid rgba(168,224,44,0.85);
  border-left: 1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right: 1.5px solid rgba(0,168,84,0.75);
  border-radius: 22px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.1),inset 0 0 10px rgba(255,255,255,0.5);
  margin-bottom: 16px;
  animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  transition: all 0.3s;
}
.cp-card:hover{
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 34px rgba(15,89,47,0.15),inset 0 0 16px rgba(255,255,255,0.6);
}

.cp-label{
  font-size: 10px; font-weight: 700; color: #0b6630;
  letter-spacing: 1.2px; text-transform: uppercase;
  margin-bottom: 8px; display: block;
}

.cp-input{
  width: 100%; border: 1.5px solid rgba(168,224,44,0.4);
  border-radius: 14px; padding: 12px 16px;
  font-size: 14px; font-family: 'Inter',sans-serif;
  color: #1a3329; background: rgba(255,255,255,0.4);
  outline: none; transition: all 0.2s; box-sizing: border-box;
}
.cp-input:focus{
  border-color: rgba(0,168,84,0.6);
  background: rgba(255,255,255,0.6);
  box-shadow: 0 0 0 4px rgba(168,224,44,0.12);
}
.cp-input::placeholder{color:rgba(11,102,48,0.35);}

.cp-textarea{
  width: 100%; border: 1.5px solid rgba(168,224,44,0.4);
  border-radius: 14px; padding: 12px 16px;
  font-size: 14px; font-family: 'Inter',sans-serif;
  color: #1a3329; background: rgba(255,255,255,0.4);
  outline: none; resize: vertical; min-height: 180px;
  line-height: 1.7; transition: all 0.2s; box-sizing: border-box;
}
.cp-textarea:focus{
  border-color: rgba(0,168,84,0.6);
  background: rgba(255,255,255,0.6);
  box-shadow: 0 0 0 4px rgba(168,224,44,0.12);
}
.cp-textarea::placeholder{color:rgba(11,102,48,0.35);}

.cp-field{margin-bottom:18px;}

.cp-save-btn{
  background: linear-gradient(135deg,#0b6630,#2d6b50);
  color: #f5e642; border: none; border-radius: 20px;
  padding: 11px 28px; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: 'Inter',sans-serif;
  transition: all 0.22s; display: inline-flex;
  align-items: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.cp-save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(11,102,48,0.35);}
.cp-save-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}

.cp-ghost-btn{
  background: rgba(255,255,255,0.5); color: #1a3329;
  border: 1.5px solid rgba(168,224,44,0.4); border-radius: 20px;
  padding: 11px 22px; font-size: 14px; font-weight: 700;
  cursor: pointer; font-family: 'Inter',sans-serif; transition: all 0.22s;
}
.cp-ghost-btn:hover{background:rgba(255,255,255,0.7);}

.cp-post-row{
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 14px;
  padding: 16px; background: rgba(255,255,255,0.25);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-radius: 16px; border: 1px solid rgba(168,224,44,0.2);
  margin-bottom: 10px; transition: all 0.2s; flex-wrap: wrap;
}
.cp-post-row:hover{background:rgba(255,255,255,0.4);box-shadow:0 4px 16px rgba(15,89,47,0.1);}

.cp-status{
  font-size: 11px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px;
  display: inline-block; white-space: nowrap;
}
.cp-status.PENDING  {background:rgba(254,252,232,0.8);color:#854d0e;border:1px solid rgba(133,77,14,0.15);}
.cp-status.APPROVED {background:rgba(232,245,239,0.8);color:#0b6630;border:1px solid rgba(0,168,84,0.2);}
.cp-status.REJECTED {background:rgba(255,245,245,0.8);color:#c53030;border:1px solid rgba(197,48,48,0.15);}

.cp-del-btn{
  background: rgba(255,245,245,0.6); color: #c53030;
  border: 1px solid rgba(197,48,48,0.2); border-radius: 12px;
  padding: 6px 14px; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'Inter',sans-serif;
  transition: all 0.2s; white-space: nowrap;
}
.cp-del-btn:hover{background:rgba(254,226,226,0.8);}

.cp-char{font-size:11px;color:rgba(11,102,48,0.4);margin-top:5px;text-align:right;}

.cp-image-upload{
  border: 2px dashed rgba(168,224,44,0.4);
  border-radius: 18px; padding: 32px 24px;
  text-align: center; cursor: pointer;
  transition: all 0.25s; background: rgba(255,255,255,0.2);
  position: relative; overflow: hidden;
}
.cp-image-upload:hover{
  border-color: rgba(0,168,84,0.5);
  background: rgba(255,255,255,0.35);
  box-shadow: 0 4px 20px rgba(15,89,47,0.08);
}
.cp-image-upload.has-image{border-style:solid;border-color:rgba(168,224,44,0.6);padding:0;}
.cp-image-upload-icon{font-size:36px;margin-bottom:10px;}
.cp-image-upload-text{font-size:13px;font-weight:600;color:#0b6630;margin-bottom:4px;}
.cp-image-upload-hint{font-size:11px;color:rgba(11,102,48,0.4);}
.cp-image-preview{width:100%;max-height:280px;object-fit:cover;border-radius:16px;display:block;}
.cp-image-remove{
  position:absolute;top:10px;right:10px;
  background:rgba(255,255,255,0.9);backdrop-filter:blur(8px);
  border:none;border-radius:10px;padding:6px 10px;
  font-size:12px;font-weight:700;color:#c53030;cursor:pointer;
  font-family:'Inter',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.1);
  transition:all 0.15s;
}
.cp-image-remove:hover{background:#fff;transform:scale(1.05);}

.cp-header-glass{
  background: rgba(255,255,255,0.18); backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top: 1.5px solid rgba(168,224,44,0.85);
  border-left: 1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right: 1.5px solid rgba(0,168,84,0.75);
  border-radius: 22px; padding: 20px 24px; margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.1),inset 0 0 10px rgba(255,255,255,0.5);
  animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.cp-header-icon{
  width:48px;height:48px;border-radius:14px;
  background:linear-gradient(135deg,#0b6630,#2d6b50);
  display:flex;align-items:center;justify-content:center;
  font-size:22px;box-shadow:0 4px 16px rgba(11,102,48,0.25);flex-shrink:0;
}
.cp-header-text h1{font-family:'Inter',sans-serif;font-size:20px;font-weight:800;color:#1a3329;margin:0 0 3px;}
.cp-header-text p{font-size:12px;color:rgba(11,102,48,0.55);margin:0;}

.cp-tabs-glass{
  display:flex;gap:8px;margin-bottom:20px;
  background:rgba(255,255,255,0.18);backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  border-top:1.5px solid rgba(168,224,44,0.6);
  border-left:1.5px solid rgba(168,224,44,0.6);
  border-bottom:1.5px solid rgba(0,168,84,0.5);
  border-right:1.5px solid rgba(0,168,84,0.5);
  border-radius:18px;padding:6px;width:fit-content;
  box-shadow:0 4px 20px rgba(15,89,47,0.08),inset 0 0 8px rgba(255,255,255,0.4);
  animation:fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
}
.cp-tab-btn{
  padding:10px 20px;border-radius:14px;border:none;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;transition:all 0.2s;background:transparent;color:#1a3329;
}
.cp-tab-btn.active{background:linear-gradient(135deg,#0b6630,#2d6b50);color:#f5e642;box-shadow:0 4px 14px rgba(11,102,48,0.3);}
.cp-tab-btn:not(.active):hover{background:rgba(255,255,255,0.4);}

.cp-alert-success{
  background:rgba(232,245,239,0.6);backdrop-filter:blur(10px);
  border:1px solid rgba(0,168,84,0.2);border-radius:14px;
  padding:12px 18px;margin-bottom:16px;font-size:13px;font-weight:600;color:#0b6630;
  animation:fadeUp 0.3s ease both;
}
.cp-alert-error{
  background:rgba(255,245,245,0.6);backdrop-filter:blur(10px);
  border:1px solid rgba(197,48,48,0.2);border-radius:14px;
  padding:12px 18px;margin-bottom:16px;font-size:13px;color:#c53030;
  animation:fadeUp 0.3s ease both; word-break: break-word;
}

.cp-pending-notice{
  background:rgba(254,252,232,0.5);backdrop-filter:blur(10px);
  border:1px solid rgba(212,194,0,0.2);border-radius:14px;
  padding:12px 18px;margin-bottom:20px;font-size:12.5px;color:#854d0e;
  display:flex;align-items:center;gap:10px;
}

.cp-empty-glass{text-align:center;padding:40px 0;}
.cp-empty-glass .icon{font-size:38px;margin-bottom:12px;}
.cp-empty-glass h3{font-family:'Inter',sans-serif;font-size:15px;font-weight:800;color:#1a3329;margin-bottom:6px;}
.cp-empty-glass p{font-size:13px;color:rgba(11,102,48,0.45);margin-bottom:16px;}

.cp-type-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:4px;}
.cp-type-card{
  border:1.5px solid rgba(168,224,44,0.3);border-radius:14px;
  padding:14px 10px;text-align:center;cursor:pointer;
  background:rgba(255,255,255,0.3);transition:all 0.2s;
}
.cp-type-card:hover{background:rgba(255,255,255,0.5);border-color:rgba(0,168,84,0.4);}
.cp-type-card.selected{
  background:rgba(11,102,48,0.08);border-color:#0b6630;
  box-shadow:0 0 0 3px rgba(11,102,48,0.08);
}
.cp-type-card .icon{font-size:22px;margin-bottom:6px;}
.cp-type-card .label{font-size:12px;font-weight:700;color:#1a3329;}
.cp-type-card .desc{font-size:10.5px;color:rgba(11,102,48,0.5);margin-top:2px;}

.cp-type-badge{
  font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;
  background:rgba(11,102,48,0.08);color:#0b6630;
  border:1px solid rgba(11,102,48,0.12);display:inline-block;margin-bottom:4px;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .cp-header-glass { padding: 16px 18px; gap: 12px; }
  .cp-header-text h1 { font-size: 17px; }
  .cp-card { padding: 18px 16px; }
  .cp-type-grid { grid-template-columns: 1fr; gap: 8px; }
  .cp-type-card { display: flex; align-items: center; gap: 12px; text-align: left; padding: 12px 14px; }
  .cp-type-card .icon { font-size: 20px; margin-bottom: 0; flex-shrink: 0; }
  .cp-type-card .label { margin-bottom: 1px; }
  .cp-type-card .desc { display: block; }
  .cp-save-btn, .cp-ghost-btn { width: 100%; justify-content: center; }
  .cp-btn-row { flex-direction: column; }
  .cp-tabs-glass { width: 100%; justify-content: stretch; }
  .cp-tab-btn { flex: 1; text-align: center; }
  .cp-post-row { flex-direction: column; gap: 10px; }
  .cp-post-row > div:last-child { align-self: flex-start; }
}
`;

const TYPE_OPTIONS = [
  { value: "EXPERIENCE",   icon: "✨", label: "Experience",     desc: "Share your journey"  },
  { value: "RECIPE",       icon: "🥗", label: "Recipe",         desc: "Healthy food ideas"  },
  { value: "BEFORE_AFTER", icon: "📸", label: "Before & After", desc: "Show your progress"  },
];

const TYPE_LABELS = {
  EXPERIENCE:   "✨ Experience",
  RECIPE:       "🥗 Recipe",
  BEFORE_AFTER: "📸 Before & After",
};

export default function CommunityPostPage() {
  const fileInputRef = useRef(null);
  const [fileObj, setFileObj] = useState(null); // keep the raw File for FormData

  const [tab,     setTab]     = useState("create");
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title:   "",
    content: "",
    type:    "EXPERIENCE",
    image:   null, // base64 preview only
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    if (file.size > 5 * 1024 * 1024)    { setError("Image must be under 5MB.");      return; }
    setFileObj(file);
    const reader = new FileReader();
    reader.onloadend = () => set("image", reader.result);
    reader.readAsDataURL(file);
    setError("");
  };

  const removeImage = () => {
    set("image", null);
    setFileObj(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setForm({ title: "", content: "", type: "EXPERIENCE", image: null });
    setFileObj(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError(""); setSuccess("");
  };

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res  = await authFetch(`${API_URL}/community/mine`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      setPosts(data.posts ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "posts") fetchMyPosts();
  }, [tab]);

const submit = async () => {
  setError(""); setSuccess("");

  if (!form.title.trim())   { setError("Title is required.");   return; }
  if (!form.content.trim()) { setError("Content is required."); return; }

  setSaving(true);

  try {
    const res = await authFetch(`${API_URL}/community`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:   form.title.trim(),
        content: form.content.trim(),
        type:    form.type,
        images:  form.image ? [form.image] : [],  // base64 string, same as blog
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : { message: `Server error ${res.status}` };

    if (!res.ok) throw new Error(data.message || `Failed (${res.status})`);

    setSuccess("Post submitted for review! It will appear once approved by an admin.");
    resetForm();
    setTimeout(() => setSuccess(""), 6000);
  } catch (err) {
    setError(err.message || "Something went wrong. Please try again.");
  } finally {
    setSaving(false);
  }
};

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await authFetch(`${API_URL}/community/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error();
      setPosts(p => p.filter(post => post.id !== id));
    } catch {
      alert("Could not delete post.");
    }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <div className="cp-header-glass">
        <div className="cp-header-icon">🌿</div>
        <div className="cp-header-text">
          <h1>Community Posts</h1>
          <p>Share your recipes, experiences &amp; progress with others</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="cp-tabs-glass">
        {[
          { key: "create", label: "✍️ New Post" },
          { key: "posts",  label: "📄 My Posts"  },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(""); setSuccess(""); }}
            className={`cp-tab-btn ${tab === t.key ? "active" : ""}`}
          >{t.label}</button>
        ))}
      </div>

      {/* ── CREATE TAB ── */}
      {tab === "create" && (
        <>
          {success && <div className="cp-alert-success">✓ {success}</div>}
          {error   && <div className="cp-alert-error">⚠️ {error}</div>}

          <div className="cp-card" style={{ animationDelay:"0.08s" }}>
            <div style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:800, color:"#1a3329", marginBottom:20 }}>
              New Community Post
            </div>

            {/* Type selector */}
            <div className="cp-field">
              <label className="cp-label">Post Type *</label>
              <div className="cp-type-grid">
                {TYPE_OPTIONS.map(t => (
                  <div
                    key={t.value}
                    className={`cp-type-card ${form.type === t.value ? "selected" : ""}`}
                    onClick={() => set("type", t.value)}
                  >
                    <div className="icon">{t.icon}</div>
                    <div>
                      <div className="label">{t.label}</div>
                      <div className="desc">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image upload */}
            <div className="cp-field">
              <label className="cp-label">
                {form.type === "BEFORE_AFTER" ? "Before & After Photo *" : "Photo (optional)"}
              </label>
              <div
                className={`cp-image-upload ${form.image ? "has-image" : ""}`}
                onClick={() => !form.image && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display:"none" }}
                  onChange={handleImageChange}
                />
                {form.image ? (
                  <>
                    <img src={form.image} alt="Preview" className="cp-image-preview" />
                    <button className="cp-image-remove" onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                      ✕ Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div className="cp-image-upload-icon">📷</div>
                    <div className="cp-image-upload-text">Click to upload a photo</div>
                    <div className="cp-image-upload-hint">JPG, PNG or GIF · Max 5MB</div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="cp-field">
              <label className="cp-label">Title *</label>
              <input
                className="cp-input"
                placeholder={
                  form.type === "RECIPE"       ? "e.g. My High-Protein Avocado Bowl"       :
                  form.type === "BEFORE_AFTER" ? "e.g. 3 Months Transformation Story"       :
                                                 "e.g. How nutrition changed my energy levels"
                }
                value={form.title}
                onChange={e => set("title", e.target.value)}
                maxLength={120}
              />
              <div className="cp-char">{form.title.length}/120</div>
            </div>

            {/* Content */}
            <div className="cp-field">
              <label className="cp-label">
                {form.type === "RECIPE"       ? "Recipe & Instructions *" :
                 form.type === "BEFORE_AFTER" ? "Your Story *"             :
                                                "Your Experience *"}
              </label>
              <textarea
                className="cp-textarea"
                placeholder={
                  form.type === "RECIPE"
                    ? "Share the ingredients and steps. What makes this recipe special?"
                    : form.type === "BEFORE_AFTER"
                    ? "Tell your story. What changed? What helped you the most?"
                    : "Share what you've learned, how you feel, what surprised you…"
                }
                value={form.content}
                onChange={e => set("content", e.target.value)}
              />
              <div className="cp-char">{form.content.length} characters</div>
            </div>

            <div className="cp-pending-notice">
              ⏳ Posts are reviewed by an admin before being published to the community.
            </div>

            <div className="cp-btn-row" style={{ display:"flex", gap:10 }}>
              <button
                className="cp-save-btn"
                onClick={submit}
                disabled={saving}
              >
                {saving
                  ? <><span style={{ width:14,height:14,border:"2px solid rgba(245,230,66,0.3)",borderTopColor:"#f5e642",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }} /> Submitting…</>
                  : "Submit for Review →"
                }
              </button>
              <button className="cp-ghost-btn" onClick={resetForm}>
                Clear
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── MY POSTS TAB ── */}
      {tab === "posts" && (
        <div className="cp-card" style={{ animationDelay:"0.08s" }}>
          <div style={{ fontFamily:"Syne,sans-serif", fontSize:15, fontWeight:800, color:"#1a3329", marginBottom:20 }}>
            My Posts
          </div>

          {error && <div className="cp-alert-error">⚠️ {error}</div>}

          {loading ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:120 }}>
              <div style={{ width:28, height:28, border:"3px solid rgba(79,158,122,0.2)", borderTop:"3px solid #2d6b50", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            </div>
          ) : posts.length === 0 ? (
            <div className="cp-empty-glass">
              <div className="icon">🌿</div>
              <h3>No posts yet</h3>
              <p>Share your first recipe, experience, or transformation!</p>
              <button className="cp-save-btn" onClick={() => setTab("create")}>Write a Post →</button>
            </div>
          ) : (
            posts.map(p => (
              <div key={p.id} className="cp-post-row">
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="cp-type-badge">{TYPE_LABELS[p.type] ?? p.type}</div>
                  <div style={{ fontFamily:"Syne,sans-serif", fontSize:14, fontWeight:800, color:"#1a3329", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize:12, color:"rgba(11,102,48,0.45)", marginBottom:8 }}>
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                    {p.status === "APPROVED" && " · Published"}
                  </div>
                  <span className={`cp-status ${p.status}`}>{p.status}</span>
                  {p.status === "REJECTED" && (
                    <div style={{ fontSize:11.5, color:"#c53030", marginTop:6 }}>
                      ❌ Not approved — please review community guidelines before resubmitting.
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button className="cp-del-btn" onClick={() => deletePost(p.id)}>🗑 Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
