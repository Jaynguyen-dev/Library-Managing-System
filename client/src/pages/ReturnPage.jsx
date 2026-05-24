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
    api.get("/api/borrows").then(({ data }) => {
      const b = data.data.borrows.find((br) => br.id === parseInt(id));
      setBorrow(b);
      setLoading(false);
    }).catch(() => setLoading(false));
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

  if (loading) return <div className="text-center py-12 text-ink-muted-48">Loading...</div>;
  if (!borrow) return <div className="text-center py-12 text-ink-muted-48">Borrow record not found.</div>;

  const overdue = new Date() > new Date(borrow.due_date);
  const daysOverdue = overdue ? Math.ceil((new Date() - new Date(borrow.due_date)) / (1000 * 60 * 60 * 24)) : 0;
  const fineAmount = daysOverdue * 2000;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-display-md mb-6">Confirm Return</h1>
      <div className="bg-white rounded-lg p-8 border border-hairline">
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">{error}</div>}
        <div className="mb-4">
          <p className="text-caption text-ink-muted-80">Student</p>
          <p className="text-body-strong">{borrow.user?.full_name}</p>
        </div>
        <div className="mb-4">
          <p className="text-caption text-ink-muted-80">Books</p>
          <p className="text-body">{borrow.items?.map((i) => i.book?.title).join(", ")}</p>
        </div>
        <div className="mb-4">
          <p className="text-caption text-ink-muted-80">Borrow Date</p>
          <p className="text-body">{formatDate(borrow.borrow_date)}</p>
        </div>
        <div className="mb-4">
          <p className="text-caption text-ink-muted-80">Due Date</p>
          <p className="text-body">{formatDate(borrow.due_date)}</p>
        </div>
        {overdue && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <p className="text-body-strong text-red-600">Overdue by {daysOverdue} days</p>
            <p className="text-body text-red-500">Fine: {formatCurrency(fineAmount)}</p>
          </div>
        )}
        <button onClick={handleReturn} disabled={submitting} className="w-full bg-primary text-white rounded-pill py-3 text-body font-medium hover:bg-primary-focus transition active:scale-[0.98] disabled:opacity-50">
          {submitting ? "Processing..." : "Confirm Return"}
        </button>
      </div>
    </div>
  );
}
