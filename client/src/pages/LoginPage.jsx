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
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="text-display-lg text-center mb-2">Library LMS</h1>
        <p className="text-body text-ink-muted-48 text-center mb-8">Sign in to your account</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 shadow-sm border border-hairline">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>
          )}
          <div className="mb-4">
            <label className="block text-caption text-ink-muted-80 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-caption text-ink-muted-80 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-pill py-3 text-body font-medium hover:bg-primary-focus transition active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center mt-4 text-caption text-ink-muted-48">
            No account?{" "}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
