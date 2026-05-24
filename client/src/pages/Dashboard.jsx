import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatDate, formatCurrency } from "../utils/format";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard/summary")
      .then(({ data }) => { setSummary(data.data); setLoading(false); })
      .catch(() => { toast.error("Failed to load dashboard"); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div>
        <div className="stat-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card" style={{ padding: "18px" }}>
              <div className="stat-label">&nbsp;</div>
              <div className="stat-val" style={{ background: "#E8E8ED", height: "28px", width: "60px", borderRadius: "4px" }}>&nbsp;</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) return <div style={{ textAlign: "center", padding: "48px 0", color: "var(--sf-text-2)" }}>Failed to load dashboard.</div>;

  const totalBooks = summary.totalBooks || 0;
  const totalUsers = summary.totalUsers || 0;
  const activeBorrows = summary.activeBorrows || 0;
  const overdueCount = summary.overdueCount || 0;
  const pendingReturnsCount = summary.pendingReturnsCount || 0;
  const waitingReservations = summary.waitingReservations || 0;
  const notifiedReservations = summary.notifiedReservations || 0;
  const totalReservations = waitingReservations + notifiedReservations;

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Books</div>
          <div className="stat-val">{totalBooks.toLocaleString()}</div>
          <div className="stat-sub"><span className="stat-dot dot-green"></span>In catalogue</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Members</div>
          <div className="stat-val">{totalUsers.toLocaleString()}</div>
          <div className="stat-sub"><span className="stat-dot dot-green"></span>Registered users</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Borrows</div>
          <div className="stat-val">{activeBorrows}</div>
          <div className="stat-sub"><span className="stat-dot dot-amber"></span>Currently borrowed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-val">{overdueCount}</div>
          <div className="stat-sub">
            <span className="stat-dot dot-red"></span>
            {summary.unpaidFinesTotal > 0 ? `${formatCurrency(summary.unpaidFinesTotal)} unpaid` : "No fines"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Returns</div>
          <div className="stat-val">{pendingReturnsCount}</div>
          <div className="stat-sub">
            <span className="stat-dot dot-amber"></span>
            Awaiting confirmation
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reservations</div>
          <div className="stat-val">{totalReservations}</div>
          <div className="stat-sub">
            <span className={`stat-dot ${notifiedReservations > 0 ? "dot-blue" : "dot-gray"}`}></span>
            {notifiedReservations > 0 ? `${notifiedReservations} ready` : `${waitingReservations} waiting`}
          </div>
        </div>
      </div>

      {summary.overdueList?.length > 0 && (
        <div>
          <div className="section-header">
            <span className="section-title">Overdue Records</span>
            <Link to="/borrows" className="btn btn-ghost btn-sm">
              <i className="ti ti-eye" aria-hidden="true"></i> View All
            </Link>
          </div>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>Book Title</th>
                  <th>Due Date</th>
                  <th>Overdue</th>
                  <th>Fine</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {summary.overdueList.map((b) => {
                  const daysOverdue = Math.ceil((new Date() - new Date(b.due_date)) / (1000 * 60 * 60 * 24));
                  const fineAmount = daysOverdue * 2000;
                  return (
                    <tr className="overdue-row" key={b.id}>
                      <td>{b.user?.full_name}</td>
                      <td>{b.items?.map((i) => i.book?.title).join(", ")}</td>
                      <td style={{ color: "var(--sf-text-2)" }}>{formatDate(b.due_date)}</td>
                      <td><span className="badge badge-red">{daysOverdue} days</span></td>
                      <td>{formatCurrency(fineAmount)}</td>
                      <td>
                        <div className="row-actions">
                          <Link to={`/borrows/${b.id}/return`} className="icon-btn" title="Return">
                            <i className="ti ti-arrow-back-up"></i>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalReservations > 0 && (
        <div>
          <div className="section-header">
            <span className="section-title">Reservation Queue</span>
            <Link to="/borrows" className="btn btn-ghost btn-sm">
              <i className="ti ti-eye" aria-hidden="true"></i> View Borrows
            </Link>
          </div>
          <div className="card">
            <div style={{ display: "flex", gap: "24px", padding: "4px 0" }}>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--sf-text)" }}>{waitingReservations}</div>
                <div style={{ fontSize: "12px", color: "var(--sf-text-2)" }}>Waiting</div>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: notifiedReservations > 0 ? "var(--sf-accent)" : "var(--sf-text)" }}>{notifiedReservations}</div>
                <div style={{ fontSize: "12px", color: "var(--sf-text-2)" }}>Ready to borrow</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header" style={{ marginTop: summary.overdueList?.length > 0 || totalReservations > 0 ? "6px" : 0 }}>
        <span className="section-title">Collection by Category</span>
      </div>
      <div className="card" style={{ padding: "18px 20px" }}>
        {summary.categoryDistribution?.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {summary.categoryDistribution.map((cat, i) => {
              const colors = ["var(--sf-accent)", "var(--sf-purple)", "var(--sf-green)", "var(--sf-amber)", "var(--sf-red)"];
              const maxCount = Math.max(...summary.categoryDistribution.map((c) => c.count));
              const pct = maxCount > 0 ? Math.round((cat.count / maxCount) * 100) : 0;
              return (
                <div key={cat.category || i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "13px" }}>{cat.category}</span>
                    <span style={{ fontSize: "12px", color: "var(--sf-text-2)" }}>{cat.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: colors[i % colors.length] }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: "13px", color: "var(--sf-text-2)" }}>No category data available.</div>
        )}
      </div>
    </div>
  );
}
