import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const TYPE_ICONS = {
  info: "ti ti-info-circle",
  reminder: "ti ti-bell",
  warning: "ti ti-alert-triangle",
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  const fetchUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/api/notifications/unread-count");
      setUnreadCount(data.data?.count || 0);
    } catch { /* ignore */ }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await api.get("/api/notifications", { params: { page: 1, limit: 20 } });
      setNotifications(data.data?.data || []);
      setUnreadCount(data.data?.data?.filter((n) => !n.is_read).length || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (open) fetchAll();
  }, [open, fetchAll]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        className="icon-btn"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{ position: "relative", fontSize: "18px", color: "var(--sf-text-2)" }}
        title="Notifications"
      >
        <i className="ti ti-bell"></i>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "-2px", right: "-4px",
            background: "var(--sf-red)", color: "#fff",
            fontSize: "10px", fontWeight: 700,
            width: "16px", height: "16px",
            borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: "340px", maxHeight: "400px",
              background: "var(--sf-bg)", border: "1px solid var(--sf-border)",
              borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              overflow: "hidden", zIndex: 1000,
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "10px 14px",
              borderBottom: "1px solid var(--sf-border)",
            }}>
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Notifications</span>
              {unreadCount > 0 && (
                <motion.button
                  className="btn btn-ghost btn-sm"
                  onClick={handleMarkAllRead}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ fontSize: "11px" }}
                >
                  Mark all read
                </motion.button>
              )}
            </div>

            <div style={{ overflowY: "auto", maxHeight: "calc(400px - 44px)" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--sf-text-2)", fontSize: "13px" }}>
                  <i className="ti ti-bell-off" style={{ fontSize: "24px", display: "block", marginBottom: "8px", opacity: 0.4 }}></i>
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    style={{
                      display: "flex", gap: "10px", padding: "10px 14px",
                      cursor: n.is_read ? "default" : "pointer",
                      background: n.is_read ? "transparent" : "var(--sf-accent-light)",
                      borderBottom: "1px solid var(--sf-border)",
                      transition: "background 0.15s",
                    }}
                  >
                    <i className={TYPE_ICONS[n.type] || TYPE_ICONS.info} style={{ fontSize: "16px", marginTop: "2px", color: "var(--sf-accent)", opacity: 0.7 }}></i>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--sf-text)", marginBottom: "2px" }}>{n.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--sf-text-2)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--sf-text-3)", marginTop: "4px" }}>{getTimeAgo(n.created_at)}</div>
                    </div>
                    {!n.is_read && (
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--sf-accent)", marginTop: "6px", flexShrink: 0 }} />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
