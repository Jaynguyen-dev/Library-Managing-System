import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      toast.success("Registration successful! Please sign in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          <i className="ti ti-user-plus" aria-hidden="true"></i>
        </motion.div>
        <div className="login-title">Create Account</div>
        <div className="login-sub">Create a new account</div>
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
            <label className="form-label">Full Name</label>
            <input className="form-input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nguyen Van A" required />
          </div>
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", borderRadius: "10px", marginTop: "4px" }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Registering…" : "Register"}
          </motion.button>
        </form>
        <p style={{ fontSize: "12px", color: "var(--sf-text-2)", marginTop: "16px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--sf-accent)", textDecoration: "none", fontWeight: 500 }}>Sign In</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
