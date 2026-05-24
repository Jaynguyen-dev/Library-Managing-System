import { useState, useEffect } from "react";
import api from "../services/api";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users");
      setUsers(data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/api/users/${id}/toggle-active`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const roleBadge = (role) => {
    const colors = { admin: "bg-purple-50 text-purple-600", librarian: "bg-blue-50 text-blue-600", student: "bg-green-50 text-green-600" };
    return <span className={`text-caption px-3 py-1 rounded-pill ${colors[role] || "bg-gray-50"}`}>{role}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display-md">Users</h1>
        <a href="/users/new" className="bg-primary text-white rounded-pill px-5 py-2 text-caption hover:bg-primary-focus transition active:scale-[0.98]">Add User</a>
      </div>

      {loading ? (
        <div className="text-center py-12 text-ink-muted-48">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-ink-muted-48">No users found.</div>
      ) : (
        <div className="grid gap-3">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-lg p-5 border border-hairline flex items-center justify-between">
              <div>
                <p className="text-body-strong">{u.full_name}</p>
                <p className="text-caption text-ink-muted-48">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                {roleBadge(u.role)}
                <span className={`text-caption px-3 py-1 rounded-pill ${u.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {u.is_active ? "Active" : "Locked"}
                </span>
                <button onClick={() => handleToggleActive(u.id)} className="text-primary text-caption hover:underline">
                  {u.is_active ? "Lock" : "Unlock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
