import { useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="book-card" style={{ cursor: onBorrow || onReserve ? "pointer" : "default" }}>
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
          onClick={handleCardClick}
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
    </div>
  );
}

function CardContent({ book, currentSrc, setUseFallback, coverSources, availabilityLabel, availabilityClass, isStaff, onDelete, isUnavailable, userReservation, onReserve }) {
  return (
    <>
      <div className="book-card-cover-wrap">
        <img
          className="book-card-cover"
          src={currentSrc}
          alt={`Cover of ${book.title}`}
          onError={() => setUseFallback((prev) => Math.min(prev + 1, coverSources.length - 1))}
          onLoad={(e) => { if (currentSrc === "/default-cover.svg") e.currentTarget.style.objectFit = "contain"; }}
          loading="lazy"
        />
        {userReservation && (
          <span className={`reservation-badge ${userReservation.status === "notified" ? "badge-blue" : "badge-gray"}`}>
            {userReservation.status === "notified" ? "Available — Borrow Now" : `Reserved #${userReservation.queue_position || "?"}`}
          </span>
        )}
        {isUnavailable && !userReservation && (
          <span className="reservation-badge badge-red">Unavailable</span>
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
            {book.category || "Uncategorized"}
          </span>
          <span className={`badge ${availabilityClass}`} title={`${book.available_quantity} of ${book.total_quantity} available`}>
            {availabilityLabel}
          </span>
          {isStaff && (
            <div className="book-card-actions" onClick={(e) => e.stopPropagation()}>
              <Link to={`/books/${book.id}/edit`} className="icon-btn" title="Edit" onClick={(e) => e.stopPropagation()}>
                <i className="ti ti-edit"></i>
              </Link>
              <button
                className="icon-btn"
                title="Delete"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(book.id);
                }}
              >
                <i className="ti ti-trash"></i>
              </button>
            </div>
          )}
          {!isStaff && isUnavailable && !userReservation && onReserve && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={(e) => {
                e.stopPropagation();
                onReserve(book);
              }}
              style={{ width: "100%", marginTop: "6px", fontSize: "12px" }}
            >
              <i className="ti ti-clock" aria-hidden="true"></i> Reserve
            </button>
          )}
          {!isStaff && isUnavailable && userReservation?.status === "waiting" && (
            <span className="badge badge-gray" style={{ width: "100%", marginTop: "6px", textAlign: "center" }}>
              In Queue (#{userReservation.queue_position})
            </span>
          )}
          {!isStaff && isUnavailable && userReservation?.status === "notified" && (
            <span className="badge badge-blue" style={{ width: "100%", marginTop: "6px", textAlign: "center" }}>
              Available — Visit Library
            </span>
          )}
        </div>
      </div>
    </>
  );
}
