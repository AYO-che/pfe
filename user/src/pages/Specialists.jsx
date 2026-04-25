import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/Authcontext";

function getAvailableDates() {
  const dates = [];
  let d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 14) {
    if (d.getDay() !== 5) dates.push(new Date(d).toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function generateSlots(dateStr, bookedKeys = []) {
  if (new Date(dateStr).getDay() === 5) return [];
  const slots = [];
  for (let h = 8; h < 18; h++) {
    const label = `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "0")}:00`;
    const key = `${dateStr}_${h}`;
    slots.push({ label, key, booked: bookedKeys.includes(key) });
  }
  return slots;
}

function Stars({ count, interactive = false, onSet }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className="sp-star"
          style={{ cursor: interactive ? "pointer" : "default", opacity: (interactive ? (hov || count) : count) >= i ? 1 : 0.25, transition: "opacity 0.15s" }}
          onMouseEnter={() => interactive && setHov(i)} onMouseLeave={() => interactive && setHov(0)}
          onClick={() => interactive && onSet && onSet(i)}>★</span>
      ))}
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function BookingModal({ sp, onClose, onConfirm }) {
  const DATES = getAvailableDates();
  const [selDate, setSelDate] = useState(DATES[0]);
  const [selSlot, setSelSlot] = useState(null);
  const [bookedKeys] = useState([]);
  const slots = generateSlots(selDate, bookedKeys);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="book-modal" onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", padding: "20px 22px", borderRadius: "28px 28px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
          <img src={sp.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"} alt={sp.firstName} style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff" }}>{sp.firstName} {sp.lastName}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{sp.resume?.bio?.slice(0, 50)}...</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ padding: "22px" }}>
          <div style={{ background: "linear-gradient(135deg,#fefde8,#fdf6c0)", border: "1px solid rgba(245,230,66,0.4)", borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>1-hour Consultation</div>
              <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 2 }}>Online video session · Mon–Thu, Sat–Sun</div>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#b8a200" }}>200 000 DZD</div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13.5, fontWeight: 800, color: "#1a3329", marginBottom: 10 }}>Select Date</div>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
              {DATES.map(d => (
                <button key={d} className={`date-btn ${selDate === d ? "active" : ""}`} onClick={() => { setSelDate(d); setSelSlot(null); }}>
                  {formatDate(d)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13.5, fontWeight: 800, color: "#1a3329" }}>Select Time</div>
              <div style={{ fontSize: 11.5, color: "#5a7a6e" }}>08:00 – 18:00 · No Fridays</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {slots.map(slot => (
                <button key={slot.key} className={`slot-btn ${slot.booked ? "booked" : ""} ${selSlot?.key === slot.key ? "active" : ""}`}
                  onClick={() => !slot.booked && setSelSlot(slot)}>
                  {slot.label}
                  {slot.booked && <span style={{ display: "block", fontSize: 10, marginTop: 2 }}>Booked</span>}
                </button>
              ))}
            </div>
          </div>

          {selSlot && (
            <div style={{ background: "#e8f5e9", border: "1px solid rgba(45,122,79,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>{formatDate(selDate)} · {selSlot.label}</div>
                <div style={{ fontSize: 11.5, color: "#5a7a6e", marginTop: 1 }}>1 hour · 200 000 DZD</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px 0", border: "1.5px solid rgba(79,158,122,0.25)", borderRadius: 14, background: "transparent", fontSize: 14, fontWeight: 600, color: "#5a7a6e", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
            <button onClick={() => selSlot && onConfirm({ sp, date: selDate, slot: selSlot })} disabled={!selSlot}
              style={{ flex: 2, padding: "12px 0", border: "none", borderRadius: 14, background: selSlot ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "#e0e0e0", color: selSlot ? "#f5e642" : "#aaa", fontSize: 14, fontWeight: 700, cursor: selSlot ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", transition: "all 0.22s" }}>
              Proceed to Payment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecialistModal({ sp, onClose, onBook }) {
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [userName, setUserName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [comments, setComments] = useState(sp.reviews || []);

  const handleSubmit = () => {
    if (!text.trim() || !userName.trim()) return;
    setComments(p => [...p, { id: Date.now(), user: userName, avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80", text, date: "Apr 2026", stars }]);
    setSubmitted(true);
    setTimeout(() => { setText(""); setUserName(""); setStars(5); setSubmitted(false); }, 2000);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", height: 200 }}>
          <img src={sp.resume?.images?.[0] || "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,rgba(26,51,41,0.75))" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#1a3329", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <img src={sp.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"} alt={sp.firstName} style={{ position: "absolute", bottom: -32, left: 24, width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }} />
        </div>

        <div style={{ padding: "44px 28px 32px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", marginBottom: 4 }}>{sp.firstName} {sp.lastName}</div>
            <div style={{ fontSize: 14, color: "#4f9e7a", fontWeight: 600, marginBottom: 12 }}>{sp.resume?.bio?.slice(0, 80)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Stars count={Math.round(sp.resume?.ratingAverage || 0)} /><span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329" }}>{sp.resume?.ratingAverage || "—"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[{ label: "Education", val: sp.resume?.education, col: "1 / -1" }, { label: "Workplace", val: sp.resume?.workplace }].map(item => (
                <div key={item.label} style={{ background: "#f7faf8", borderRadius: 14, padding: "12px 14px", gridColumn: item.col || "auto" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#4f9e7a", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: "#1a3329", fontWeight: 500, lineHeight: 1.5 }}>{item.val || "—"}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(sp.resume?.specializations || []).map(s => <span key={s} className="sp-tag">{s}</span>)}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", borderRadius: 20, padding: "18px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Book a Consultation</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>1-hour online session · Available 6 days/week</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f5e642", marginBottom: 8 }}>200 000 DZD</div>
              <button onClick={() => onBook(sp)} style={{ background: "#f5e642", color: "#1a3329", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Book Consultation
              </button>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(79,158,122,0.12)", marginBottom: 24 }} />

          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 16 }}>Patient Reviews ({comments.length})</div>
            {comments.length === 0 ? (
              <div style={{ fontSize: 13, color: "#5a7a6e", textAlign: "center", padding: "20px 0" }}>No reviews yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {comments.map(c => (
                  <div key={c.id} className="sp-comment-card">
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👤</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329" }}>{c.user || c.client?.firstName}</span>
                          <span style={{ fontSize: 11.5, color: "#5a7a6e" }}>{c.date || new Date(c.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                        </div>
                        <Stars count={c.stars || c.rating} />
                        <p style={{ fontSize: 13.5, color: "#2a4a3e", lineHeight: 1.7, marginTop: 6, fontStyle: "italic" }}>"{c.text || c.comment}"</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(79,158,122,0.12)", marginBottom: 24 }} />

          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 16 }}>Share Your Experience</div>
            {submitted ? (
              <div style={{ background: "#e8f5e9", borderRadius: 16, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329" }}>Review submitted!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input className="sp-input" placeholder="Your name" value={userName} onChange={e => setUserName(e.target.value)} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5a7a6e", marginBottom: 8 }}>Your rating</div>
                  <Stars count={stars} interactive onSet={setStars} />
                </div>
                <textarea className="sp-input" rows={4} placeholder="Share your experience…" value={text} onChange={e => setText(e.target.value)} />
                <button className="sp-submit-btn" onClick={handleSubmit} style={{ alignSelf: "flex-start" }}>Submit Review →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Specialists() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [bookingSp, setBookingSp] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("http://localhost:5000/nutritionists/public?type=CONSULTATION")
      .then(res => res.json())
      .then(data => {
        setSpecialists(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "all" ? specialists : specialists.filter(s => s.gender === filter);

  const handleBook = (sp) => { setSelected(null); setBookingSp(sp); };

  const handleConfirm = ({ sp, date, slot }) => {
    setBookingSp(null);
    if (!isLoggedIn) {
      navigate("/login", {
        state: {
          redirect: "/payment",
          consultationState: { sp, date, slot }
        }
      });
      return;
    }
    navigate("/payment", { state: { sp, date, slot } });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'DM Sans',sans-serif" }}>
      <Header />

      <section style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)", padding: "64px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div className="sp-fade-up" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12.5, fontWeight: 700, color: "#f5e642", marginBottom: 22 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            Certified Nutrition Specialists
          </div>
          <h1 className="sp-fade-up" style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(36px,6vw,60px)", fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1.04, marginBottom: 16, animationDelay: "0.1s" }}>
            Meet our <span style={{ color: "#f5e642" }}>experts.</span>
          </h1>
          <p className="sp-fade-up" style={{ fontSize: 16, color: "rgba(255,255,255,0.68)", lineHeight: 1.8, animationDelay: "0.2s" }}>
            Book a 1-hour online consultation with our certified specialists — available 6 days a week.
          </p>
          <div className="sp-fade-up" style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 36, animationDelay: "0.3s" }}>
            {[[specialists.length || "—", "Specialists"], ["500+", "Patients helped"], ["4.85", "Avg. rating"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 0" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["all", "All"], ["female", "Female"], ["male", "Male"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ background: filter === val ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "#fff", color: filter === val ? "#f5e642" : "#2d6b50", border: `1.5px solid ${filter === val ? "transparent" : "rgba(79,158,122,0.25)"}`, borderRadius: 999, padding: "8px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.22s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#5a7a6e", fontSize: 16, padding: "60px 0" }}>Loading...</div>
        ) : specialists.length === 0 ? (
          <div style={{ textAlign: "center", color: "#5a7a6e", fontSize: 16, padding: "60px 0" }}>No specialists available yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
            {filtered.map((sp, i) => (
              <div key={sp.id} className="sp-card sp-fade-up" style={{ animationDelay: `${i * 0.1}s` }} onClick={() => setSelected(sp)}>
                <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                  <img src={sp.resume?.images?.[0] || "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,transparent 30%,rgba(26,51,41,0.65))" }} />
                  <img src={sp.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"} alt={sp.firstName} style={{ position: "absolute", bottom: -28, left: 20, width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }} />
                </div>
                <div style={{ padding: "36px 20px 14px" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#1a3329", marginBottom: 3 }}>{sp.firstName} {sp.lastName}</div>
                  <div style={{ fontSize: 13, color: "#4f9e7a", fontWeight: 600, marginBottom: 10 }}>{sp.resume?.bio?.slice(0, 60)}...</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Stars count={Math.round(sp.resume?.ratingAverage || 0)} /><span style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>{sp.resume?.ratingAverage || "—"}</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(sp.resume?.specializations || []).map(s => <span key={s} className="sp-tag">{s}</span>)}
                  </div>
                </div>
                <div style={{ padding: "12px 20px 18px", borderTop: "1px solid rgba(79,158,122,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#1a3329" }}>200 000 <span style={{ fontSize: 12, color: "#5a7a6e", fontWeight: 500 }}>DZD/h</span></div>
                  <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 700 }}>View Profile →</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <SpecialistModal sp={selected} onClose={() => setSelected(null)} onBook={handleBook} />}
      {bookingSp && <BookingModal sp={bookingSp} onClose={() => setBookingSp(null)} onConfirm={handleConfirm} />}
      <Footer />
    </div>
  );
}

