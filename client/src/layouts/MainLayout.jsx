import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/my-dashboard": "My Dashboard",
  "/books": "Books",
  "/books/new": "Add Book",
  "/users": "Members",
  "/users/new": "Add Member",
  "/borrows": "Borrows",
  "/borrows/new": "New Borrow",
  "/fines": "Fines",
  "/billing": "Billing & Revenue",
  "/wallet": "My Wallet",
  "/fines/my": "My Fines",
  "/profile/history": "My History",
  "/reservations": "My Reservations",
};

const ADMIN_NAV = [
  { section: "Overview", items: [
    { icon: "ti ti-layout-dashboard", label: "Dashboard", to: "/dashboard" },
  ]},
  { section: "Catalogue", items: [
    { icon: "ti ti-books", label: "Books", to: "/books" },
    { icon: "ti ti-users", label: "Members", to: "/users" },
  ]},
  { section: "Transactions", items: [
    { icon: "ti ti-arrow-left-right", label: "Borrows", to: "/borrows" },
    { icon: "ti ti-receipt", label: "Fines", to: "/fines" },
    { icon: "ti ti-coin", label: "Billing", to: "/billing" },
  ]},
];

const LIBRARIAN_NAV = [
  { section: "Overview", items: [
    { icon: "ti ti-layout-dashboard", label: "Dashboard", to: "/dashboard" },
  ]},
  { section: "Catalogue", items: [
    { icon: "ti ti-books", label: "Books", to: "/books" },
  ]},
  { section: "Transactions", items: [
    { icon: "ti ti-arrow-left-right", label: "Borrows", to: "/borrows" },
    { icon: "ti ti-receipt", label: "Fines", to: "/fines" },
  ]},
];

const READER_NAV = [
  { section: "Overview", items: [
    { icon: "ti ti-layout-dashboard", label: "Dashboard", to: "/my-dashboard" },
  ]},
  { section: "Catalogue", items: [
    { icon: "ti ti-books", label: "Browse Books", to: "/books" },
  ]},
  { section: "Account", items: [
    { icon: "ti ti-wallet", label: "My Wallet", to: "/wallet" },
    { icon: "ti ti-history", label: "My History", to: "/profile/history" },
    { icon: "ti ti-receipt", label: "My Fines", to: "/fines/my" },
    { icon: "ti ti-clock", label: "Reservations", to: "/reservations" },
  ]},
];

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarClass(role) {
  if (role === "admin") return "";
  if (role === "student") return "green";
  return "amber";
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const activePath = location.pathname;
  const topbarTitle = PAGE_TITLES[activePath] || "Dashboard";
  const isReader = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const navSections = isReader ? READER_NAV : isAdmin ? ADMIN_NAV : LIBRARIAN_NAV;

  return (
    <div className="shell">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <i className="ti ti-book-2" aria-hidden="true"></i>
          </div>
          <span>LibraryLMS</span>
        </div>

        {navSections.map((section) => (
          <div className="nav-section" key={section.section}>
            <div className="nav-label">{section.section}</div>
            {section.items.map((item) => {
              const isActive = item.to === "/" ? false : activePath === item.to || activePath.startsWith(item.to + "/") || (activePath === "/dashboard" && item.to === "/dashboard") || (activePath === "/my-dashboard" && item.to === "/my-dashboard");
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-item${isActive ? " active" : ""}`}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="sidebar-user">
          <div className={`avatar${user ? ` ${getAvatarClass(user.role)}` : ""}`}>
            {user ? getInitials(user.full_name) : "?"}
          </div>
          <span style={{ flex: 1 }}>{user?.full_name || "User"} — {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}</span>
          <button onClick={handleLogout} className="icon-btn" title="Sign Out" style={{ border: "none", width: "24px", height: "24px", color: "rgba(255,255,255,0.5)" }}>
            <i className="ti ti-logout"></i>
          </button>
        </div>
      </nav>

      <div className="main">
        <div className="topbar">
          <span className="topbar-title">{topbarTitle}</span>
        </div>

        <div className="content">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
