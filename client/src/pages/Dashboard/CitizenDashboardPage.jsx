import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { complaintService } from "../../services/complaintService";

const iconPaths = {
  plus:     "M12 5v14M5 12h14",
  search:   "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  user:     "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
};

const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const STATUS_STYLES = {
  Pending:     { bg: "rgba(255,193,7,0.15)",  fg: "#8a6d00", key: "status_pending" },
  Assigned:    { bg: "rgba(0,128,128,0.12)",  fg: "var(--secondary)", key: "status_assigned" },
  InProgress:  { bg: "rgba(0,128,128,0.12)",  fg: "var(--secondary)", key: "status_inprogress" },
  Resolved:    { bg: "rgba(40,167,69,0.14)",  fg: "#1e7a34", key: "status_resolved" },
  Closed:      { bg: "#eef0f2",               fg: "var(--text-secondary)", key: "status_closed" },
};

const StatusBadge = ({ status, t }) => {
  const s = STATUS_STYLES[status] || { bg: "#eef0f2", fg: "var(--text-secondary)", key: "status_pending" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap",
    }}>
      {t(s.key)}
    </span>
  );
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const StatCard = ({ label, value, loading }) => (
  <div style={{
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
    padding: "16px 18px",
  }}>
    {loading ? (
      <div className="skeleton" style={{ width: 40, height: 26, marginBottom: 6 }} />
    ) : (
      <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>
        {value}
      </div>
    )}
    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>{label}</div>
  </div>
);

export default function CitizenDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    setLoading(true);
    setError("");

    Promise.all([complaintService.getMyStats(), complaintService.getMine({ limit: 5 })])
      .then(([statsRes, recentRes]) => {
        if (!mounted) return;
        setStats(statsRes.data?.data || {});
        setRecent(recentRes.data?.data?.complaints || []);
      })
      .catch(() => {
        if (mounted) setError("Couldn't load your dashboard data. Please try refreshing.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  if (authLoading || !user) return null;

  const firstName = user.name?.split(" ")[0] || user.name;

  return (
    <DashboardLayout>
      {/* WELCOME BANNER */}
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 22, height: 120,
      }}>
        <img
          src="https://images.unsplash.com/photo-1680471818128-b85e28f34edd?auto=format&fit=crop&w=1200&q=80"
          alt="Kathmandu Valley, Nepal"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(0,51,51,0.82) 0%, rgba(0,51,51,0.35) 65%, rgba(0,51,51,0.05) 100%)",
          display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#fff" }}>
            {t("dash_welcome")}, {firstName}!
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>
            {t("dash_subtitle")}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8,
          padding: "10px 14px", fontSize: 13, marginBottom: 18,
        }}>
          {error}
        </div>
      )}

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label={t("dash_totalComplaints")} value={stats.total} loading={loading} />
        <StatCard label={t("dash_inProgress")}      value={stats.inProgress} loading={loading} />
        <StatCard label={t("dash_resolved")}         value={stats.resolved} loading={loading} />
        <StatCard label={t("dash_pending")}          value={stats.pending} loading={loading} />
      </div>

      {/* RECENT COMPLAINTS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)" }}>{t("dash_recentComplaints")}</div>
        <Link to="/complaints" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>
          {t("dash_viewAll")}
        </Link>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11.5, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ flex: 3 }}>{t("dash_col_title")}</span>
          <span style={{ flex: 2 }}>{t("dash_col_id")}</span>
          <span style={{ flex: 2 }}>{t("dash_col_status")}</span>
          <span style={{ flex: 2 }}>{t("dash_col_date")}</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ flex: 3, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
            </div>
          ))
        ) : recent.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            {t("dash_noComplaints")}{" "}
            <Link to="/complaints/new" style={{ color: "var(--primary)", fontWeight: 600 }}>
              {t("dash_submitFirst")}
            </Link>
          </div>
        ) : (
          recent.map((c) => (
            <div
              key={c.id}
              style={{
                display: "flex", alignItems: "center", padding: "12px 16px", gap: 8,
                borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)",
              }}
            >
              <span style={{ flex: 3, fontWeight: 500 }}>{c.title}</span>
              <span style={{ flex: 2, fontSize: 11.5, color: "var(--text-muted)" }}>#{c.code}</span>
              <span style={{ flex: 2 }}><StatusBadge status={c.status} t={t} /></span>
              <span style={{ flex: 2, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(c.createdAt)}</span>
            </div>
          ))
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
        {t("dash_quickActions")}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/complaints/new" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 10,
          border: "1px solid var(--border)", background: "var(--card)", fontSize: 13.5,
          fontWeight: 600, color: "var(--primary)",
        }}>
          <Icon d={iconPaths.plus} /> {t("dash_submitNew")}
        </Link>
        <Link to="/complaints" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 10,
          border: "1px solid var(--border)", background: "var(--card)", fontSize: 13.5,
          fontWeight: 600, color: "var(--text-primary)",
        }}>
          <Icon d={iconPaths.search} /> {t("dash_trackComplaint")}
        </Link>
        <Link to="/profile" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 10,
          border: "1px solid var(--border)", background: "var(--card)", fontSize: 13.5,
          fontWeight: 600, color: "var(--text-primary)",
        }}>
          <Icon d={iconPaths.user} /> {t("dash_editProfile")}
        </Link>
      </div>
    </DashboardLayout>
  );
}
