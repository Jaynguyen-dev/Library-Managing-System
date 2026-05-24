import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";

export default function UserFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.includes("@")) { setError("Please enter a valid email address"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/api/users", form);
      toast.success("User created");
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div style={{ display: "flex", justifyContent: "center" }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="form-card">
        <h1 style={{ fontSize: "22px", fontWeight: 600, letterSpacing: "-0.5px", marginBottom: "20px" }}>
          Add User
        </h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ background: "var(--sf-red-bg)", color: "var(--sf-red)", fontSize: "13px", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}
            >{error}</motion.div>
          )}
          <div className="form-row">
            <label className="form-label">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-row">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-row">
            <label className="form-label">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-row">
            <label className="form-label">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="form-input">
              <option value="user">User</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", borderRadius: "9999px", marginTop: "4px" }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Creating..." : "Create User"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
