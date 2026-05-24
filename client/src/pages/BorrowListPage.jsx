import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatDate } from "../utils/format";
import Pagination from "../components/Pagination";

function statusBadge(status, isOverdue) {
  const effective = status === "active" && isOverdue ? "overdue" : status;
  const cls = effective === "overdue" ? "badge-red" : effective === "active" ? "badge-amber" : effective === "return_pending" ? "badge-blue" : "badge-green";
  const label = effective === "return_pending" ? "Pending Return" : effective.charAt(0).toUpperCase() + effective.slice(1);
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function BorrowListPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    const params = { page: 1, limit: 20 };
    api.get("/api/borrows", { params })
      .then(({ data }) => {
        setBorrows(data.data.borrows);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load borrows"))
      .finally(() => setLoading(false));
  }, []);

  const fetchData = (s, p) => {
    setLoading(true);
    const params = { page: p || 1, limit: 20 };
    if (s) params.status = s;
    api.get("/api/borrows", { params })
      .then(({ data }) => {
        setBorrows(data.data.borrows);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load borrows"))
      .finally(() => setLoading(false));
  };

  const handleStatusFilter = (s) => {
    setStatusFilter(s);
    setPage(1);
    fetchData(s, 1);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchData(statusFilter, p);
  };

  const handleConfirmReturn = async (id) => {
    setConfirmingId(id);
  };

  const doConfirmReturn = async () => {
    const id = confirmingId;
    if (!id) return;
    try {
      const { data } = await api.patch(`/api/borrows/${id}/confirm-return`);
      if (data.success) {
        toast.success("Return confirmed");
        fetchData(statusFilter, page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm return");
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="section-title">Borrow Records</span>
          <div className="tab-bar">
            {["", "active", "return_pending", "returned", "overdue"].map((s) => (
              <button
                key={s}
                className={`tab${statusFilter === s ? " active" : ""}`}
                onClick={() => handleStatusFilter(s)}
              >{s === "return_pending" ? "Pending" : s || "All"}</button>
            ))}
          </div>
        </div>
        <Link to="/borrows/new" className="btn btn-primary">
          <i className="ti ti-plus" aria-hidden="true"></i> New Borrow
        </Link>
      </div>

      {loading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>Loading…</div>
      ) : borrows.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>No borrow records found.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Books</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {borrows.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500 }}>{b.user?.full_name}</td>
                  <td>
                    {b.items?.[0]?.book?.title || "-"}
                    {b.items?.length > 1 && <span style={{ color: "var(--sf-text-2)" }}> +{b.items.length - 1} more</span>}
                  </td>
                  <td style={{ color: "var(--sf-text-2)" }}>{formatDate(b.borrow_date)}</td>
                  <td style={{ color: "var(--sf-text-2)" }}>{formatDate(b.due_date)}</td>
                  <td>{statusBadge(b.status, b.is_overdue)}</td>
                  <td>
                    {b.status === "return_pending" ? (
                      <button className="btn btn-primary btn-sm" onClick={() => handleConfirmReturn(b.id)}>
                        Confirm Return
                      </button>
                    ) : b.status === "active" ? (
                      <Link to={`/borrows/${b.id}/return`} className="btn btn-ghost btn-sm">Return</Link>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--sf-text-2)" }}>Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page || page} pages={pagination.pages} total={pagination.total} onPageChange={handlePageChange} />

      {confirmingId && (
        <div className="modal-overlay" onClick={() => setConfirmingId(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Confirm Return</h3>
              <button className="icon-btn" onClick={() => setConfirmingId(null)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="confirm-modal-body">
              <p>Are you sure you want to confirm this return?</p>
              <p style={{ fontSize: "13px", color: "var(--sf-text-2)" }}>
                The book will be marked as returned and the inventory will be updated.
                {borrows.find((b) => b.id === confirmingId)?.is_overdue && (
                  <span style={{ color: "var(--sf-red)" }}> This borrow is overdue — a fine will be applied.</span>
                )}
              </p>
            </div>
            <div className="confirm-modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmingId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={doConfirmReturn}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .confirm-modal {
          background: #fff;
          border-radius: 12px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
          animation: modalFadeIn 0.2s ease;
        }
        .confirm-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px 0;
        }
        .confirm-modal-header h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 600;
        }
        .confirm-modal-body {
          padding: 16px 20px;
        }
        .confirm-modal-body p {
          margin: 0 0 8px;
          font-size: 14px;
          line-height: 1.5;
        }
        .confirm-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px 18px;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
