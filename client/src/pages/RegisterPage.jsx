import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <i className="ti ti-user-plus" aria-hidden="true"></i>
        </div>
        <div className="login-title">Create Account</div>
        <div className="login-sub">Register as a student</div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: "#FFF0EF", color: "#991B1B", fontSize: "13px",
              padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", textAlign: "left"
            }}>{error}</div>
          )}
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Full Name</label>
            <input className="form-input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nguyen Van A" required />
          </div>
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@student.edu.vn" required />
          </div>
          <div className="form-row" style={{ textAlign: "left" }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", borderRadius: "10px", marginTop: "4px" }}>
            {loading ? "Registering…" : "Register"}
          </button>
        </form>
        <p style={{ fontSize: "12px", color: "var(--sf-text-2)", marginTop: "16px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--sf-accent)", textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
