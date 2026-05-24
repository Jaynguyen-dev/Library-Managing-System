import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ReserveModal({ book, onClose, onReserved }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleReserve = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post("/api/reservations", { book_id: book.id });
      if (data.success) {
        toast.success(`"${book.title}" reserved successfully`);
        onReserved(book.id, data.data.reservation);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reserve book";
      setError(msg);
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
      aria-label="Reserve book"
    >
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <h3>Reserve Book</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">
          <p style={{ margin: "0 0 16px", fontSize: "14px", color: "var(--sf-text-2)" }}>
            This book is currently unavailable. Do you want to reserve it? You will be notified when it becomes available again.
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
              <label className="form-label">Availability</label>
              <div className="borrow-modal-stat" style={{ color: "var(--sf-red)" }}>
                {book.available_quantity} / {book.total_quantity} — Currently Unavailable
              </div>
            </div>
          </div>

          <div style={{ padding: "10px 14px", background: "var(--sf-bg-2)", borderRadius: "8px", fontSize: "13px", color: "var(--sf-text-2)", marginTop: "8px" }}>
            <i className="ti ti-info-circle" style={{ marginRight: "6px" }}></i>
            Once a copy becomes available, you will receive a notification. You will have 48 hours to borrow it before the reservation expires.
          </div>
        </div>
        <div className="modal-footer">
          <button ref={cancelRef} className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleReserve}
            disabled={submitting}
          >
            {submitting ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <i className="ti ti-loader" style={{ animation: "spin 1s linear infinite" }}></i>
                Reserving…
              </span>
            ) : "Confirm Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}
