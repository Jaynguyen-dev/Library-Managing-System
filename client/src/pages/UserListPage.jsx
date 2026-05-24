import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Pagination from "../components/Pagination";
import { formatDate } from "../utils/format";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function avatarClass(role) {
  if (role === "admin") return "";
  if (role === "student") return "green";
  return "blue";
}

function roleBadge(role) {
  const cls = role === "admin" ? "badge-blue" : role === "librarian" ? "badge-gray" : "badge-green";
  return <span className={`badge ${cls}`}>{role}</span>;
}

function statusBadge(active) {
  return active
    ? <span className="badge badge-green">Active</span>
    : <span className="badge badge-red">Locked</span>;
}

export default function UserListPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  useEffect(() => {
    const params = { page: 1, limit: 20 };
    api.get("/api/users", { params })
      .then(({ data }) => {
        setUsers(data.data.users);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleFilter = (r) => {
    setRoleFilter(r);
    setPage(1);
    setLoading(true);
    const params = { page: 1, limit: 20 };
    if (r) params.role = r;
    api.get("/api/users", { params })
      .then(({ data }) => {
        setUsers(data.data.users);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (p) => {
    setPage(p);
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (roleFilter) params.role = roleFilter;
    api.get("/api/users", { params })
      .then(({ data }) => {
        setUsers(data.data.users);
        setPagination(data.data.pagination || { total: 0, pages: 0 });
      })
      .catch((err) => toast.error(err.response?.data?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/api/users/${id}/toggle-active`);
      toast.success("User status toggled");
      handlePageChange(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <div>
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="section-title">Members</span>
          <div className="tab-bar">
            {["", "admin", "librarian", "student"].map((r) => (
              <button
                key={r}
                className={`tab${roleFilter === r ? " active" : ""}`}
                onClick={() => handleRoleFilter(r)}
              >{r || "All"}</button>
            ))}
          </div>
        </div>
        {isAdmin && (
          <Link to="/users/new" className="btn btn-primary">
            <i className="ti ti-user-plus" aria-hidden="true"></i> Add Member
          </Link>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>Loading…</div>
      ) : users.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", color: "var(--sf-text-2)" }}>No users found.</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className={`avatar avatar-sm ${avatarClass(u.role)}`}>{getInitials(u.full_name)}</div>
                      <span style={{ fontWeight: 500 }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--sf-text-2)" }}>{u.email}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{statusBadge(u.is_active)}</td>
                  <td style={{ color: "var(--sf-text-2)" }}>{formatDate(u.created_at)}</td>
                  <td>
                    {isAdmin && (
                      <button className="icon-btn" title={u.is_active ? "Lock" : "Unlock"} onClick={() => handleToggleActive(u.id)}>
                        <i className={`ti ti-${u.is_active ? "lock" : "lock-open"}`}></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page || page} pages={pagination.pages} total={pagination.total} onPageChange={handlePageChange} />
    </div>
  );
}
