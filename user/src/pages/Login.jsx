import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #e8f5e9, #e3f2fd);
  font-family: 'DM Sans', sans-serif;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 430px;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 40px 34px;
  box-shadow: 0 25px 70px rgba(0,0,0,0.12);
  border: 1px solid rgba(255,255,255,0.6);
}

.login-logo-wrap {
  text-align: center;
  margin-bottom: 24px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a3329;
}

.login-sub {
  font-size: 14px;
  color: #5a7a6e;
  margin-top: 4px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.login-field label {
  font-size: 13px;
  font-weight: 600;
  color: #1a3329;
  margin-bottom: 6px;
  display: block;
}

.login-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1.5px solid #d7eee5;
  background: #f7fcf9;
  outline: none;
  transition: 0.2s;
}

.login-input:focus {
  border-color: #2d6b50;
  box-shadow: 0 0 0 3px rgba(45,107,80,0.12);
  background: #fff;
}

.login-btn {
  margin-top: 8px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #1a3329, #2d6b50);
  color: #f5e642;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
}

.login-divider {
  text-align: center;
  margin: 16px 0;
  font-size: 13px;
  color: #8aa39b;
  position: relative;
}

.login-divider::before,
.login-divider::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #d7eee5;
}

.login-divider::before { left: 0; }
.login-divider::after { right: 0; }

/* 🔵 GOOGLE BUTTON FULL WIDTH */
.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  padding: 12px 14px;
  border-radius: 12px;

  border: 1px solid #e0e0e0;
  background: #fff;

  font-weight: 600;
  font-size: 14px;

  cursor: pointer;
  transition: all 0.2s ease;

  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
}

.google-btn:hover {
  background: #f9f9f9;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

.google-btn:active {
  transform: scale(0.99);
}

.google-icon {
  width: 18px;
  height: 18px;
}

.login-footer {
  text-align: center;
  margin-top: 18px;
  font-size: 14px;
  color: #5a7a6e;
}

.login-footer a {
  color: #2d6b50;
  font-weight: 600;
  text-decoration: none;
}
`;
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // 🔥 DEBUG LOGS (ADDED FOR YOU)
    console.log("LOGIN RESPONSE:", data);
    console.log("ROLE:", data.user?.role);

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    login(data.user);

    const role = data.user?.role;

    if (!role) {
      console.log("NO ROLE FOUND → fallback to /profile");
      navigate("/profile");
      return;
    }

    if (role === "ADMIN") navigate("/admin");
    else if (role === "NUTRITION") navigate("/Resume");
    else navigate("/profile");

  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="login-page">
        <div className="login-card">

          <div className="login-logo-wrap">
            <div className="login-title">Welcome back</div>
            <div className="login-sub">Sign in to continue</div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

            <div className="login-field">
              <label>Email</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="login-divider">or</div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            <svg className="google-icon" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
            </svg>

            Continue with Google
          </button>

          <div className="login-footer">
            Don’t have an account? <Link to="/register">Sign up</Link>
          </div>

        </div>
      </div>
    </>
  );
}