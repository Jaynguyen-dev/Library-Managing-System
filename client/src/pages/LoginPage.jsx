import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      login(data.data.token, data.data.user);
      const target = data.data.user.role === "student" ? "/my-dashboard" : "/dashboard";
      navigate(target);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <i className="ti ti-book-2" aria-hidden="true"></i>
        </div>
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to LibraryLMS</div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: "#FFF0EF", color: "#991B1B", fontSize: "13px",
              padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", textAlign: "left"
            }}>{error}</div>
          )}
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@student.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", borderRadius: "10px", marginTop: "4px" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p style={{ fontSize: "12px", color: "var(--sf-text-2)", marginTop: "16px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--sf-accent)", textDecoration: "none" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
