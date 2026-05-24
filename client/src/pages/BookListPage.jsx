import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import BookCard from "../components/BookCard";
import BorrowModal from "../components/BorrowModal";
import ReserveModal from "../components/ReserveModal";
import Pagination from "../components/Pagination";

function SkeletonGrid() {
  return (
    <div className="book-grid-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="book-skeleton-card">
          <div className="book-skeleton-img"></div>
          <div className="book-skeleton-line"></div>
          <div className="book-skeleton-line short"></div>
          <div style={{ height: "8px" }}></div>
        </div>
      ))}
    </div>
  );
}

export default function BookListPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [borrowingBook, setBorrowingBook] = useState(null);
  const [reservingBook, setReservingBook] = useState(null);
  const [userReservations, setUserReservations] = useState({});
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "librarian";

  const fetchBooks = (queryTab, queryPage, querySearch) => {
    const params = { page: queryPage || 1, limit: 20 };
    const effectiveTab = queryTab || tab;
    if (effectiveTab === "available") params.available = "true";
    if (effectiveTab === "borrowed") params.available = "false";
    if (querySearch) params.search = querySearch;
    api.get("/api/books", { params })
      .then(({ data }) => {
        setBooks(data.data.books);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load books"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks(tab, 1, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search]);

  useEffect(() => {
    if (user?.role === "student") {
      api.get("/api/reservations/my")
        .then(({ data }) => {
          const map = {};
          (data.data.reservations || []).forEach((r) => {
            map[r.book_id] = { status: r.status, queue_position: r.queue_position, id: r.id };
          });
          setUserReservations(map);
        })
        .catch(() => {});
    }
  }, [user?.role]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handlePageChange = (p) => {
    setPage(p);
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (tab === "available") params.available = "true";
    if (tab === "borrowed") params.available = "false";
    if (search) params.search = search;
    api.get("/api/books", { params })
      .then(({ data }) => {
        setBooks(data.data.books);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load books"))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await api.delete(`/api/books/${id}`);
      toast.success("Book deleted");
      handlePageChange(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete book");
    }
  };

  const handleBorrow = useCallback((book) => {
    setBorrowingBook(book);
  }, []);

  const handleBorrowed = useCallback((bookId) => {
    setBooks((prev) => prev.map((b) =>
      b.id === bookId
        ? { ...b, available_quantity: Math.max(0, b.available_quantity - 1) }
        : b
    ));
  }, []);

  const handleReserve = useCallback((book) => {
    setReservingBook(book);
  }, []);

  const handleReserved = useCallback((bookId, reservation) => {
    setUserReservations((prev) => ({
      ...prev,
      [bookId]: { status: "waiting", queue_position: reservation?.queue_position, id: reservation?.id },
    }));
  }, []);

  return (
    <div>
      <div className="section-header">
        <div className="tab-bar">
          <button className={`tab${tab === "all" ? " active" : ""}`} onClick={() => handleTabChange("all")}>All Books</button>
          <button className={`tab${tab === "available" ? " active" : ""}`} onClick={() => handleTabChange("available")}>Available</button>
          <button className={`tab${tab === "borrowed" ? " active" : ""}`} onClick={() => handleTabChange("borrowed")}>Borrowed</button>
        </div>
        {isStaff && (
          <Link to="/books/new" className="btn btn-primary">
            <i className="ti ti-plus" aria-hidden="true"></i> Add Book
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} style={{ marginBottom: "16px" }}>
        <div className="search-wrap" style={{ maxWidth: "400px" }}>
          <i className="ti ti-search" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </form>

      {loading ? (
        <SkeletonGrid />
      ) : books.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>
          {search ? "No books match your search." : "No books found."}
        </div>
      ) : (
        <>
          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isStaff={isStaff}
                onDelete={handleDelete}
                onBorrow={isStaff ? undefined : handleBorrow}
                onReserve={isStaff ? undefined : handleReserve}
                userReservation={userReservations[book.id] || null}
              />
            ))}
          </div>
          <Pagination page={pagination.page || page} pages={pagination.pages} total={pagination.total} onPageChange={handlePageChange} />

          {borrowingBook && (
            <BorrowModal
              book={borrowingBook}
              onClose={() => setBorrowingBook(null)}
              onBorrowed={handleBorrowed}
            />
          )}
          {reservingBook && (
            <ReserveModal
              book={reservingBook}
              onClose={() => setReservingBook(null)}
              onReserved={handleReserved}
            />
          )}
        </>
      )}
    </div>
  );
}
