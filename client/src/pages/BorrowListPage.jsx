import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDate, formatCurrency } from "../utils/format";

export default function BorrowListPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBorrows = async (status) => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const { data } = await api.get("/api/borrows", { params });
      setBorrows(data.data.borrows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBorrows(); }, []);

  const statusBadge = (status) => {
    const colors = { active: "bg-blue-50 text-blue-600", returned: "bg-green-50 text-green-600", overdue: "bg-red-50 text-red-600" };
    return <span className={`text-caption px-3 py-1 rounded-pill ${colors[status] || "bg-gray-50"}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display-md">Borrows</h1>
        <a href="/borrows/new" className="bg-primary text-white rounded-pill px-5 py-2 text-caption hover:bg-primary-focus transition active:scale-[0.98]">New Borrow</a>
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-muted-48">Loading...</div>
      ) : borrows.length === 0 ? (
        <div className="text-center py-12 text-ink-muted-48">No borrow records found.</div>
      ) : (
        <div className="grid gap-3">
          {borrows.map((b) => (
            <div key={b.id} className="bg-white rounded-lg p-5 border border-hairline">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-body-strong">{b.user?.full_name}</span>
                  <span className="text-caption text-ink-muted-48 ml-2">#{b.id}</span>
                </div>
                {statusBadge(b.status)}
              </div>
              <div className="text-caption text-ink-muted-48">
                {b.items?.map((i) => i.book?.title).join(", ")} · Borrowed {formatDate(b.borrow_date)} · Due {formatDate(b.due_date)}
                {b.return_date && ` · Returned ${formatDate(b.return_date)}`}
              </div>
              {b.fines?.length > 0 && (
                <div className="mt-2 text-caption text-red-500">
                  Fine: {formatCurrency(b.fines.reduce((s, f) => s + (f.is_paid ? 0 : f.amount), 0))}
                  {b.fines.some((f) => !f.is_paid) && " (unpaid)"}
                </div>
              )}
              {b.status !== "returned" && (
                <a href={`/borrows/${b.id}/return`} className="mt-2 inline-block text-primary text-caption hover:underline">Confirm Return</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
