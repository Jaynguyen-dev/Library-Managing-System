import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function BorrowModal({ book, onClose, onBorrowed }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef(null);
  const confirmRef = useRef(null);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    confirmRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBorrow = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.post("/api/borrows/self", { book_id: book.id });
      toast.success(`"${book.title}" borrowed successfully`);
      onBorrowed(book.id);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to borrow book";
      setError(msg);
      if (msg.includes("not available")) {
        onBorrowed(book.id);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const coverSrc = book.metadata?.cover_image_url
    || (book.isbn && `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`)
    || "/default-cover.svg";

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Borrow book"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <h3>Borrow Book</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">
          <p style={{ margin: "0 0 16px", fontSize: "14px", color: "var(--sf-text-2)" }}>
            Do you want to borrow this book?
          </p>

          {error && (
            <div style={{ background: "#FFF0EF", color: "#991B1B", fontSize: "13px", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>
          )}

          <div className="borrow-modal-book">
            <img
              src={coverSrc}
              alt={book.title}
              className="borrow-modal-cover"
              onError={(e) => { e.currentTarget.src = "/default-cover.svg"; }}
            />
            <div className="borrow-modal-info">
              <div className="borrow-modal-title">{book.title}</div>
              <div className="borrow-modal-author">{book.author}</div>
              {book.category && (
                <span className="badge badge-blue" style={{ alignSelf: "flex-start", marginTop: "2px" }}>{book.category}</span>
              )}
            </div>
          </div>

          <div className="borrow-modal-details">
            <div className="form-row">
              <label className="form-label">Available Copies</label>
              <div className={`borrow-modal-stat ${book.available_quantity <= 0 ? "low" : "ok"}`}>
                {book.available_quantity} / {book.total_quantity}
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Due Date</label>
              <div className="borrow-modal-stat" style={{ fontSize: "16px" }}>
                {dueDate.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                <span style={{ fontSize: "12px", color: "var(--sf-text-2)", marginLeft: "8px", fontWeight: 400 }}>(30 days)</span>
              </div>
            </div>
          </div>

          <div style={{ padding: "10px 14px", background: "var(--sf-bg-2)", borderRadius: "8px", fontSize: "13px", color: "var(--sf-text-2)", marginTop: "8px" }}>
            <i className="ti ti-info-circle" style={{ marginRight: "6px" }}></i>
            By confirming, you agree to return this book by the due date. Late returns incur a fine of 2,000 VND per day.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            ref={confirmRef}
            className="btn btn-primary"
            onClick={handleBorrow}
            disabled={submitting || book.available_quantity <= 0}
          >
            {submitting ? "Processing…" : book.available_quantity <= 0 ? "Unavailable" : "Confirm Borrow"}
          </button>
        </div>
      </div>
    </div>
  );
}
