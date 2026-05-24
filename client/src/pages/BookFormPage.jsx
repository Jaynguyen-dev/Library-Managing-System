import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ title: "", author: "", isbn: "", category: "", total_quantity: 1 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/books/${id}`).then(({ data }) => {
        const b = data.data.book;
        setForm({ title: b.title, author: b.author, isbn: b.isbn, category: b.category, total_quantity: b.total_quantity });
      }).catch(console.error);
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/books/${id}`, form);
      } else {
        const { data } = await api.post("/api/books", form);
        api.post(`/api/crawl/isbn/${form.isbn}`).catch(() => {});
      }
      navigate("/books");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-display-md mb-6">{isEdit ? "Edit Book" : "Add Book"}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-hairline">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}
        {["title", "author", "isbn", "category"].map((field) => (
          <div className="mb-4" key={field}>
            <label className="block text-caption text-ink-muted-80 mb-1 capitalize">{field.replace("_", " ")}</label>
            <input name={field} value={form[field]} onChange={handleChange} className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
          </div>
        ))}
        <div className="mb-6">
          <label className="block text-caption text-ink-muted-80 mb-1">Total Quantity</label>
          <input type="number" name="total_quantity" value={form.total_quantity} onChange={handleChange} min="1" className="w-full px-4 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary text-white rounded-pill py-3 text-body font-medium hover:bg-primary-focus transition active:scale-[0.98] disabled:opacity-50">
          {loading ? "Saving..." : isEdit ? "Update Book" : "Add Book"}
        </button>
      </form>
    </div>
  );
}
