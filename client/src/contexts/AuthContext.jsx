import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("lms_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("lms_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api
        .get("/api/auth/me")
        .then((res) => {
          const u = res.data.data.user;
          setUser(u);
          localStorage.setItem("lms_user", JSON.stringify(u));
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("lms_token");
          localStorage.removeItem("lms_user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (tokenStr, userData) => {
    localStorage.setItem("lms_token", tokenStr);
    localStorage.setItem("lms_user", JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
