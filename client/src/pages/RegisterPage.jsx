import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-display-lg text-center mb-2">Create Account</h1>
        <p className="text-body text-ink-muted-48 text-center mb-8">Register as a student</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-sm border border-hairline">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-caption text-ink-muted-80 mb-1">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
          </div>
          <div className="mb-4">
            <label className="block text-caption text-ink-muted-80 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
          </div>
          <div className="mb-6">
            <label className="block text-caption text-ink-muted-80 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-pill py-3 text-body font-medium hover:bg-primary-focus transition active:scale-[0.98] disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
          <p className="text-center mt-4 text-caption text-ink-muted-48">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
