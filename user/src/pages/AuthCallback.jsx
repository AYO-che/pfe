import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=None; Secure`;
      fetchUser().then(() => navigate("/profile"));
    } else {
      navigate("/login");
    }
  }, []);

  return <div>Logging in...</div>;
}