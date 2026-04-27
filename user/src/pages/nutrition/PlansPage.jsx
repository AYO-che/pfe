import { useState, useEffect, useRef } from "react";

const PLAN_TYPES = { PDF: "pdf", TRACKER: "tracker" };

const emptyPDF = { title: "", price: "", duration: "", description: "", pdfFile: null };
const emptyTracker = {
  title: "", price: "", duration: "",
  days: [{ dayNumber: 1, meals: [{ name: "", calories: "" }], habits: [""] }],
};

export default function PlanPage() {
  const [type, setType] = useState(PLAN_TYPES.PDF);
  const [pdfPlan, setPdfPlan] = useState(emptyPDF);
  const [trackerPlan, setTrackerPlan] = useState(emptyTracker);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("/subscriptions/nutrition", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const seen = new Set();
        const uniquePatients = (data.subscriptions ?? [])
          .map((s) => s.patient)
          .filter((p) => p && !seen.has(p.id) && seen.add(p.id));
        setPatients(uniquePatients);
      })
      .catch(() => setPatients([]));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfPlan({ ...pdfPlan, pdfFile: file });
      setFileName(file.name);
    }
  };
const handleSubmit = async () => {
  let res;

  if (type === PLAN_TYPES.PDF) {
    if (!pdfPlan.title || !pdfPlan.price || !pdfPlan.duration) {
      alert("Please fill in title, price and duration");
      return;
    }
    if (!pdfPlan.pdfFile) {
      alert("Please upload a PDF file");
      return;
    }
    const formData = new FormData();
    formData.append("offerName",         pdfPlan.title);
    formData.append("offerPrice",        pdfPlan.price);
    formData.append("offerDurationDays", pdfPlan.duration);
    formData.append("offerDescription",  pdfPlan.description);
    formData.append("title",             pdfPlan.title);
    formData.append("pdfFile",           pdfPlan.pdfFile);

    res = await fetch("/plans", {   // ← adjust to your real route
      method: "POST",
      credentials: "include",
      body: formData,
    });

  } else {
    if (!selectedPatient) { alert("Select a patient first"); return; }
    if (!trackerPlan.title || !trackerPlan.price || !trackerPlan.duration) {
      alert("Please fill in title, price and duration");
      return;
    }
    const body = { patientId: selectedPatient, ...trackerPlan };

    res = await fetch("/plans", {  // ← adjust to your real route
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  // ✅ Safe JSON parsing — won't crash on empty or non-JSON responses
  let data = {};
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    console.error("Server error:", res.status, data);
    alert(data.message || `Error ${res.status} — check your backend route`);
  } else {
    alert("Plan created successfully!");
    // reset form
    setPdfPlan(emptyPDF);
    setTrackerPlan(emptyTracker);
    setFileName("");
    setSelectedPatient("");
  }
};
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .plan-page {
          min-height: 100vh;
          background: #e8f5ef;
          padding: 40px 20px 60px;
          font-family: Syne, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .plan-page::before {
          content: '';
          position: fixed;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(45,107,80,0.18) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .plan-page::after {
          content: '';
          position: fixed;
          bottom: -100px; left: -100px;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(26,51,41,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .plan-container {
          max-width: 680px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .plan-header { margin-bottom: 36px; }
        .plan-header-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(26,51,41,0.5);
          margin-bottom: 8px;
        }
        .plan-header h1 {
          font-family: Syne, sans-serif;
          font-size: 38px;
          color: rgb(26,51,41);
          line-height: 1.1;
        }
        .plan-header h1 span { color: rgb(45,107,80); }

        .switch-box {
          display: flex;
          background: white;
          border-radius: 14px;
          padding: 5px;
          margin-bottom: 28px;
          box-shadow: 0 2px 16px rgba(26,51,41,0.08);
          gap: 4px;
        }
        .switch-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          font-family: Syne, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(26,51,41,0.5);
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .switch-btn:hover { color: rgb(26,51,41); background: #e8f5ef; }
        .switch-btn.active {
          background: linear-gradient(135deg, rgb(26,51,41), rgb(45,107,80));
          color: rgb(245,230,66);
          box-shadow: 0 4px 14px rgba(26,51,41,0.35);
        }
        .switch-btn .icon { font-size: 16px; }

        .card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 4px 24px rgba(26,51,41,0.07);
          border: 1px solid rgba(26,51,41,0.06);
        }

        .card-title {
          font-family: Syne, sans-serif;
          font-size: 22px;
          color: rgb(26,51,41);
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, rgba(45,107,80,0.3), transparent);
        }

        .field-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .field-group.full { grid-template-columns: 1fr; }

        .field-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(26,51,41,0.45);
          margin-bottom: 5px;
        }

        .field-wrap { display: flex; flex-direction: column; }

        .plan-input, .plan-select, .plan-textarea {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #daeee5;
          border-radius: 10px;
          background: #f7fdf9;
          font-family: Syne, sans-serif;
          font-size: 14px;
          color: rgb(26,51,41);
          transition: all 0.2s ease;
          outline: none;
          appearance: none;
        }
        .plan-input::placeholder, .plan-textarea::placeholder { color: rgba(26,51,41,0.3); }
        .plan-input:focus, .plan-select:focus, .plan-textarea:focus {
          border-color: rgb(45,107,80);
          background: white;
          box-shadow: 0 0 0 3px rgba(45,107,80,0.1);
        }
        .plan-textarea { min-height: 90px; resize: vertical; }
        .plan-select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231a3329' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        .file-upload-zone {
          width: 100%;
          padding: 20px 16px;
          border: 2px dashed #daeee5;
          border-radius: 10px;
          background: #f7fdf9;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }
        .file-upload-zone:hover {
          border-color: rgb(45,107,80);
          background: white;
          box-shadow: 0 0 0 3px rgba(45,107,80,0.1);
        }
        .file-upload-zone.has-file {
          border-style: solid;
          border-color: rgb(45,107,80);
          background: #edf8f2;
        }
        .file-upload-icon { font-size: 26px; flex-shrink: 0; }
        .file-upload-text { flex: 1; }
        .file-upload-title {
          font-size: 13px;
          font-weight: 600;
          color: rgb(26,51,41);
          margin-bottom: 2px;
        }
        .file-upload-sub {
          font-size: 11px;
          color: rgba(26,51,41,0.4);
          letter-spacing: 0.5px;
        }
        .file-upload-badge {
          font-size: 10px;
          font-weight: 600;
          background: rgb(45,107,80);
          color: rgb(245,230,66);
          padding: 3px 8px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-input-hidden {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        .section-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 18px;
          color: rgba(26,51,41,0.4);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .section-divider::before, .section-divider::after {
          content: ''; flex: 1; height: 1px; background: #daeee5;
        }

        .day-card {
          background: #f4fbf7;
          border: 1.5px solid #daeee5;
          border-radius: 14px;
          padding: 18px;
          margin-bottom: 12px;
          position: relative;
          transition: border-color 0.2s;
        }
        .day-card:hover { border-color: rgb(45,107,80); }

        .day-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgb(26,51,41), rgb(45,107,80));
          color: rgb(245,230,66);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 14px;
        }

        .btn-add-day {
          width: 100%;
          padding: 11px;
          background: #e8f5ef;
          border: 1.5px dashed rgba(45,107,80,0.4);
          border-radius: 10px;
          cursor: pointer;
          font-family: Syne, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgb(45,107,80);
          transition: all 0.2s ease;
          margin-top: 6px;
        }
        .btn-add-day:hover {
          background: white;
          border-color: rgb(45,107,80);
          box-shadow: 0 2px 10px rgba(45,107,80,0.12);
        }

        .btn-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, rgb(26,51,41), rgb(45,107,80));
          color: rgb(245,230,66);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-family: Syne, sans-serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.5px;
          box-shadow: 0 6px 24px rgba(26,51,41,0.3);
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
        }
        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(26,51,41,0.4);
        }
        .btn-submit:active { transform: translateY(0); }
      `}</style>

      <div className="plan-page">
        <div className="plan-container">

          <div className="plan-header">
            <p className="plan-header-eyebrow">Nutrition Management</p>
            <h1>Create a <span>Plan</span></h1>
          </div>

          <div className="switch-box">
            <button
              className={`switch-btn ${type === PLAN_TYPES.PDF ? "active" : ""}`}
              onClick={() => setType(PLAN_TYPES.PDF)}
            >
              <span className="icon">📄</span> PDF Plan
            </button>
            <button
              className={`switch-btn ${type === PLAN_TYPES.TRACKER ? "active" : ""}`}
              onClick={() => setType(PLAN_TYPES.TRACKER)}
            >
              <span className="icon">📅</span> Tracker Plan
            </button>
          </div>

          {/* PDF Plan */}
          {type === PLAN_TYPES.PDF && (
            <div className="card">
              <h2 className="card-title">📄 PDF Plan</h2>

              <div className="field-group">
                <div className="field-wrap">
                  <p className="field-label">Title</p>
                  <input className="plan-input" placeholder="e.g. 7-Day Clean Eating"
                    value={pdfPlan.title}
                    onChange={(e) => setPdfPlan({ ...pdfPlan, title: e.target.value })} />
                </div>
                <div className="field-wrap">
                  <p className="field-label">Price</p>
                  <input className="plan-input" placeholder="e.g. 29.99"
                    value={pdfPlan.price}
                    onChange={(e) => setPdfPlan({ ...pdfPlan, price: e.target.value })} />
                </div>
              </div>

              <div className="field-group full" style={{ marginBottom: 12 }}>
                <div className="field-wrap">
                  <p className="field-label">Duration (days)</p>
                  <input className="plan-input" placeholder="e.g. 28"
                    value={pdfPlan.duration}
                    onChange={(e) => setPdfPlan({ ...pdfPlan, duration: e.target.value })} />
                </div>
              </div>

              <div className="field-group full" style={{ marginBottom: 12 }}>
                <div className="field-wrap">
                  <p className="field-label">Upload PDF File</p>
                  <div className={`file-upload-zone ${fileName ? "has-file" : ""}`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="file-input-hidden"
                      onChange={handleFileChange}
                    />
                    <span className="file-upload-icon">{fileName ? "✅" : "📂"}</span>
                    <div className="file-upload-text">
                      <p className="file-upload-title">
                        {fileName ? "File selected" : "Choose PDF from your computer"}
                      </p>
                      <p className="file-upload-sub">
                        {fileName ? "" : "Click to browse · PDF only"}
                      </p>
                    </div>
                    {fileName && (
                      <span className="file-upload-badge" title={fileName}>{fileName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="field-wrap">
                <p className="field-label">Description</p>
                <textarea className="plan-textarea" placeholder="Describe the plan goals, contents, and who it's designed for…"
                  value={pdfPlan.description}
                  onChange={(e) => setPdfPlan({ ...pdfPlan, description: e.target.value })} />
              </div>
            </div>
          )}

          {/* Tracker Plan */}
          {type === PLAN_TYPES.TRACKER && (
            <div className="card">
              <h2 className="card-title">📅 Tracker Plan</h2>

              <div className="field-wrap" style={{ marginBottom: 12 }}>
                <p className="field-label">Assign to Patient</p>
                <select className="plan-select" value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}>
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <div className="field-wrap">
                  <p className="field-label">Title</p>
                  <input className="plan-input" placeholder="Plan title"
                    value={trackerPlan.title}
                    onChange={(e) => setTrackerPlan({ ...trackerPlan, title: e.target.value })} />
                </div>
                <div className="field-wrap">
                  <p className="field-label">Price</p>
                  <input className="plan-input" placeholder="e.g. 49"
                    value={trackerPlan.price}
                    onChange={(e) => setTrackerPlan({ ...trackerPlan, price: e.target.value })} />
                </div>
              </div>

              <div className="field-group full" style={{ marginBottom: 0 }}>
                <div className="field-wrap">
                  <p className="field-label">Duration (days)</p>
                  <input className="plan-input" placeholder="e.g. 30"
                    value={trackerPlan.duration}
                    onChange={(e) => setTrackerPlan({ ...trackerPlan, duration: e.target.value })} />
                </div>
              </div>

              <div className="section-divider">Daily Schedule</div>

              {trackerPlan.days.map((day, i) => (
                <div key={i} className="day-card">
                  <div className="day-badge">Day {day.dayNumber}</div>
                  <div className="field-group">
                    <div className="field-wrap">
                      <p className="field-label">Meal</p>
                      <input className="plan-input" placeholder="Meal name"
                        value={day.meals[0].name}
                        onChange={(e) => updateDay(i, (d) => ({ ...d, meals: [{ ...d.meals[0], name: e.target.value }] }))} />
                    </div>
                    <div className="field-wrap">
                      <p className="field-label">Calories</p>
                      <input className="plan-input" placeholder="kcal"
                        value={day.meals[0].calories}
                        onChange={(e) => updateDay(i, (d) => ({ ...d, meals: [{ ...d.meals[0], calories: e.target.value }] }))} />
                    </div>
                  </div>
                  <div className="field-wrap">
                    <p className="field-label">Habit</p>
                    <input className="plan-input" placeholder="e.g. Drink 2L of water"
                      value={day.habits[0]}
                      onChange={(e) => updateDay(i, (d) => ({ ...d, habits: [e.target.value] }))} />
                  </div>
                </div>
              ))}

              <button className="btn-add-day" onClick={addDay}>+ Add Day</button>
            </div>
          )}

          <button className="btn-submit" onClick={handleSubmit}>
            Create Plan →
          </button>

        </div>
      </div>
    </>
  );
}