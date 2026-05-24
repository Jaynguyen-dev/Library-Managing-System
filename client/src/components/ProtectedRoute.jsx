import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="shell">
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon"><i className="ti ti-book-2"></i></div>
            <span>LibraryLMS</span>
          </div>
          <div className="nav-section">
            {[1, 2, 3].map((i) => (
              <div key={i} className="nav-item" style={{ opacity: 0.2 }}>&nbsp;</div>
            ))}
          </div>
        </nav>
        <div className="main">
          <div className="topbar">
            <span className="topbar-title">Loading…</span>
          </div>
          <div className="content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <i className="ti ti-loader" style={{ fontSize: "32px", color: "var(--sf-accent)", animation: "spin 1s linear infinite" }}></i>
              <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--sf-text-2)" }}>Loading…</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || (roles && !roles.includes(user.role))) return <Navigate to="/login" replace />;

  return children;
}
