import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setResetUrl(data.resetUrl);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

        .pf-root {
          font-family: 'DM Sans', sans-serif;
          background: radial-gradient(ellipse at 50% 0%, #e8f5e9 0%, #f2f7f5 50%, #eef4f1 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .glass-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border-top: 1.5px solid rgba(168,224,44,0.85);
          border-left: 1.5px solid rgba(168,224,44,0.85);
          border-bottom: 1.5px solid rgba(0,168,84,0.75);
          border-right: 1.5px solid rgba(0,168,84,0.75);
          border-radius: 22px;
          box-shadow: 0 8px 32px rgba(15,89,47,0.14), inset 0 0 12px rgba(255,255,255,0.55);
          overflow: hidden;
          width: 100%;
          max-width: 430px;
        }

        .id-strip {
          height: 76px;
          background: linear-gradient(135deg,#1a3329 0%,#0b6630 55%,#1a5e3a 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .id-strip-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle,rgba(168,224,44,0.12) 1.5px,transparent 1.5px);
          background-size: 18px 18px;
        }
        .strip-logo {
          position: relative; z-index: 1;
          width: 48px; height: 48px;
          border-radius: 12px;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(168,224,44,0.4);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .strip-logo span {
          color: #a8e02c;
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800;
        }

        .glass-card-pad { padding: 40px 34px; }

        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800;
          color: #1a3329; text-align: center;
          margin-top: 24px;
        }
        .login-sub {
          font-size: 13.5px; color: #5a7a6e;
          text-align: center; margin-top: 6px;
          margin-bottom: 28px; line-height: 1.5;
        }

        .pf-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .pf-field label {
          font-size: 11.5px; font-weight: 700;
          color: #5a7a6e; text-transform: uppercase; letter-spacing: 0.6px;
        }
        .pf-field input {
          padding: 12px 14px; border-radius: 12px;
          border: 1.5px solid rgba(0,168,84,0.25);
          background: rgba(255,255,255,0.4);
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1a3329; outline: none;
          backdrop-filter: blur(8px);
          transition: all 0.2s; width: 100%; box-sizing: border-box;
        }
        .pf-field input:focus {
          border-color: rgba(168,224,44,0.7);
          background: rgba(255,255,255,0.6);
          box-shadow: 0 0 0 3px rgba(168,224,44,0.15);
        }
        .pf-field input::placeholder { color: #8a9a8e; }

        .pf-btn {
          border-radius: 12px; padding: 12px 18px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex; align-items: center; justify-content: center;
          gap: 8px; border: none; transition: all 0.2s; width: 100%;
        }
        .pf-btn-primary {
          background: #0b6630; color: #fff;
          box-shadow: 0 4px 14px rgba(11,102,48,0.3);
          margin-top: 8px;
        }
        .pf-btn-primary:hover:not(:disabled) {
          background: #0d7a38; transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(11,102,48,0.4);
        }
        .pf-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-error {
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.2);
          color: #c0392b; padding: 10px 14px;
          border-radius: 10px; font-size: 13px;
          font-weight: 600; margin-bottom: 8px;
          display: flex; align-items: center; gap: 8px;
        }

        .success-box { text-align: center; padding: 8px 0 16px; }
        .success-icon {
          width: 56px; height: 56px;
          background: rgba(11,102,48,0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .success-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800;
          color: #1a3329; margin-bottom: 8px;
        }
        .success-sub { font-size: 13.5px; color: #5a7a6e; line-height: 1.6; }

        .reset-link-box {
          margin-top: 20px;
          background: rgba(11,102,48,0.06);
          border: 1.5px dashed rgba(11,102,48,0.3);
          border-radius: 12px;
          padding: 14px 16px;
          text-align: left;
        }
        .reset-link-label {
          font-size: 11px; font-weight: 700;
          color: #5a7a6e; text-transform: uppercase;
          letter-spacing: 0.6px; margin-bottom: 8px;
        }
        .reset-link-btn {
          display: inline-flex;
          align-items: center; justify-content: center;
          gap: 8px; width: 100%;
          padding: 11px 16px;
          background: #0b6630; color: #fff;
          border-radius: 10px;
          font-size: 13.5px; font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }
        .reset-link-btn:hover {
          background: #0d7a38;
          transform: translateY(-1px);
        }

        .login-footer {
          text-align: center; margin-top: 22px;
          font-size: 13.5px; color: #5a7a6e; font-weight: 500;
        }
        .login-footer a {
          color: #0b6630; font-weight: 700;
          text-decoration: none; transition: color 0.2s;
        }
        .login-footer a:hover { color: #0d7a38; text-decoration: underline; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          display: inline-block;
          animation: spin 0.6s linear infinite;
        }
      `}</style>

      <div className="glass-card anim">
        <div className="id-strip">
          <div className="id-strip-dots" />
          <div className="strip-logo"><span>C</span></div>
        </div>

        <div className="glass-card-pad">
          {sent ? (
            <div className="success-box">
              <div className="success-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div className="success-title">Link generated!</div>
              <div className="success-sub">
                Click below to reset the password for<br/>
                <strong style={{color:"#1a3329"}}>{email}</strong>
              </div>

              {resetUrl && (
                <div className="reset-link-box">
                  <div className="reset-link-label">Your reset link</div>
                  <a href={resetUrl} className="reset-link-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Reset my password →
                  </a>
                </div>
              )}

              <div className="login-footer" style={{marginTop:20}}>
                <Link to="/login">← Back to login</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="login-title">Forgot password?</div>
              <div className="login-sub">
                Enter your email and we'll generate<br/>a reset link for you.
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="login-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <div className="pf-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <button className="pf-btn pf-btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Generating...</> : "Generate Reset Link"}
                </button>
              </form>

              <div className="login-footer">
                Remember your password? <Link to="/login">Login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}