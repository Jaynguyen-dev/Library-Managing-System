import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleLinks = () => {
    const links = [
      { to: "/dashboard", label: "Dashboard", roles: ["admin", "librarian"] },
      { to: "/books", label: "Books", roles: ["admin", "librarian", "student"] },
      { to: "/borrows", label: "Borrows", roles: ["admin", "librarian"] },
      { to: "/fines", label: "Fines", roles: ["admin", "librarian"] },
      { to: "/users", label: "Users", roles: ["admin"] },
      { to: "/profile/history", label: "My History", roles: ["student"] },
    ];
    return links.filter((l) => l.roles.includes(user?.role));
  };

  return (
    <div className="min-h-screen bg-parchment">
      <nav className="bg-surface-black text-white h-11 flex items-center px-5 text-xs tracking-tight">
        <div className="flex items-center gap-5 max-w-[980px] mx-auto w-full">
          <Link to="/" className="font-semibold tracking-normal">LMS</Link>
          <div className="flex gap-4 ml-4">
            {roleLinks().map((l) => (
              <Link key={l.to} to={l.to} className="opacity-80 hover:opacity-100 transition">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="opacity-60 text-caption">{user?.full_name}</span>
            <button onClick={handleLogout} className="opacity-80 hover:opacity-100 transition">
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-[980px] mx-auto px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
