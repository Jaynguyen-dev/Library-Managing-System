import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function UserFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "student" });
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
    <div className="max-w-lg mx-auto">
      <h1 className="text-display-md mb-6">Add User</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-hairline">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-caption text-ink-muted-80 mb-1">Full Name</label>
          <input name="full_name" value={form.full_name} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
        </div>
        <div className="mb-4">
          <label className="block text-caption text-ink-muted-80 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
        </div>
        <div className="mb-4">
          <label className="block text-caption text-ink-muted-80 mb-1">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
        </div>
        <div className="mb-6">
          <label className="block text-caption text-ink-muted-80 mb-1">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition bg-white">
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-pill py-3 text-body font-medium hover:bg-primary-focus transition active:scale-[0.98] disabled:opacity-50">
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
