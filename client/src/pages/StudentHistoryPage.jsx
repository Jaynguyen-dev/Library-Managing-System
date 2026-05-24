import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDate, formatCurrency } from "../utils/format";

export default function StudentHistoryPage() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/borrows/my").then(({ data }) => {
      setBorrows(data.data.borrows);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const colors = { active: "bg-blue-50 text-blue-600", returned: "bg-green-50 text-green-600", overdue: "bg-red-50 text-red-600" };
    return <span className={`text-caption px-3 py-1 rounded-pill ${colors[status] || "bg-gray-50"}`}>{status}</span>;
  };

  return (
    <div>
      <h1 className="text-display-md mb-6">My Borrow History</h1>
      {loading ? (
        <div className="text-center py-12 text-ink-muted-48">Loading...</div>
      ) : borrows.length === 0 ? (
        <div className="text-center py-12 text-ink-muted-48">You have no borrow records yet.</div>
      ) : (
        <div className="grid gap-3">
          {borrows.map((b) => (
            <div key={b.id} className="bg-white rounded-lg p-5 border border-hairline">
              <div className="flex items-center justify-between mb-2">
                <span className="text-body-strong">#{b.id}</span>
                {statusBadge(b.status)}
              </div>
              <div className="text-caption text-ink-muted-48">
                {b.items?.map((i) => i.book?.title).join(", ")}
              </div>
              <div className="text-caption text-ink-muted-48 mt-1">
                Borrowed {formatDate(b.borrow_date)} · Due {formatDate(b.due_date)}
                {b.return_date && ` · Returned ${formatDate(b.return_date)}`}
              </div>
              {b.fines?.length > 0 && (
                <div className="mt-2 text-caption">
                  {b.fines.map((f) => (
                    <span key={f.id} className={f.is_paid ? "text-green-600" : "text-red-500"}>
                      {formatCurrency(f.amount)} · {f.is_paid ? "Paid" : "Unpaid"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
