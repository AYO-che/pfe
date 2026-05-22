import { authFetch } from "../../context/Authcontext";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = "https://chrysalise-server.onrender.com";

export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, credentials: "include", headers });
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await authFetch(`${API_URL}/me`, { cache: "no-store" });
      if (!res.ok) { setUser(null); return; }
      const data = await res.json();
      if (data?.id && (data.role === "CLIENT" || data.role === "NUTRITION")) {
        setUser(data);
      } else {
        await authFetch(`${API_URL}/logout`, { method: "POST" });
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  async function signup(formData) {
    const res = await authFetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");
    await fetchUser();
  }

  async function login(email, password) {
    const res = await authFetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await authFetch(`${API_URL}/logout`, { method: "POST" });
    localStorage.removeItem("token");
    setUser(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(45,122,79,0.2)", borderTop: "3px solid #2d7a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, signup, login, logout, fetchUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

