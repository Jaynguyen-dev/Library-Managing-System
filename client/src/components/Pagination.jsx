export default function Pagination({ page, pages, total, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="pagination-wrap">
      <span className="pagination-info">
        Page {page} of {pages} ({total} total)
      </span>
      <div className="pagination-actions">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn btn-ghost btn-sm"
        >
          <i className="ti ti-chevron-left"></i> Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="btn btn-ghost btn-sm"
        >
          Next <i className="ti ti-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
