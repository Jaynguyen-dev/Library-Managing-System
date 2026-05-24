import { useState, useEffect } from "react";
import api from "../services/api";
import { formatDate, formatCurrency } from "../utils/format";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard/summary")
      .then(({ data }) => { setSummary(data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-display-md mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-hairline animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return <div className="text-center py-12 text-ink-muted-48">Failed to load dashboard.</div>;

  const stats = [
    { label: "Total Books", value: summary.totalBooks, color: "text-blue-600" },
    { label: "Total Users", value: summary.totalUsers, color: "text-green-600" },
    { label: "Active Borrows", value: summary.activeBorrows, color: "text-orange-600" },
    { label: "Overdue", value: summary.overdueCount, color: "text-red-600" },
  ];

  return (
    <div>
      <h1 className="text-display-md mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg p-6 border border-hairline">
            <p className="text-caption text-ink-muted-48 mb-1">{s.label}</p>
            <p className={`text-display-lg ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {summary.unpaidFinesTotal > 0 && (
        <div className="bg-red-50 rounded-lg p-4 mb-6 text-red-600 text-body">
          Total unpaid fines: {formatCurrency(summary.unpaidFinesTotal)}
        </div>
      )}

      {summary.overdueList?.length > 0 && (
        <div>
          <h2 className="text-tagline mb-4">Overdue Records</h2>
          <div className="grid gap-3">
            {summary.overdueList.map((b) => {
              const daysOverdue = Math.ceil((new Date() - new Date(b.due_date)) / (1000 * 60 * 60 * 24));
              return (
                <div key={b.id} className="bg-white rounded-lg p-5 border border-hairline">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-body-strong">{b.user?.full_name}</span>
                      <span className="text-caption text-ink-muted-48 ml-2">
                        · {b.items?.map((i) => i.book?.title).join(", ")}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-caption text-red-500">{daysOverdue} days overdue</p>
                      <p className="text-caption text-ink-muted-48">Due: {formatDate(b.due_date)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
