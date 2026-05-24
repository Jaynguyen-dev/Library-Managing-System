import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";

export default function ReaderDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard/my")
      .then(({ data }) => { setData(data.data); setLoading(false); })
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

  if (!data) return <div style={{ textAlign: "center", padding: "48px 0", color: "var(--sf-text-2)" }}>Failed to load dashboard.</div>;

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Active Borrows</div>
          <div className="stat-val">{data.activeBorrows}</div>
          <div className="stat-sub"><span className="stat-dot dot-amber"></span>Currently borrowed</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-val">{data.overdueCount}</div>
          <div className="stat-sub"><span className="stat-dot dot-red"></span>Overdue items</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Borrows</div>
          <div className="stat-val">{data.totalBorrows}</div>
          <div className="stat-sub"><span className="stat-dot dot-green"></span>All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reservations</div>
          <div className="stat-val">{data.activeReservations || 0}</div>
          <div className="stat-sub"><span className="stat-dot dot-blue"></span>Active holds</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unpaid Fines</div>
          <div className="stat-val">{formatCurrency(data.unpaidFinesTotal)}</div>
          <div className="stat-sub">
            <span className={data.unpaidFinesTotal > 0 ? "stat-dot dot-red" : "stat-dot dot-green"}></span>
            {data.unpaidFinesTotal > 0 ? `${data.unpaidFines.length} outstanding` : "All clear"}
          </div>
        </div>
      </div>

      {data.unpaidFines?.length > 0 && (
        <div>
          <div className="section-header">
            <span className="section-title">My Unpaid Fines</span>
            <Link to="/fines/my" className="btn btn-ghost btn-sm">
              <i className="ti ti-eye" aria-hidden="true"></i> View All
            </Link>
          </div>
          <div className="card">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.unpaidFines.slice(0, 5).map((f) => {
                  const bookTitle = f.borrow_record?.items?.[0]?.book?.title || f.reason || "-";
                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 500 }}>{bookTitle}</td>
                      <td>{formatCurrency(f.amount)}</td>
                      <td style={{ color: "var(--sf-text-2)" }}>{formatDate(f.created_at)}</td>
                      <td>
                        <span className="badge badge-red">Unpaid</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.unpaidFinesTotal === 0 && data.activeBorrows === 0 && data.overdueCount === 0 && data.activeReservations === 0 && (
        <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--sf-text-2)" }}>
          <i className="ti ti-book" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }}></i>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--sf-text)", marginBottom: "4px" }}>No activity yet</div>
          <div style={{ fontSize: "13px" }}>Browse the library and borrow your first book!</div>
          <Link to="/books" className="btn btn-primary" style={{ marginTop: "16px" }}>
            <i className="ti ti-books"></i> Browse Books
          </Link>
        </div>
      )}
    </div>
  );
}
