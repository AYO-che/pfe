import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/Authcontext";

function buildImageUrl(sp) {
  const raw = sp.image || sp.resume?.images?.[0] || sp.resume?.image || null;
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) return raw;
  const rel = raw.startsWith("/") ? raw : `/${raw}`;
  return `/api${rel}`;
}

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
    const label = `${String(h).padStart(2, "0")}:00 – ${String(h + 1).padStart(2, "00")}:00`;
    const key   = `${dateStr}_${h}`;
    slots.push({ label, key, booked: bookedKeys.includes(key) });
  }
  return slots;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function getInitials(sp) {
  return `${sp.firstName?.[0] ?? ""}${sp.lastName?.[0] ?? ""}`.toUpperCase();
}

function Stars({ count }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: count >= i ? "#f5a623" : "#d9e2dc", fontSize: 15 }}>★</span>
      ))}
    </div>
  );
}

function SpImage({ sp, mode = "cover", size = 64, style: extraStyle = {} }) {
  const [error, setError] = useState(false);
  const src = buildImageUrl(sp);

  const Fallback = () => (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 50%,#4f9e7a 100%)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: mode === "circle" ? "50%" : 0, ...extraStyle }}>
      <span style={{ fontFamily: "'Syne',sans-serif", fontSize: mode === "circle" ? size * 0.35 : 48, fontWeight: 800, color: "rgba(245,230,66,0.7)" }}>{getInitials(sp)}</span>
    </div>
  );

  if (!src || error) return <Fallback />;

  const imgStyle = mode === "circle"
    ? { width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", display: "block", flexShrink: 0, ...extraStyle }
    : { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", display: "block", ...extraStyle };

  return <img src={src} alt={`${sp.firstName} ${sp.lastName}`} style={imgStyle} onError={() => setError(true)} />;
}

// ─── BookingModal ──────────────────────────────────────────────────────────────
// Shows calendar + time slots for picking the FIRST session date
function BookingModal({ sp, selectedOffer, onClose, onConfirm }) {
  const DATES = getAvailableDates();
  const [selDate,      setSelDate]      = useState(DATES[0]);
  const [selSlot,      setSelSlot]      = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookedKeys,   setBookedKeys]   = useState([]);

  const displayPrice = selectedOffer
    ? `$${Number(selectedOffer.price).toFixed(2)}`
    : "—";

  useEffect(() => {
    if (!sp?.id) return;
    setLoadingSlots(true);
fetch(`http://localhost:5000/sessions/occupied/${sp.id}?date=${selDate}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setBookedKeys(data.occupiedSlots?.map(s => {
        const d = new Date(s);
        return `${selDate}_${d.getHours()}`;
      }) ?? []))
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [sp?.id, selDate]);

  const slots = generateSlots(selDate, bookedKeys);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="book-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ position: "relative", height: 100, overflow: "hidden", borderRadius: "28px 28px 0 0", flexShrink: 0 }}>
          <SpImage sp={sp} mode="cover" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(26,51,41,0.88),rgba(26,51,41,0.45))" }} />
          <div style={{ position: "absolute", inset: 0, padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff" }}>{sp.firstName} {sp.lastName}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>{sp.resume?.bio?.slice(0, 55)}…</div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "none", cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "22px" }}>
          {/* Package summary */}
          <div style={{ background: "linear-gradient(135deg,#fefde8,#fdf6c0)", border: "1px solid rgba(245,230,66,0.4)", borderRadius: 14, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>
                {selectedOffer?.name ?? "Package"}
              </div>
              <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 2 }}>
                {selectedOffer?.sessionsCount ?? 1} session{(selectedOffer?.sessionsCount ?? 1) > 1 ? "s" : ""} · Plan + Chat included
              </div>
              <div style={{ fontSize: 11.5, color: "#4f9e7a", marginTop: 2 }}>
                📅 Pick your first session date below
                {(selectedOffer?.sessionsCount ?? 1) > 1 && ` — you'll book the rest after payment`}
              </div>
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#b8a200", flexShrink: 0 }}>{displayPrice}</div>
          </div>

          {/* Date picker */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13.5, fontWeight: 800, color: "#1a3329", marginBottom: 10 }}>Select Date for Session 1</div>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
              {DATES.map(d => (
                <button key={d} className={`date-btn ${selDate === d ? "active" : ""}`}
                  onClick={() => { setSelDate(d); setSelSlot(null); }}>
                  {formatDate(d)}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13.5, fontWeight: 800, color: "#1a3329" }}>Select Time</div>
              <div style={{ fontSize: 11.5, color: "#5a7a6e" }}>08:00 – 18:00 · No Fridays</div>
            </div>
            {loadingSlots ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#5a7a6e", fontSize: 13 }}>Loading availability…</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {slots.map(slot => (
                  <button key={slot.key}
                    className={`slot-btn ${slot.booked ? "booked" : ""} ${selSlot?.key === slot.key ? "active" : ""}`}
                    onClick={() => !slot.booked && setSelSlot(slot)}>
                    {slot.label}
                    {slot.booked && <span style={{ display: "block", fontSize: 10, marginTop: 2 }}>Booked</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected summary */}
          {selSlot && (
            <div style={{ background: "#e8f5e9", border: "1px solid rgba(45,122,79,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>Session 1: {formatDate(selDate)} · {selSlot.label}</div>
                <div style={{ fontSize: 11.5, color: "#5a7a6e", marginTop: 1 }}>{displayPrice}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px 0", border: "1.5px solid rgba(79,158,122,0.25)", borderRadius: 14, background: "transparent", fontSize: 14, fontWeight: 600, color: "#5a7a6e", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
            <button
              onClick={() => selSlot && onConfirm({ sp, date: selDate, slot: selSlot })}
              disabled={!selSlot}
              style={{ flex: 2, padding: "12px 0", border: "none", borderRadius: 14, background: selSlot ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "#e0e0e0", color: selSlot ? "#f5e642" : "#aaa", fontSize: 14, fontWeight: 700, cursor: selSlot ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", transition: "all 0.22s" }}>
              Proceed to Payment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SpecialistModal ───────────────────────────────────────────────────────────
function SpecialistModal({ sp, selectedOffer, onClose, onBook }) {
  const displayPrice = selectedOffer
    ? `$${Number(selectedOffer.price).toFixed(2)}`
    : "—";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", height: 260, overflow: "hidden", flexShrink: 0, borderRadius: "24px 24px 0 0" }}>
          <SpImage sp={sp} mode="cover" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(26,51,41,0.85))" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#1a3329", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{sp.firstName} {sp.lastName}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: 500 }}>{sp.resume?.bio?.slice(0, 65)}</div>
          </div>
        </div>

        <div style={{ padding: "22px 28px 32px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329" }}>{sp.resume?.ratingAverage || "—"}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {(sp.resume?.specializations || []).map(s => <span key={s} className="sp-tag">{s}</span>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Education",  val: sp.resume?.education, col: "1 / -1" },
              { label: "Workplace",  val: sp.resume?.workplace },
              { label: "Experience", val: sp.resume?.experienceYears ? `${sp.resume.experienceYears} years` : null },
            ].map(item => (
              <div key={item.label} style={{ background: "#f7faf8", borderRadius: 14, padding: "12px 14px", gridColumn: item.col || "auto" }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#4f9e7a", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, color: "#1a3329", fontWeight: 500, lineHeight: 1.5 }}>{item.val || "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", borderRadius: 20, padding: "18px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                {selectedOffer?.name ?? "Package"}
              </div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
                {displayPrice} · {selectedOffer?.sessionsCount ?? 1} session{(selectedOffer?.sessionsCount ?? 1) > 1 ? "s" : ""} + plan + chat
              </div>
            </div>
            <button onClick={() => onBook(sp)} style={{ background: "#f5e642", color: "#1a3329", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13.5, fontWeight: 800, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              📅 Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Specialists() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { isLoggedIn } = useAuth();

  // The offer the patient picked on SpecialistPlansPage
  const selectedOffer = location.state?.selectedOffer ?? null;

  const [specialists, setSpecialists] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);  // for SpecialistModal
  const [bookingSp,   setBookingSp]   = useState(null);  // for BookingModal
useEffect(() => {
  fetch("http://localhost:5000/nutritionists/public?type=PACKAGE", { credentials: "include" })
    .then(r => r.json())
    .then(data => setSpecialists(Array.isArray(data) ? data : []))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
  const handleBook = (sp) => {
    setSelected(null);
    setBookingSp(sp);
  };

  const handleConfirm = ({ sp, date, slot }) => {
    setBookingSp(null);

    // offerId comes from the offer selected on SpecialistPlansPage
    // If no offer was pre-selected, try to find a PACKAGE offer on the specialist
    const offerId = selectedOffer?.id ?? sp.offersAsNutrition?.find(o => o.type === "PACKAGE")?.id ?? null;

    if (!offerId) {
      alert("This specialist has no active package offer. Please try another specialist or go back and select a package.");
      return;
    }

    // Build sessionDate as ISO string from date + slot hour
    const slotHour  = parseInt(slot.key.split("_")[1], 10);
    const sessionDate = new Date(`${date}T${String(slotHour).padStart(2, "0")}:00:00`).toISOString();

    const paymentState = {
      // Required by Payment.jsx PACKAGE flow
      offerId,
      nutritionId:    sp.id,
      sessionDate,
      // Display info for the order summary
      offerName:      selectedOffer?.name ?? "Package",
      price:          selectedOffer?.price ? `$${Number(selectedOffer.price).toFixed(2)}` : "—",
      chatDays:       selectedOffer?.chatDays ?? 0,
      sessionsCount:  selectedOffer?.sessionsCount ?? 1,
      nutritionName:  `${sp.firstName} ${sp.lastName}`,
      nutritionImage: buildImageUrl(sp),
    };

    if (!isLoggedIn) {
      navigate("/login", {
        state: { redirect: "/payment", paymentState },
      });
      return;
    }

    navigate("/payment", { state: paymentState });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'DM Sans',sans-serif" }}>
      <Header />

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)", padding: "64px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.06) 1.5px,transparent 1.5px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.12)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "6px 18px", fontSize: 12.5, fontWeight: 700, color: "#f5e642", marginBottom: 22 }}>
            👥 Certified Nutrition Specialists
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(36px,6vw,60px)", fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1.04, marginBottom: 16 }}>
            Meet our <span style={{ color: "#f5e642" }}>experts.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.68)", lineHeight: 1.8 }}>
            Book your package with a certified nutritionist — sessions, plan, and chat all included.
          </p>

          {/* Show selected offer badge if coming from plans page */}
          {selectedOffer && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,230,66,0.15)", border: "1px solid rgba(245,230,66,0.35)", borderRadius: 14, padding: "10px 18px", marginTop: 20, fontSize: 13, fontWeight: 600, color: "#f5e642" }}>
              📦 Selected: <strong>{selectedOffer.name}</strong> · ${Number(selectedOffer.price).toFixed(2)} · {selectedOffer.sessionsCount} session{selectedOffer.sessionsCount > 1 ? "s" : ""}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 24 }}>
            {[[specialists.length || "—", "Specialists"], ["500+", "Patients helped"], ["4.85", "Avg. rating"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#f5e642", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialists grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 80px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#5a7a6e", fontSize: 16, padding: "60px 0" }}>Loading...</div>
        ) : specialists.length === 0 ? (
          <div style={{ textAlign: "center", color: "#5a7a6e", fontSize: 16, padding: "60px 0" }}>No specialists available yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
            {specialists.map(sp => {
              const displayPrice = selectedOffer
                ? `$${Number(selectedOffer.price).toFixed(2)}`
                : "No package selected";

              return (
                <div key={sp.id} className="sp-card" onClick={() => setSelected(sp)}>
                  <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "20px 20px 0 0" }}>
                    <SpImage sp={sp} mode="cover" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(26,51,41,0.45))" }} />
                  </div>
                  <div style={{ padding: "16px 20px 12px" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: "#1a3329", marginBottom: 3 }}>{sp.firstName} {sp.lastName}</div>
                    <div style={{ fontSize: 13, color: "#4f9e7a", fontWeight: 500, marginBottom: 10, lineHeight: 1.4 }}>{sp.resume?.bio?.slice(0, 60)}…</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>{sp.resume?.ratingAverage || "—"}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(sp.resume?.specializations || []).slice(0, 3).map(s => <span key={s} className="sp-tag">{s}</span>)}
                    </div>
                  </div>
                  <div style={{ padding: "10px 20px 16px", borderTop: "1px solid rgba(79,158,122,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#4f9e7a" }}>{displayPrice}</div>
                    <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", borderRadius: 999, padding: "7px 16px", fontSize: 12.5, fontWeight: 700 }}>View Profile →</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <SpecialistModal
          sp={selected}
          selectedOffer={selectedOffer}
          onClose={() => setSelected(null)}
          onBook={handleBook}
        />
      )}

      {bookingSp && (
        <BookingModal
          sp={bookingSp}
          selectedOffer={selectedOffer}
          onClose={() => setBookingSp(null)}
          onConfirm={handleConfirm}
        />
      )}

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .sp-card { background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(26,51,41,0.08); cursor:pointer; transition:transform 0.28s ease,box-shadow 0.28s ease; }
        .sp-card:hover { transform:translateY(-6px); box-shadow:0 14px 36px rgba(26,51,41,0.14); }
        .sp-tag { background:#eaf4ee; color:#2d6b4a; padding:4px 11px; border-radius:30px; font-size:11px; font-weight:600; }
        .overlay { position:fixed; inset:0; background:rgba(10,26,20,0.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; backdrop-filter:blur(4px); }
        .sp-modal { background:#fff; border-radius:24px; width:100%; max-width:500px; max-height:92vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 60px rgba(0,0,0,0.24); }
        .sp-modal > div:last-child { overflow-y:auto; flex:1; }
        .book-modal { background:#fff; border-radius:28px; width:100%; max-width:460px; max-height:92vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.24); }
        .date-btn { background:#f4f7f5; border:1.5px solid transparent; border-radius:12px; padding:8px 14px; font-size:12.5px; font-weight:600; color:#2d6b50; cursor:pointer; white-space:nowrap; font-family:'DM Sans',sans-serif; transition:all 0.18s; flex-shrink:0; }
        .date-btn.active { background:linear-gradient(135deg,#1a3329,#2d6b50); color:#f5e642; border-color:transparent; }
        .date-btn:hover:not(.active) { border-color:rgba(79,158,122,0.4); }
        .slot-btn { background:#f4f7f5; border:1.5px solid transparent; border-radius:12px; padding:10px 8px; font-size:13px; font-weight:600; color:#1a3329; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.18s; text-align:center; }
        .slot-btn.active { background:linear-gradient(135deg,#1a3329,#2d6b50); color:#f5e642; }
        .slot-btn.booked { background:#f0f0f0; color:#bbb; cursor:not-allowed; text-decoration:line-through; }
        .slot-btn:hover:not(.booked):not(.active) { border-color:rgba(79,158,122,0.4); }
        .book-modal::-webkit-scrollbar { width:4px; }
        .book-modal::-webkit-scrollbar-thumb { background:#c5dac9; border-radius:10px; }
        .sp-modal > div:last-child::-webkit-scrollbar { width:4px; }
        .sp-modal > div:last-child::-webkit-scrollbar-thumb { background:#c5dac9; border-radius:10px; }
      `}</style>
    </div>
  );
}