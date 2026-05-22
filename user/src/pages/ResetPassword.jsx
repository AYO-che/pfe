import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm) { setError("Please fill in both fields"); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm)  { setError("Passwords do not match"); return; }
    if (!token)                { setError("Invalid or missing reset token"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await authFetch("https://chrysalise-server.onrender.com/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strength = !password ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = ["", "#e74c3c", "#e67e22", "#2ecc71", "#0b6630"];

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

        .input-wrap { position: relative; }
        .input-wrap input {
          padding: 12px 42px 12px 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,168,84,0.25);
          background: rgba(255,255,255,0.4);
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1a3329; outline: none;
          backdrop-filter: blur(8px);
          transition: all 0.2s; width: 100%;
          box-sizing: border-box;
        }
        .input-wrap input:focus {
          border-color: rgba(168,224,44,0.7);
          background: rgba(255,255,255,0.6);
          box-shadow: 0 0 0 3px rgba(168,224,44,0.15);
        }
        .input-wrap input::placeholder { color: #8a9a8e; }
        .eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #5a7a6e; padding: 0; display: flex;
        }
        .eye-btn:hover { color: #0b6630; }

        /* Strength bar */
        .strength-bar-wrap { margin-top: 6px; display: flex; align-items: center; gap: 8px; }
        .strength-bars { display: flex; gap: 3px; flex: 1; }
        .strength-bar {
          height: 3px; flex: 1; border-radius: 2px;
          background: rgba(0,168,84,0.1);
          transition: background 0.3s;
        }
        .strength-label { font-size: 11px; font-weight: 700; min-width: 36px; text-align: right; }

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
          {success ? (
            <div className="success-box">
              <div className="success-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div className="success-title">Password reset!</div>
              <div className="success-sub">
                Your password has been updated.<br/>
                Redirecting you to login...
              </div>
            </div>
          ) : (
            <>
              <div className="login-title">Set new password</div>
              <div className="login-sub">Must be at least 8 characters.</div>

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
                  <label>New Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPass(p => !p)}>
                      {showPass ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="strength-bar-wrap">
                      <div className="strength-bars">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="strength-bar"
                            style={{ background: i <= strength ? strengthColor[strength] : undefined }} />
                        ))}
                      </div>
                      <span className="strength-label" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pf-field">
                  <label>Confirm Password</label>
                  <div className="input-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button className="pf-btn pf-btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" /> Resetting...</> : "Reset Password"}
                </button>
              </form>

              <div className="login-footer">
                <Link to="/login">← Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
