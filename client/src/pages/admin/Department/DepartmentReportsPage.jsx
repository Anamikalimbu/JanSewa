import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DepartmentLayout from "../../../layouts/DepartmentLayout";
import { useAuth } from "../../../context/AuthContext";
import { complaintService } from "../../../services/complaintService";

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

export default function DepartmentReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ assigned: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "department")) navigate("/home");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user?.role !== "department") return;
    setLoading(true);
    setError("");
    Promise.all([
      complaintService.getDepartmentStats(),
      complaintService.getDepartmentTrend(6),
    ])
      .then(([statsRes, trendRes]) => {
        setStats(statsRes.data?.data || {});
        setSeries(trendRes.data?.data?.series || []);
      })
      .catch(() => setError("Couldn't load report data. Please try refreshing."))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user || user.role !== "department") return null;

  const maxCount = Math.max(...series.map((s) => s.count), 1);
  const resolutionRate = stats.assigned > 0 ? Math.round((stats.resolved / stats.assigned) * 100) : 0;

  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        Reports
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
        A snapshot of how your department is performing.
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Assigned" value={stats.assigned} loading={loading} />
        <StatCard label="Pending" value={stats.pending} loading={loading} />
        <StatCard label="In Progress" value={stats.inProgress} loading={loading} />
        <StatCard label="Resolved" value={stats.resolved} loading={loading} />
        <StatCard label="Resolution Rate" value={`${resolutionRate}%`} loading={loading} />
      </div>

      {/* Monthly trend */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
          Complaints Received — Last 6 Months
        </div>

        {loading ? (
          <div className="skeleton" style={{ width: "100%", height: 160 }} />
        ) : series.every((s) => s.count === 0) ? (
          <div style={{ padding: "24px 0", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            No complaints recorded in this period yet.
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180, padding: "0 4px" }}>
            {series.map((s) => (
              <div key={s.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)" }}>{s.count}</div>
                <div
                  style={{
                    width: "100%", maxWidth: 40, borderRadius: "6px 6px 0 0",
                    background: "var(--primary)",
                    height: `${Math.max((s.count / maxCount) * 130, s.count > 0 ? 6 : 2)}px`,
                    opacity: s.count === 0 ? 0.25 : 1,
                  }}
                />
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{s.month}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DepartmentLayout>
  );
}
