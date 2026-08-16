import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";

const StatCard = ({ label, value, loading }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 8px", textAlign: "center" }}>
    {loading ? (
      <div className="skeleton" style={{ width: 44, height: 26, margin: "0 auto 6px" }} />
    ) : (
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
    )}
    <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>{label}</div>
  </div>
);

export default function AdminReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalComplaints: 0, resolved: 0, pending: 0 });
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/home");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    setLoading(true);
    setError("");
    Promise.all([
      adminService.getStats(),
      adminService.getCategoryAnalytics(),
      adminService.getComplaintsOverTime(6),
    ])
      .then(([statsRes, catRes, trendRes]) => {
        setStats(statsRes.data?.data || {});
        setCategories(catRes.data?.data?.categories || []);
        setSeries(trendRes.data?.data?.series || []);
      })
      .catch(() => setError("Couldn't load report data. Please try refreshing."))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user || user.role !== "admin") return null;

  const resolutionRate = stats.totalComplaints > 0 ? Math.round((stats.resolved / stats.totalComplaints) * 100) : 0;
  const printReport = () => window.print();

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            Reports
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
            A summary of platform activity across all departments.
          </div>
        </div>
        <button
          onClick={printReport}
          style={{
            padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)",
            color: "var(--text-primary)", fontWeight: 600, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          Print / Export
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Users" value={stats.totalUsers} loading={loading} />
        <StatCard label="Total Complaints" value={stats.totalComplaints} loading={loading} />
        <StatCard label="Resolved" value={stats.resolved} loading={loading} />
        <StatCard label="Pending" value={stats.pending} loading={loading} />
        <StatCard label="Resolution Rate" value={`${resolutionRate}%`} loading={loading} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Category breakdown table */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 10px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Complaints by Category
          </div>
          <div style={{
            display: "flex", padding: "8px 18px", borderBottom: "1px solid var(--border)",
            fontSize: 10.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            <span style={{ flex: 2 }}>Category</span>
            <span style={{ flex: 1, textAlign: "center" }}>Count</span>
            <span style={{ flex: 2 }}>Share</span>
          </div>
          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ width: "100%", height: 14 }} />
              </div>
            ))
          ) : categories.length === 0 ? (
            <div style={{ padding: "24px 18px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
              No complaints recorded yet.
            </div>
          ) : (
            categories
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((c) => (
                <div key={c.category} style={{ display: "flex", alignItems: "center", padding: "10px 18px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span style={{ flex: 2, fontWeight: 500, color: "var(--text-primary)" }}>{c.category}</span>
                  <span style={{ flex: 1, textAlign: "center", color: "var(--text-secondary)" }}>{c.count}</span>
                  <span style={{ flex: 2, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--background)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${c.percentage}%`, height: "100%", background: "var(--primary)" }} />
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--text-secondary)", width: 32, textAlign: "right" }}>{c.percentage}%</span>
                  </span>
                </div>
              ))
          )}
        </div>

        {/* Monthly volume table */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 10px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Complaints — Last 6 Months
          </div>
          <div style={{
            display: "flex", padding: "8px 18px", borderBottom: "1px solid var(--border)",
            fontSize: 10.5, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            <span style={{ flex: 1 }}>Month</span>
            <span style={{ flex: 1, textAlign: "right" }}>Complaints</span>
          </div>
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ width: "100%", height: 14 }} />
              </div>
            ))
          ) : (
            series.map((s) => (
              <div key={s.month} style={{ display: "flex", padding: "10px 18px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <span style={{ flex: 1, fontWeight: 500, color: "var(--text-primary)" }}>{s.month}</span>
                <span style={{ flex: 1, textAlign: "right", color: "var(--text-secondary)" }}>{s.count}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
