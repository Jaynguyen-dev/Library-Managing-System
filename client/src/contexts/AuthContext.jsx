import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("lms_user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      localStorage.removeItem("lms_user");
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("lms_token"));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("lms_token")));

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    api
      .get("/api/auth/me")
      .then((res) => {
        if (cancelled) return;
        const u = res.data.data.user;
        setUser(u);
        localStorage.setItem("lms_user", JSON.stringify(u));
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setToken(null);
        localStorage.removeItem("lms_token");
        localStorage.removeItem("lms_user");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (tokenStr, userData) => {
    localStorage.setItem("lms_token", tokenStr);
    localStorage.setItem("lms_user", JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
