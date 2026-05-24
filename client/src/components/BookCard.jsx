import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const DEFAULT_COVER = "/default-cover.svg";
const OPEN_LIB_COVERS = "https://covers.openlibrary.org/b/isbn";

export default function BookCard({ book, isStaff, onDelete, onBorrow, onReserve, userReservation }) {
  const [useFallback, setUseFallback] = useState(0);

  const coverSources = [
    book.metadata?.cover_image_url,
    book.isbn && `${OPEN_LIB_COVERS}/${book.isbn}-L.jpg`,
    DEFAULT_COVER,
  ].filter(Boolean);

  const currentSrc = coverSources[useFallback] || DEFAULT_COVER;

  const isUnavailable = book.available_quantity === 0;

  const availabilityLabel = `${book.available_quantity}/${book.total_quantity}`;
  const availabilityClass =
    book.available_quantity === 0 ? "badge-red"
    : book.available_quantity < book.total_quantity ? "badge-amber"
    : "badge-green";

  const handleCardClick = () => {
    if (isUnavailable && onReserve) {
      onReserve(book);
    } else if (!isUnavailable && onBorrow) {
      onBorrow(book);
    }
  };

  return (
    <motion.div
      className="book-card"
      style={{ cursor: onBorrow || onReserve ? "pointer" : "default" }}
      whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={isStaff ? undefined : handleCardClick}
    >
      {isStaff ? (
        <Link
          to={`/books/${book.id}/edit`}
          style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flex: 1 }}
        >
          <CardContent
            book={book}
            currentSrc={currentSrc}
            useFallback={useFallback}
            setUseFallback={setUseFallback}
            coverSources={coverSources}
            availabilityLabel={availabilityLabel}
            availabilityClass={availabilityClass}
            isStaff={isStaff}
            onDelete={onDelete}
          />
        </Link>
      ) : (
        <div
          style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", flex: 1 }}
        >
          <CardContent
            book={book}
            currentSrc={currentSrc}
            useFallback={useFallback}
            setUseFallback={setUseFallback}
            coverSources={coverSources}
            availabilityLabel={availabilityLabel}
            availabilityClass={availabilityClass}
            isStaff={isStaff}
            onDelete={onDelete}
            isUnavailable={isUnavailable}
            userReservation={userReservation}
            onReserve={onReserve}
          />
        </div>
      )}
    </motion.div>
  );
}

function CardContent({ book, currentSrc, setUseFallback, coverSources, availabilityLabel, availabilityClass, isStaff, onDelete, isUnavailable, userReservation, onReserve }) {
  return (
    <>
      <div className="book-card-cover-wrap">
        <motion.img
          className="book-card-cover"
          src={currentSrc}
          alt={`Cover of ${book.title}`}
          onError={() => setUseFallback((prev) => Math.min(prev + 1, coverSources.length - 1))}
          onLoad={(e) => { if (currentSrc === "/default-cover.svg") e.currentTarget.style.objectFit = "contain"; }}
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
        {userReservation && (
          <motion.span
            className={`reservation-badge ${userReservation.status === "notified" ? "badge-blue" : "badge-gray"}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {userReservation.status === "notified" ? "Available — Borrow Now" : `Reserved #${userReservation.queue_position || "?"}`}
          </motion.span>
        )}
        {isUnavailable && !userReservation && (
          <motion.span
            className="reservation-badge badge-red"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Unavailable
          </motion.span>
        )}
      </div>
      <div className="book-card-body">
        <div className="book-card-title" title={book.title}>
          {book.title}
        </div>
        <div className="book-card-author" title={book.author}>
          {book.author}
        </div>
        <div className="book-card-meta">
          <span className={`badge ${book.category ? "badge-blue" : "badge-gray"}`}>
            <i className="ti ti-tag" style={{ fontSize: "10px" }}></i>
            {book.category || "Uncategorized"}
          </span>
          <span className={`badge ${availabilityClass}`} title={`${book.available_quantity} of ${book.total_quantity} available`}>
            <i className={`ti ti-${book.available_quantity > 0 ? "check" : "x"}`} style={{ fontSize: "10px" }}></i>
            {availabilityLabel}
          </span>
          {isStaff && (
            <div className="book-card-actions" onClick={(e) => e.stopPropagation()}>
              <Link to={`/books/${book.id}/edit`} className="icon-btn" title="Edit" onClick={(e) => e.stopPropagation()}>
                <i className="ti ti-edit"></i>
              </Link>
              <motion.button
                className="icon-btn"
                title="Delete"
                whileHover={{ color: "#DC2626", borderColor: "#DC2626" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(book.id);
                }}
              >
                <i className="ti ti-trash"></i>
              </motion.button>
            </div>
          )}
          {!isStaff && isUnavailable && !userReservation && onReserve && (
            <motion.button
              className="btn btn-sm btn-ghost"
              onClick={(e) => {
                e.stopPropagation();
                onReserve(book);
              }}
              style={{ width: "100%", marginTop: "6px", fontSize: "12px" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <i className="ti ti-clock" aria-hidden="true"></i> Reserve
            </motion.button>
          )}
          {!isStaff && isUnavailable && userReservation?.status === "waiting" && (
            <span className="badge badge-gray" style={{ width: "100%", marginTop: "6px", textAlign: "center" }}>
              <i className="ti ti-clock"></i> In Queue (#{userReservation.queue_position})
            </span>
          )}
          {!isStaff && isUnavailable && userReservation?.status === "notified" && (
            <span className="badge badge-blue" style={{ width: "100%", marginTop: "6px", textAlign: "center" }}>
              <i className="ti ti-bell"></i> Available — Visit Library
            </span>
          )}
        </div>
      </div>
    </>
  );
}
