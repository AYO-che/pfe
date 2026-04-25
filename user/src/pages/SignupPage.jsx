import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    weight: "",
    height: "",
    goal: "",
    activityLevel: "",
    medicalConditions: "",
    allergies: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // STEP 1 VALIDATION FIXED
  // =========================
  const nextStep = () => {
    const emailRegex = /\S+@\S+\.\S+/;

    if (
      !form.email ||
      !form.password ||
      !form.firstName ||
      !form.lastName
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (!emailRegex.test(form.email)) {
      setError("Invalid email format");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setStep(2);
  };

  const prevStep = () => setStep(1);

  // =========================
  // SUBMIT FIXED (backend safe)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        weight: Number(form.weight),
        height: Number(form.height),
      };

      await signup(payload);

      navigate("/profile");
    } catch (err) {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Start your fitness journey</p>

        {/* PROGRESS */}
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progress,
              width: step === 1 ? "50%" : "100%",
            }}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <div style={styles.step}>
              <input
                name="email"
                placeholder="Email"
                style={styles.input}
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                style={styles.input}
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />

              <input
                name="firstName"
                placeholder="First Name"
                style={styles.input}
                value={form.firstName}
                onChange={handleChange}
                disabled={loading}
              />

              <input
                name="lastName"
                placeholder="Last Name"
                style={styles.input}
                value={form.lastName}
                onChange={handleChange}
                disabled={loading}
              />

              {error && <p style={styles.error}>{error}</p>}

              <button
                type="button"
                style={styles.primaryBtn}
                onClick={nextStep}
                disabled={loading}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={styles.step}>
              <input
                type="date"
                name="dateOfBirth"
                style={styles.input}
                value={form.dateOfBirth}
                onChange={handleChange}
                disabled={loading}
              />

              <select
                name="gender"
                style={styles.input}
                value={form.gender}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <div style={styles.row}>
                <input
                  name="weight"
                  placeholder="Weight (kg)"
                  style={styles.input}
                  value={form.weight}
                  onChange={handleChange}
                  disabled={loading}
                />

                <input
                  name="height"
                  placeholder="Height (cm)"
                  style={styles.input}
                  value={form.height}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <input
                name="goal"
                placeholder="Goal (lose / gain / maintain)"
                style={styles.input}
                value={form.goal}
                onChange={handleChange}
                disabled={loading}
              />

              <select
                name="activityLevel"
                style={styles.input}
                value={form.activityLevel}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Activity Level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <input
                name="medicalConditions"
                placeholder="Medical conditions (optional)"
                style={styles.input}
                value={form.medicalConditions}
                onChange={handleChange}
                disabled={loading}
              />

              <input
                name="allergies"
                placeholder="Allergies (optional)"
                style={styles.input}
                value={form.allergies}
                onChange={handleChange}
                disabled={loading}
              />

              {error && <p style={styles.error}>{error}</p>}

              <div style={styles.row}>
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={prevStep}
                  disabled={loading}
                >
                  ← Back
                </button>

                <button
                  type="submit"
                  style={styles.primaryBtn}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Finish Setup ✓"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* =========================
   STYLES (unchanged)
========================= */
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#e3f2fd,#e8f5e9)",
    fontFamily: "sans-serif",
  },
  card: {
    width: "420px",
    background: "#fff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#1a3329",
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7c75",
    marginBottom: "20px",
  },
  progressBar: {
    height: "6px",
    background: "#eee",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  progress: {
    height: "100%",
    background: "linear-gradient(135deg,#3d9b73,#2a6b4f)",
    transition: "0.3s",
  },
  step: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  primaryBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#3d9b73,#2a6b4f)",
    color: "white",
    fontWeight: "bold",
    flex: 1,
  },
  secondaryBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
    flex: 1,
  },
  error: {
    color: "red",
    fontSize: "13px",
    textAlign: "center",
  },
};