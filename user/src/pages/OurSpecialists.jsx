import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  return [val];
};

const getImage = (sp) => {
  const img = sp.image || sp.resume?.images?.[0];
  if (!img) return "https://placehold.co/300x300";
  return img.startsWith("http") ? img : `/api${img}`;
};

const OFFER_MAP = {
  CONSULTATION: { icon: "🎥", label: "Video Consultation" },
  PLAN: { icon: "📋", label: "Diet Plan" },
  FOLLOW_UP: { icon: "🔄", label: "Follow-Up" },
  MESSAGE: { icon: "💬", label: "Messaging" },
  HOME_VISIT: { icon: "🏠", label: "Home Visit" },
};

const getOffer = (type) =>
  OFFER_MAP[type] ?? { icon: "⚕️", label: type.replace(/_/g, " ") };

function Stars({ count }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${count >= i ? "star--on" : "star--off"}`}>★</span>
      ))}
    </div>
  );
}

function DoctorModal({ sp, onClose }) {
  const offers = toArray(sp.resume?.offersTypes);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="modal-avatar-wrap">
          <img src={getImage(sp)} className="modal-avatar" alt={sp.firstName} />
        </div>

        <div className="modal-content">
          <h2 className="modal-name">{sp.firstName} {sp.lastName}</h2>

          <div className="modal-rating">
            <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
            <span className="modal-rating-val">
              {sp.resume?.ratingAverage ? sp.resume.ratingAverage.toFixed(1) : "No rating"}
            </span>
          </div>

          <p className="modal-bio">{sp.resume?.bio || "No bio available"}</p>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🎓</span>
              <div>
                <div className="info-label">Education</div>
                <div className="info-value">{sp.resume?.education || "—"}</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🏢</span>
              <div>
                <div className="info-label">Workplace</div>
                <div className="info-value">{sp.resume?.workplace || "—"}</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🏅</span>
              <div>
                <div className="info-label">Experience</div>
                <div className="info-value">{sp.resume?.experienceYears ?? "—"} years</div>
              </div>
            </div>
          </div>

          {toArray(sp.resume?.specializations).length > 0 && (
            <div className="section">
              <h4 className="section-title">Specializations</h4>
              <div className="tags">
                {toArray(sp.resume?.specializations).map(s => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          {toArray(sp.resume?.certifications).length > 0 && (
            <div className="section">
              <h4 className="section-title">Certifications</h4>
              <div className="cert-list">
                {toArray(sp.resume?.certifications).map((c, i) => (
                  <div key={i} className="cert-item">✓ {c}</div>
                ))}
              </div>
            </div>
          )}

          <div className="section">
            <h4 className="section-title">Services</h4>
            {offers.length === 0
              ? <p className="no-data">No services listed</p>
              : (
                <div className="offers-grid">
                  {offers.map(t => {
                    const { icon, label } = getOffer(t);
                    return (
                      <div key={t} className="offer-pill">
                        <span className="offer-icon">{icon}</span>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          <div className="section">
            <h4 className="section-title">Reviews</h4>
            {(!sp.reviews || sp.reviews.length === 0) ? (
              <p className="no-data">No reviews yet</p>
            ) : (
              <div className="reviews-list">
                {sp.reviews.map(r => (
                  <div key={r.id} className="review">
                    <div className="review-header">
                      <b className="review-author">{r.client?.firstName}</b>
                      <Stars count={r.rating} />
                    </div>
                    <p className="review-text">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ sp, onClick }) {
  const offers = toArray(sp.resume?.offersTypes);

  return (
    <div className="nt-card" onClick={onClick}>
      <div className="nt-card-img-wrap">
        <img src={getImage(sp)} className="nt-card-img" alt={sp.firstName} />
        <div className="nt-card-badges">
          {offers.map(t => (
            <span key={t} className="nt-badge" title={getOffer(t).label}>
              {getOffer(t).icon}
            </span>
          ))}
        </div>
      </div>

      <div className="nt-card-body">
        <h3 className="nt-card-name">{sp.firstName} {sp.lastName}</h3>

        <div className="nt-card-rating">
          <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
          {sp.resume?.ratingAverage
            ? <span className="nt-card-rating-val">{sp.resume.ratingAverage.toFixed(1)}</span>
            : null}
        </div>

        <p className="nt-card-bio">
          {sp.resume?.bio ? sp.resume.bio.slice(0, 75) + "…" : "No bio available"}
        </p>

        <div className="tags nt-card-tags">
          {toArray(sp.resume?.specializations).slice(0, 3).map(s => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>

        <div className="nt-card-footer">
          <span className="nt-view-btn">View Profile →</span>
        </div>
      </div>
    </div>
  );
}

export default function OurTeam() {
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/nutritionists/public?type=CONSULTATION").then(async (r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      }),
      fetch("/api/nutritionists/public?type=PLAN").then(async (r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([c, p]) => {
        const all = [
          ...(Array.isArray(c) ? c : c.data || []),
          ...(Array.isArray(p) ? p : p.data || []),
        ];
        const merged = {};
        all.forEach(doc => {
          if (!merged[doc.id]) {
            merged[doc.id] = doc;
          } else {
            merged[doc.id].resume.offersTypes = [
              ...new Set([
                ...toArray(merged[doc.id].resume.offersTypes),
                ...toArray(doc.resume?.offersTypes),
              ]),
            ];
          }
        });
        setDoctors(Object.values(merged));
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load specialists. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="nt-page">
      <Header />

      <div className="nt-hero">
        <p className="nt-hero-sub">Meet the experts behind your health journey</p>
        <h1 className="nt-hero-title">Our Specialists</h1>
      </div>

      {loading && <p style={{ textAlign: "center", padding: "2rem" }}>Loading...</p>}
      {error && <p style={{ textAlign: "center", color: "red", padding: "2rem" }}>{error}</p>}

      {!loading && !error && (
        <div className="nt-grid">
          {doctors.length === 0
            ? <p style={{ textAlign: "center", padding: "2rem" }}>No specialists found.</p>
            : doctors.map(sp => (
                <DoctorCard key={sp.id} sp={sp} onClick={() => setSelected(sp)} />
              ))
          }
        </div>
      )}

      {selected && <DoctorModal sp={selected} onClose={() => setSelected(null)} />}

      <Footer />
    </div>
  );
}