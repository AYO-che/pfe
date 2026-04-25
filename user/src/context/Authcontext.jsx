import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
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
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error("Signup failed");

    // ✅ Fetch full user with profile instead of using partial signup response
    await fetchUser();
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    // ✅ Same fix for login — fetch full user with profile
    await fetchUser();
  }

  async function logout() {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 50 }}>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        signup,
        login,
        logout,
        fetchUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}