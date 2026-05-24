import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatDate, formatCurrency } from "../utils/format";

export default function ReturnPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [borrow, setBorrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/api/borrows/${id}`)
      .then(({ data }) => { setBorrow(data.data.borrow); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleReturn = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.patch(`/api/borrows/${id}/return`);
      navigate("/borrows");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process return");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: "48px", color: "var(--sf-text-2)" }}>Loading…</div>;
  if (!borrow) return <div style={{ textAlign: "center", padding: "48px", color: "var(--sf-text-2)" }}>Borrow record not found.</div>;

  const overdue = new Date() > new Date(borrow.due_date);
  const daysOverdue = overdue ? Math.ceil((new Date() - new Date(borrow.due_date)) / (1000 * 60 * 60 * 24)) : 0;
  const fineAmount = daysOverdue * 2000;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="form-card">
        <h1 style={{ fontSize: "22px", fontWeight: 500, letterSpacing: "-0.5px", marginBottom: "20px" }}>
          Confirm Return
        </h1>
        {error && (
          <div style={{ background: "#FFF0EF", color: "#991B1B", fontSize: "13px", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>{error}</div>
        )}
        <div className="form-row">
          <label className="form-label">Student</label>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>{borrow.user?.full_name}</div>
        </div>
        <div className="form-row">
          <label className="form-label">Books</label>
          <div style={{ fontSize: "14px" }}>{borrow.items?.map((i) => i.book?.title).join(", ")}</div>
        </div>
        <div className="form-row">
          <label className="form-label">Borrow Date</label>
          <div style={{ fontSize: "14px" }}>{formatDate(borrow.borrow_date)}</div>
        </div>
        <div className="form-row">
          <label className="form-label">Due Date</label>
          <div style={{ fontSize: "14px" }}>{formatDate(borrow.due_date)}</div>
        </div>
        {overdue && (
          <div style={{ background: "#FFF0EF", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
            <div style={{ fontWeight: 500, color: "#991B1B" }}>Overdue by {daysOverdue} days</div>
            <div style={{ fontSize: "14px", color: "var(--sf-red)" }}>Fine: {formatCurrency(fineAmount)}</div>
          </div>
        )}
        <button onClick={handleReturn} disabled={submitting} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", borderRadius: "10px" }}>
          {submitting ? "Processing…" : "Confirm Return"}
        </button>
      </div>
    </div>
  );
}
