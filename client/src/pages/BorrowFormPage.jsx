import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function BorrowFormPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ user_id: "", items: [{ book_id: "", quantity: 1 }] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/api/users?role=student").then(({ data }) => setUsers(data.data.users)).catch(console.error);
    api.get("/api/books").then(({ data }) => setBooks(data.data.books.filter((b) => b.available_quantity > 0))).catch(console.error);
  }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { book_id: "", quantity: 1 }] });
  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx][field] = val;
    setForm({ ...form, items });
  };
  const removeItem = (idx) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/borrows", form);
      navigate("/borrows");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create borrow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-display-md mb-6">New Borrow</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-hairline">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block text-caption text-ink-muted-80 mb-1">Student</label>
          <select name="user_id" value={form.user_id} onChange={(e) => setForm({ ...form, user_id: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition bg-white" required>
            <option value="">Select student...</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-caption text-ink-muted-80 mb-2">Books (max 3)</label>
          {form.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select value={item.book_id} onChange={(e) => updateItem(idx, "book_id", parseInt(e.target.value))} className="flex-1 px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition bg-white" required>
                <option value="">Select book...</option>
                {books.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.available_quantity} available)</option>)}
              </select>
              <input type="number" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)} min="1" className="w-20 px-3 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" />
              <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-caption px-2">x</button>
            </div>
          ))}
          {form.items.length < 3 && (
            <button type="button" onClick={addItem} className="text-primary text-caption hover:underline">+ Add book</button>
          )}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-pill py-3 text-body font-medium hover:bg-primary-focus transition active:scale-[0.98] disabled:opacity-50">
          {loading ? "Creating..." : "Create Borrow"}
        </button>
      </form>
    </div>
  );
}
