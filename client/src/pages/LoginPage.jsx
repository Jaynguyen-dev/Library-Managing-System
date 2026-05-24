import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
      const userData = data.data?.user;
      if (!userData) { setError("Invalid response from server"); setLoading(false); return; }
      login(data.data.token, userData);
      const target = userData.role === "user" ? "/my-dashboard" : "/dashboard";
      navigate(target);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="login-logo"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <i className="ti ti-book-2" aria-hidden="true"></i>
        </motion.div>
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to LibraryLMS</div>
        <form onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{
                background: "var(--sf-red-bg)", color: "var(--sf-red)", fontSize: "13px",
                padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", textAlign: "left"
              }}
            >{error}</motion.div>
          )}
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
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
          <motion.button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", borderRadius: "10px", marginTop: "4px" }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>
        <p style={{ fontSize: "12px", color: "var(--sf-text-2)", marginTop: "16px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--sf-accent)", textDecoration: "none", fontWeight: 500 }}>Register</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
