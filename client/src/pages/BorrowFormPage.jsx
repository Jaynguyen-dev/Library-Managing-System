import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function BorrowFormPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form, setForm] = useState({ user_id: "", items: [{ book_id: "", quantity: 1 }] });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/api/users?role=student"),
      api.get("/api/books"),
    ]).then(([usersRes, booksRes]) => {
      if (cancelled) return;
      setUsers(usersRes.data.data.users || []);
      const allBooks = booksRes.data.data.books || [];
      setBooks(allBooks.filter((b) => b.available_quantity > 0));
    }).catch((err) => {
      if (cancelled) return;
      toast.error(err.response?.data?.message || "Failed to load form data");
    }).finally(() => {
      if (!cancelled) setInitialLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const addItem = () => {
    if (form.items.length >= 3) return;
    setForm({ ...form, items: [...form.items, { book_id: "", quantity: 1 }] });
  };
  const updateItem = (idx, field, val) => {
    const items = form.items.map((item, i) => (i === idx ? { ...item, [field]: val } : item));
    setForm({ ...form, items });
  };
  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const uid = parseInt(form.user_id, 10);
    if (!uid || isNaN(uid)) { setError("Please select a student"); return; }
    if (form.items.some((i) => !i.book_id)) { setError("Please select a book for each item"); return; }
    setSaving(true);
    try {
      await api.post("/api/borrows", { user_id: uid, items: form.items });
      toast.success("Borrow record created");
      navigate("/borrows");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create borrow");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>
        <i className="ti ti-loader" style={{ fontSize: "24px", animation: "spin 1s linear infinite", display: "block", marginBottom: "12px" }}></i>
        Loading form…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="form-card">
        <h1 style={{ fontSize: "22px", fontWeight: 500, letterSpacing: "-0.5px", marginBottom: "20px" }}>
          New Borrow
        </h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "#FFF0EF", color: "#991B1B", fontSize: "13px", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>
          )}
          <div className="form-row">
            <label className="form-label">Student</label>
            <select
              className="form-input"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              required
            >
              <option value="">Select student…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Books (max 3)</label>
            {form.items.map((item, idx) => (
              <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <select
                  className="form-input"
                  value={item.book_id}
                  onChange={(e) => updateItem(idx, "book_id", parseInt(e.target.value, 10) || "")}
                  required
                  style={{ flex: 1 }}
                >
                  <option value="">Select book…</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>{b.title} ({b.available_quantity} available)</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="form-input"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), 3))}
                  min="1" max="3"
                  style={{ width: "70px", flexShrink: 0 }}
                />
                <button type="button" onClick={() => removeItem(idx)} style={{ color: "var(--sf-red)", fontSize: "18px", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
                  <i className="ti ti-x"></i>
                </button>
              </div>
            ))}
            {form.items.length < 3 && (
              <button type="button" onClick={addItem} style={{ color: "var(--sf-accent)", fontSize: "13px", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                <i className="ti ti-plus" style={{ marginRight: "4px" }}></i>Add book
              </button>
            )}
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", borderRadius: "10px", marginTop: "4px" }}>
            {saving ? "Creating…" : "Create Borrow"}
          </button>
        </form>
      </div>
    </div>
  );
}
