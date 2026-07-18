import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
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
  Pending:     { bg: "rgba(255,193,7,0.15)",  fg: "#8a6d00", label: "Pending" },
  Assigned:    { bg: "rgba(0,128,128,0.12)",  fg: "var(--secondary)", label: "Assigned" },
  InProgress:  { bg: "rgba(0,128,128,0.12)",  fg: "var(--secondary)", label: "In Progress" },
  Resolved:    { bg: "rgba(40,167,69,0.14)",  fg: "#1e7a34", label: "Resolved" },
  Closed:      { bg: "#eef0f2",               fg: "var(--text-secondary)", label: "Closed" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: "#eef0f2", fg: "var(--text-secondary)", label: status };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap",
    }}>
      {s.label}
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
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
        Welcome back, {firstName}!
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 22 }}>
        Here's what's happening with your complaints today.
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
        <StatCard label="Total Complaints" value={stats.total} loading={loading} />
        <StatCard label="In Progress"      value={stats.inProgress} loading={loading} />
        <StatCard label="Resolved"         value={stats.resolved} loading={loading} />
        <StatCard label="Pending"          value={stats.pending} loading={loading} />
      </div>

      {/* RECENT COMPLAINTS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)" }}>Recent Complaints</div>
        <Link to="/complaints" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>
          View All →
        </Link>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11.5, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ flex: 3 }}>Title</span>
          <span style={{ flex: 2 }}>ID</span>
          <span style={{ flex: 2 }}>Status</span>
          <span style={{ flex: 2 }}>Date</span>
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
            You haven't filed any complaints yet.{" "}
            <Link to="/complaints/new" style={{ color: "var(--primary)", fontWeight: 600 }}>
              Submit your first one →
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
              <span style={{ flex: 2 }}><StatusBadge status={c.status} /></span>
              <span style={{ flex: 2, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(c.createdAt)}</span>
            </div>
          ))
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
        Quick Actions
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/complaints/new" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 10,
          border: "1px solid var(--border)", background: "var(--card)", fontSize: 13.5,
          fontWeight: 600, color: "var(--primary)",
        }}>
          <Icon d={iconPaths.plus} /> Submit New Complaint
        </Link>
        <Link to="/complaints" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 10,
          border: "1px solid var(--border)", background: "var(--card)", fontSize: 13.5,
          fontWeight: 600, color: "var(--text-primary)",
        }}>
          <Icon d={iconPaths.search} /> Track Complaint
        </Link>
        <Link to="/profile" style={{
          display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 10,
          border: "1px solid var(--border)", background: "var(--card)", fontSize: 13.5,
          fontWeight: 600, color: "var(--text-primary)",
        }}>
          <Icon d={iconPaths.user} /> Edit Profile
        </Link>
      </div>
    </DashboardLayout>
  );
}
