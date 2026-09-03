import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { notificationService } from "../../services/notificationService";

const iconPaths = {
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0",
};
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const timeAgo = (iso) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
};

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isDepartment = user?.role === "department";
  const isAdmin = user?.role === "admin";
  const Layout = isAdmin ? AdminLayout : isDepartment ? DepartmentLayout : DashboardLayout;

  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    notificationService
      .getAll({ limit: 50 })
      .then(({ data }) => {
        setNotifications(data?.data?.notifications || []);
        setUnreadCount(data?.data?.unreadCount || 0);
      })
      .catch(() => setError("Couldn't load your notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(c - 1, 0));
    } catch {
      // non-critical — ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      setError("Couldn't mark all as read. Please try again.");
    }
  };

  const filtered = notifications.filter((n) => {
    if (tab === "unread") return !n.isRead;
    if (tab === "read") return n.isRead;
    return true;
  });

  const tabs = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: notifications.length - unreadCount },
  ];

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
          {t("nav_notifications")}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer" }}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === key ? 700 : 500,
              color: tab === key ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: tab === key ? "2px solid var(--primary)" : "2px solid transparent", marginBottom: -1,
            }}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ width: "70%", height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "40%", height: 12 }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", marginBottom: 8, display: "flex", justifyContent: "center" }}>
              <Icon d={iconPaths.bell} size={28} />
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {tab === "unread" ? "You're all caught up." : "No notifications yet."}
            </div>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "16px 18px",
                borderBottom: "1px solid var(--border)", background: n.isRead ? "transparent" : "rgba(0,128,128,0.04)",
              }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                background: n.isRead ? "transparent" : "var(--secondary)",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "var(--text-primary)", fontWeight: n.isRead ? 500 : 700, lineHeight: 1.5 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, display: "flex", gap: 10, alignItems: "center" }}>
                  <span>{timeAgo(n.createdAt)}</span>
                  {n.complaintId && (
                    <Link to={`/complaints/${n.complaintId}`} style={{ color: "var(--primary)", fontWeight: 600 }}>View complaint</Link>
                  )}
                </div>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  style={{ fontSize: 11.5, fontWeight: 600, color: "var(--primary)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", flexShrink: 0 }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
