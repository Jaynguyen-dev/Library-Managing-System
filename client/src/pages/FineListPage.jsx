import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency, formatDate } from "../utils/format";
import Pagination from "../components/Pagination";

function PayModal({ fine, onClose, onPaid }) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await api.patch(`/api/fines/${fine.id}/pay`);
      toast.success("Payment recorded successfully");
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
              <label className="form-label">Overdue Days</label>
              <div>{daysOverdue} days</div>
            </div>
          )}
          <div className="form-row">
            <label className="form-label">Amount</label>
            <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--sf-red)" }}>{formatCurrency(fine.amount)}</div>
          </div>
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "var(--sf-bg-2)", borderRadius: "8px", fontSize: "13px", color: "var(--sf-text-2)" }}>
            Marking this fine as paid will record the payment timestamp and who processed it.
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

export default function FineListPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "librarian";

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paidFilter, setPaidFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [totalUnpaid, setTotalUnpaid] = useState(0);
  const [payingFine, setPayingFine] = useState(null);
  const [revenue, setRevenue] = useState(null);

  const endpoint = isStaff ? "/api/fines" : "/api/fines/my";

  useEffect(() => {
    const params = { page: 1, limit: 20 };
    if (paidFilter !== "") params.is_paid = paidFilter;
    api.get(endpoint, { params })
      .then(({ data }) => {
        setFines(data.data.fines);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
        const unpaid = data.data.fines.filter((f) => !f.is_paid).reduce((s, f) => s + f.amount, 0);
        setTotalUnpaid(unpaid);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load fines"))
      .finally(() => setLoading(false));

    if (isStaff) {
      api.get("/api/fines/revenue")
        .then(({ data }) => setRevenue(data.data))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaidFilter = (paid) => {
    if (!isStaff) return;
    setPaidFilter(paid);
    setPage(1);
    setLoading(true);
    const params = { page: 1, limit: 20 };
    if (paid !== "") params.is_paid = paid;
    api.get(endpoint, { params })
      .then(({ data }) => {
        setFines(data.data.fines);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
        const unpaid = data.data.fines.filter((f) => !f.is_paid).reduce((s, f) => s + f.amount, 0);
        setTotalUnpaid(unpaid);
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load fines"))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (p) => {
    setPage(p);
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (isStaff && paidFilter !== "") params.is_paid = paidFilter;
    api.get(endpoint, { params })
      .then(({ data }) => {
        setFines(data.data.fines);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load fines"))
      .finally(() => setLoading(false));
  };

  const handlePaid = () => {
    handlePaidFilter(paidFilter);
    if (isStaff) {
      api.get("/api/fines/revenue")
        .then(({ data }) => setRevenue(data.data))
        .catch(() => {});
    }
  };

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Fines & Billing</span>
        {isStaff && revenue && (
          <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "var(--sf-text-2)" }}>
            <span>Collected: <strong style={{ color: "var(--sf-green)" }}>{formatCurrency(revenue.paidRevenue)}</strong></span>
            <span>Unpaid: <strong style={{ color: "var(--sf-red)" }}>{formatCurrency(revenue.unpaidRevenue)}</strong></span>
            <span>Total: <strong>{formatCurrency(revenue.totalRevenue)}</strong></span>
          </div>
        )}
      </div>

      {isStaff && (
        <div className="tab-bar" style={{ marginBottom: "14px" }}>
          {["", "false", "true"].map((v) => (
            <button
              key={v}
              className={`tab${paidFilter === v ? " active" : ""}`}
              onClick={() => handlePaidFilter(v)}
            >{v === "" ? "All" : v === "false" ? "Unpaid" : "Paid"}</button>
          ))}
        </div>
      )}

      {!isStaff && totalUnpaid > 0 && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <div className="stat-card" style={{ flex: 1 }}>
            <div className="stat-label">Total Unpaid Fines</div>
            <div className="stat-val" style={{ color: "var(--sf-red)" }}>{formatCurrency(totalUnpaid)}</div>
          </div>
          <div className="stat-card" style={{ flex: 1 }}>
            <div className="stat-label">Outstanding Items</div>
            <div className="stat-val">{fines.filter((f) => !f.is_paid).length}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>Loading…</div>
      ) : fines.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>
          {isStaff ? "No fines found." : "You have no fines. All clear!"}
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                {isStaff && <th>Member</th>}
                <th>Book</th>
                {isStaff && <th>Overdue Days</th>}
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Paid At</th>
                {isStaff && <th></th>}
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => {
                const bookTitle = f.borrow_record?.items?.[0]?.book?.title || f.reason || "-";
                const daysOverdue = f.borrow_record?.due_date
                  ? Math.ceil((new Date(f.created_at || new Date()) - new Date(f.borrow_record.due_date)) / (1000 * 60 * 60 * 24))
                  : null;
                return (
                  <tr key={f.id}>
                    {isStaff && <td style={{ fontWeight: 500 }}>{f.user?.full_name}</td>}
                    <td>{bookTitle}</td>
                    {isStaff && <td style={{ color: "var(--sf-text-2)" }}>{daysOverdue ? `${daysOverdue} days` : "-"}</td>}
                    <td>{formatCurrency(f.amount)}</td>
                    <td>
                      <span className={`badge ${f.is_paid ? "badge-green" : "badge-red"}`}>
                        {f.is_paid ? "PAID" : "UNPAID"}
                      </span>
                    </td>
                    <td style={{ color: "var(--sf-text-2)", fontSize: "13px" }}>
                      {f.paid_at ? formatDate(f.paid_at) : "—"}
                    </td>
                    {isStaff && (
                      <td>
                        {!f.is_paid ? (
                          <button className="btn btn-ghost btn-sm" onClick={() => setPayingFine(f)}>
                            <i className="ti ti-credit-card" style={{ marginRight: "4px" }}></i>Collect Payment
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--sf-text-2)" }}>
                            <i className="ti ti-check" style={{ marginRight: "2px" }}></i>Paid
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

      <Pagination page={pagination.page || page} pages={pagination.pages} total={pagination.total} onPageChange={handlePageChange} />

      {payingFine && (
        <PayModal fine={payingFine} onClose={() => setPayingFine(null)} onPaid={handlePaid} />
      )}
    </div>
  );
}
