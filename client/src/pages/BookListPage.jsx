import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function BookListPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "librarian";

  const fetchBooks = async (q) => {
    setLoading(true);
    try {
      const params = q ? { search: q } : {};
      const { data } = await api.get("/api/books", { params });
      setBooks(data.data.books);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await api.delete(`/api/books/${id}`);
      fetchBooks(search);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display-md">Books</h1>
        {isStaff && (
          <a href="/books/new" className="bg-primary text-white rounded-pill px-5 py-2 text-caption hover:bg-primary-focus transition active:scale-[0.98]">
            Add Book
          </a>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          placeholder="Search by title, author, or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-5 py-3 rounded-pill border border-hairline text-body focus:outline-none focus:border-primary transition bg-white"
        />
      </form>

      {loading ? (
        <div className="text-center py-12 text-ink-muted-48">Loading...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 text-ink-muted-48">No books found.</div>
      ) : (
        <div className="grid gap-3">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-lg p-5 border border-hairline flex items-center justify-between">
              <div>
                <h3 className="text-body-strong">{book.title}</h3>
                <p className="text-caption text-ink-muted-48">{book.author} · {book.isbn} · {book.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-caption px-3 py-1 rounded-pill ${book.available_quantity > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {book.available_quantity}/{book.total_quantity}
                </span>
                {isStaff && (
                  <div className="flex gap-2">
                    <a href={`/books/${book.id}/edit`} className="text-primary text-caption hover:underline">Edit</a>
                    <button onClick={() => handleDelete(book.id)} className="text-red-500 text-caption hover:underline">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
