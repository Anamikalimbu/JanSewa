import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import DepartmentLayout from "../../layouts/DepartmentLayout";
import AdminLayout from "../../layouts/AdminLayout";
import { EmptyStateIllustration } from "../../components/common/Illustrations";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";

const TYPE_TITLE_KEYS = {
  ComplaintCreated: "notif_type_created",
  ComplaintAssigned: "notif_type_assigned",
  StatusUpdated: "notif_type_statusUpdated",
  ComplaintResolved: "notif_type_resolved",
};

const toCode = (id) => (id ? `CMP${String(id).slice(-6).toUpperCase()}` : null);

const timeAgo = (iso) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units = [
    ["year", 31536000], ["month", 2592000], ["day", 86400],
    ["hour", 3600], ["minute", 60],
  ];
  for (const [label, secs] of units) {
    const v = Math.floor(seconds / secs);
    if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

const iconPaths = { bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0" };
const Icon = ({ d, size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function NotificationsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const Layout = user?.role === "admin" ? AdminLayout : user?.role === "department" ? DepartmentLayout : DashboardLayout;

  const [notifications, setNotifications] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    notificationService
      .getAll({ limit: 50 })
      .then(({ data }) => setNotifications(data?.data?.notifications || []))
      .catch(() => setError(t("notif_loadError")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const counts = useMemo(() => ({
    all: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    read: notifications.filter((n) => n.isRead).length,
  }), [notifications]);

  const filtered = notifications.filter((n) =>
    tab === "unread" ? !n.isRead : tab === "read" ? n.isRead : true
  );

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setError(t("notif_markAllError"));
    }
  };

  const handleView = async (n) => {
    if (!n.isRead) {
      try {
        await notificationService.markAsRead(n._id);
        setNotifications((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      } catch {
        // non-fatal — still navigate
      }
    }
    if (n.complaintId) navigate(`/complaints/${n.complaintId}`);
  };

  const tabs = [
    { key: "all", label: t("notif_tab_all"), count: counts.all },
    { key: "unread", label: t("notif_tab_unread"), count: counts.unread },
    { key: "read", label: t("notif_tab_read"), count: counts.read },
  ];

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
          {t("notif_title")}
        </div>
        {counts.unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            {t("notif_markAllRead")}
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)" }}>
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === key ? 700 : 500,
              color: tab === key ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: tab === key ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ width: "60%", height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: "90%", height: 12 }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <EmptyStateIllustration variant="bell" width={130} />
            <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6 }}>
              {tab === "unread" ? t("notif_empty_unread") : tab === "read" ? t("notif_empty_read") : t("notif_empty_all")}
            </div>
          </div>
        ) : (
          filtered.map((n, i) => (
            <div
              key={n._id}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                background: n.isRead ? "transparent" : "rgba(0,128,128,0.04)",
                borderLeft: n.isRead ? "4px solid transparent" : "4px solid var(--primary)",
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                background: n.isRead ? "transparent" : "var(--primary)",
                border: n.isRead ? "2px solid var(--border)" : "none",
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: n.isRead ? 500 : 700, color: n.isRead ? "var(--text-secondary)" : "var(--text-primary)" }}>
                  {t(TYPE_TITLE_KEYS[n.type] || "notif_type_default")}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  {n.complaintId ? `#${toCode(n.complaintId)} · ` : ""}{timeAgo(n.createdAt)}
                </div>
              </div>
              <button
                onClick={() => handleView(n)}
                style={{
                  fontSize: 11.5, fontWeight: 700, color: "var(--primary)", border: "1px solid var(--border)",
                  borderRadius: 6, padding: "5px 12px", background: "var(--card)", cursor: "pointer", flexShrink: 0,
                }}
              >
                {t("view")}
              </button>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
