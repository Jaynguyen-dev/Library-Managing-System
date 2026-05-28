import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/format";
import Pagination from "../components/Pagination";

function StatCard({ label, value, sub, delay = 0, color }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </motion.div>
  );
}

export default function FineListPage() {
  const [fines, setFines] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paidFilter, setPaidFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  const fetchData = (p, filter) => {
    setLoading(true);
    const params = { page: p || 1, limit: 20 };
    if (filter !== "") params.is_paid = filter;
    api.get("/api/fines", { params })
      .then(({ data }) => {
        setFines(data.data?.fines || []);
        setPagination(data.data?.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load fines"))
      .finally(() => setLoading(false));

    api.get("/api/fines/revenue")
      .then(({ data }) => setRevenue(data.data))
      .catch(() => {});
  };

  useEffect(() => {
    api.get("/api/fines", { params: { page: 1, limit: 20 } })
      .then(({ data }) => {
        setFines(data.data?.fines || []);
        setPagination(data.data?.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load fines"))
      .finally(() => setLoading(false));
    api.get("/api/fines/revenue")
      .then(({ data }) => setRevenue(data.data))
      .catch(() => {});
  }, []);

  const handleFilter = (filter) => {
    setPaidFilter(filter);
    setPage(1);
    fetchData(1, filter);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchData(p, paidFilter);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <div className="section-header">
        <span className="section-title">Fines & Billing</span>
      </div>

      {revenue && (
        <div className="stat-grid" style={{ marginBottom: "16px" }}>
          <StatCard label="Total Revenue" value={formatCurrency(revenue.totalRevenue)} delay={0} />
          <StatCard label="Collected" value={formatCurrency(revenue.paidRevenue)} sub={`${revenue.paidCount} paid fines`} delay={0.05} color="var(--sf-green)" />
          <StatCard label="Outstanding" value={formatCurrency(revenue.unpaidRevenue)} sub={`${revenue.unpaidCount} unpaid fines`} delay={0.1} color="var(--sf-red)" />
          <StatCard label="Collection Rate" value={revenue.totalRevenue > 0 ? `${Math.round((revenue.paidRevenue / revenue.totalRevenue) * 100)}%` : "—"} delay={0.15} />
        </div>
      )}

      <div className="tab-bar" style={{ marginBottom: "14px" }}>
        {["", "false", "true"].map((v) => (
          <button
            key={v}
            className={`tab${paidFilter === v ? " active" : ""}`}
            onClick={() => handleFilter(v)} disabled={loading}
          >{v === "" ? "All" : v === "false" ? "Unpaid" : "Paid"}</button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div className="skeleton" style={{ height: 20, width: "30%", margin: "0 auto" }}></div>
        </div>
      ) : fines.length === 0 ? (
        <motion.div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <i className="ti ti-receipt" style={{ fontSize: "40px", display: "block", marginBottom: "12px" }}></i>
          No fines found.
        </motion.div>
      ) : (
        <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Overdue Days</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Paid At</th>
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
                    <td style={{ fontWeight: 500 }}>{f.user?.full_name}</td>
                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bookTitle}</td>
                    <td style={{ color: "var(--sf-text-2)" }}>{daysOverdue ? `${daysOverdue} days` : "-"}</td>
                    <td>{formatCurrency(f.amount)}</td>
                    <td>
                      <span className={`badge ${f.is_paid ? "badge-green" : "badge-red"}`}>
                        <i className={`ti ti-${f.is_paid ? "check-circle" : "alert-circle"}`} style={{ fontSize: "10px" }}></i>
                        {f.is_paid ? "PAID" : "UNPAID"}
                      </span>
                    </td>
                    <td style={{ color: "var(--sf-text-2)", fontSize: "13px" }}>
                      {f.paid_at ? formatDate(f.paid_at) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      <Pagination page={pagination.page || page} pages={pagination.pages} total={pagination.total} onPageChange={handlePageChange} loading={loading} />
    </motion.div>
  );
}
