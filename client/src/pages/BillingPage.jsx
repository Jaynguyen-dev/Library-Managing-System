import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";
import Pagination from "../components/Pagination";

function PayModal({ fine, onClose, onPaid }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/api/fines/${fine.id}/pay`);
      toast.success("Payment recorded");
      onPaid();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const bookTitle = fine.borrow_record?.items?.[0]?.book?.title || fine.reason || "-";
  const daysOverdue = fine.borrow_record?.due_date
    ? Math.ceil((new Date(fine.created_at || new Date()) - new Date(fine.borrow_record.due_date)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Payment</h3>
          <button className="icon-btn" onClick={onClose}><i className="ti ti-x"></i></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <label className="form-label">Member</label>
            <div style={{ fontWeight: 500 }}>{fine.user?.full_name}</div>
          </div>
          <div className="form-row">
            <label className="form-label">Book</label>
            <div>{bookTitle}</div>
          </div>
          {daysOverdue && (
            <div className="form-row">
              <label className="form-label">Overdue</label>
              <div>{daysOverdue} days</div>
            </div>
          )}
          <div className="form-row">
            <label className="form-label">Fine Amount</label>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--sf-red)" }}>{formatCurrency(fine.amount)}</div>
          </div>
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--sf-bg-2)", borderRadius: "8px", fontSize: "13px", color: "var(--sf-text-2)" }}>
            <i className="ti ti-info-circle" style={{ marginRight: "6px" }}></i>
            This will record the payment with a timestamp and mark the fine as paid.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Processing…" : `Pay ${formatCurrency(fine.amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const [fines, setFines] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paidFilter, setPaidFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [payingFine, setPayingFine] = useState(null);

  const fetchData = (p, filter) => {
    setLoading(true);
    const params = { page: p || 1, limit: 20 };
    if (filter !== "") params.is_paid = filter;
    api.get("/api/fines", { params })
      .then(({ data }) => {
        setFines(data.data.fines);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load fines"))
      .finally(() => setLoading(false));

    api.get("/api/fines/revenue")
      .then(({ data }) => setRevenue(data.data))
      .catch(() => {});
  };

  useEffect(() => { fetchData(1, ""); }, []);

  const handleFilter = (filter) => {
    setPaidFilter(filter);
    setPage(1);
    fetchData(1, filter);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchData(p, paidFilter);
  };

  const handlePaid = () => fetchData(page, paidFilter);

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Billing & Revenue</span>
      </div>

      {revenue && (
        <div className="stat-grid" style={{ marginBottom: "16px" }}>
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-val">{formatCurrency(revenue.totalRevenue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Collected</div>
            <div className="stat-val" style={{ color: "var(--sf-green)" }}>{formatCurrency(revenue.paidRevenue)}</div>
            <div className="stat-sub">{revenue.paidCount} paid fines</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Outstanding</div>
            <div className="stat-val" style={{ color: "var(--sf-red)" }}>{formatCurrency(revenue.unpaidRevenue)}</div>
            <div className="stat-sub">{revenue.unpaidCount} unpaid fines</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Collection Rate</div>
            <div className="stat-val">
              {revenue.totalRevenue > 0
                ? `${Math.round((revenue.paidRevenue / revenue.totalRevenue) * 100)}%`
                : "—"}
            </div>
          </div>
        </div>
      )}

      <div className="tab-bar" style={{ marginBottom: "14px" }}>
        {["", "false", "true"].map((v) => (
          <button
            key={v}
            className={`tab${paidFilter === v ? " active" : ""}`}
            onClick={() => handleFilter(v)}
          >{v === "" ? "All" : v === "false" ? "Unpaid" : "Paid"}</button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>Loading…</div>
      ) : fines.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>No fines found.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Paid At</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => {
                const bookTitle = f.borrow_record?.items?.[0]?.book?.title || f.reason || "-";
                return (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 500 }}>{f.user?.full_name}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bookTitle}</td>
                    <td>{formatCurrency(f.amount)}</td>
                    <td>
                      <span className={`badge ${f.is_paid ? "badge-green" : "badge-red"}`}>
                        {f.is_paid ? "PAID" : "UNPAID"}
                      </span>
                    </td>
                    <td style={{ color: "var(--sf-text-2)", fontSize: "13px" }}>
                      {f.paid_at ? formatDate(f.paid_at) : "—"}
                    </td>
                    <td>
                      {!f.is_paid ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setPayingFine(f)}>
                          <i className="ti ti-credit-card" style={{ marginRight: "4px" }}></i>Collect
                        </button>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--sf-text-2)" }}>
                          <i className="ti ti-check" style={{ marginRight: "2px" }}></i>Paid
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page || page} pages={pagination.pages} total={pagination.total} onPageChange={handlePageChange} />

      {payingFine && (
        <PayModal fine={payingFine} onClose={() => setPayingFine(null)} onPaid={handlePaid} />
      )}
    </div>
  );
}
