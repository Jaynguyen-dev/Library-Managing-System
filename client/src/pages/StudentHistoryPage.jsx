import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatDate, formatCurrency } from "../utils/format";

function statusBadge(status, isOverdue, dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const effective = status === "active" && now > due ? "overdue" : status;
  const cls = effective === "overdue" ? "badge-red" : effective === "active" ? "badge-amber" : effective === "return_pending" ? "badge-blue" : "badge-green";
  const label = effective === "return_pending" ? "Pending Return" : effective.charAt(0).toUpperCase() + effective.slice(1);
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function StudentHistoryPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (tab === "active") params.status = "active";
    if (tab === "returned") params.status = "returned";

    api.get("/api/borrows/my", { params }).then(({ data }) => {
      setBorrows(data.data.borrows);
      setLoading(false);
    }).catch(() => {
      toast.error("Failed to load history");
      setLoading(false);
    });
  }, [tab]);

  const canReturn = (b) => b.status === "active";

  const doReturn = async () => {
    const id = returningId;
    if (!id) return;
    try {
      const { data } = await api.post(`/api/borrows/${id}/request-return`);
      if (data.success) {
        toast.success("Return requested. Please bring the book to the librarian.");
        setBorrows((prev) => prev.map((b) => b.id === id ? { ...b, ...data.data.borrow, status: "return_pending" } : b));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request return");
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">My Borrows</span>
      </div>

      <div className="tab-bar" style={{ marginBottom: "14px" }}>
        {["active", "returned"].map((t) => (
          <button
            key={t}
            className={`tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >{t === "active" ? "Active" : "History"}</button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>Loading…</div>
      ) : borrows.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>
          {tab === "active" ? "You have no active borrows." : "No history yet."}
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Status</th>
                {tab === "active" && <th></th>}
              </tr>
            </thead>
            <tbody>
              {borrows.map((b) => {
                const totalFine = b.fines?.reduce((s, f) => s + f.amount, 0) || 0;
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 500 }}>{b.items?.map((i) => i.book?.title).join(", ")}</td>
                    <td style={{ color: "var(--sf-text-2)" }}>{formatDate(b.borrow_date)}</td>
                    <td style={{ color: "var(--sf-text-2)" }}>{formatDate(b.due_date)}</td>
                    <td style={{ color: "var(--sf-text-2)" }}>{b.return_date ? formatDate(b.return_date) : "—"}</td>
                    <td>{totalFine > 0 ? formatCurrency(totalFine) : "0 ₫"}</td>
                    <td>{statusBadge(b.status, b.is_overdue, b.due_date)}</td>
                    {tab === "active" && (
                      <td>
                        {canReturn(b) ? (
                          <button className="btn btn-primary btn-sm" onClick={() => setReturningId(b.id)}>
                            Return
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--sf-text-2)" }}>
                            {b.status === "return_pending" ? "Awaiting confirmation" : ""}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {returningId && (
        <div className="modal-overlay" onClick={() => setReturningId(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <h3>Return Book</h3>
              <button className="icon-btn" onClick={() => setReturningId(null)}>
                <i className="ti ti-x"></i>
              </button>
            </div>
            <div className="confirm-modal-body">
              <p>Are you sure you want to request a return for this book?</p>
              <p style={{ fontSize: "13px", color: "var(--sf-text-2)" }}>
                Once submitted, please bring the book to the librarian to complete the return process.
              </p>
            </div>
            <div className="confirm-modal-footer">
              <button className="btn btn-ghost" onClick={() => setReturningId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={doReturn}>Request Return</button>
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
