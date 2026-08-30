import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";

// A palette cycled across categories for the donut slices — kept in the
// app's teal/coral family so it doesn't clash with the rest of the UI.
const SLICE_COLORS = ["#008080", "#FF6B6B", "#FFC107", "#4DB6B6", "#8a6d00", "#006666", "#94a3b8", "#c2410c"];

const STATUS_META = {
  Pending:    { label: "Pending",     color: "#FFC107" },
  Assigned:   { label: "Assigned",    color: "#4DB6B6" },
  InProgress: { label: "In Progress", color: "#008080" },
  Resolved:   { label: "Resolved",    color: "#28A745" },
  Closed:     { label: "Closed",      color: "#94a3b8" },
};

// Renders an SVG donut chart from [{label, count, color}].
function DonutChart({ slices, size = 180, thickness = 30 }) {
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={thickness} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {slices.filter((s) => s.count > 0).map((s) => {
        const fraction = s.count / total;
        const dash = fraction * circumference;
        const el = (
          <circle
            key={s.label}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

export default function AdminAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [breakdown, setBreakdown] = useState([]);
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
      adminService.getCategoryAnalytics(),
      adminService.getStatusBreakdown(),
      adminService.getComplaintsOverTime(12),
    ])
      .then(([catRes, statusRes, trendRes]) => {
        setCategories(catRes.data?.data?.categories || []);
        setTotal(catRes.data?.data?.total || 0);
        setBreakdown(statusRes.data?.data?.breakdown || []);
        setSeries(trendRes.data?.data?.series || []);
      })
      .catch(() => setError("Couldn't load analytics data. Please try refreshing."))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user || user.role !== "admin") return null;

  const slices = categories
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((c, i) => ({ label: c.category, count: c.count, color: SLICE_COLORS[i % SLICE_COLORS.length] }));

  const maxTrend = Math.max(...series.map((s) => s.count), 1);
  const maxStatus = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <AdminLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        Analytics
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
        Where complaints come from, and where they get stuck.
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16, marginBottom: 16 }}>
        {/* Category donut */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Complaints by Category
          </div>
          {loading ? (
            <div className="skeleton" style={{ width: 180, height: 180, borderRadius: "50%", margin: "0 auto" }} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <DonutChart slices={slices} />
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{total}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-secondary)" }}>total</div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 8 }}>
                {slices.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>No complaints recorded yet.</div>
                ) : (
                  slices.map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, color: "var(--text-primary)" }}>{s.label}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{s.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status pipeline */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            Complaint Pipeline
          </div>
          {loading ? (
            <div className="skeleton" style={{ width: "100%", height: 160 }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {breakdown.map((b) => {
                const meta = STATUS_META[b.status] || { label: b.status, color: "#94a3b8" };
                return (
                  <div key={b.status}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{meta.label}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{b.count}</span>
                    </div>
                    <div style={{ height: 10, background: "var(--background)", borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${(b.count / maxStatus) * 100}%`, height: "100%", background: meta.color, minWidth: b.count > 0 ? 6 : 0 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 12-month trend */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
          Complaints Received Last 12 Months
        </div>
        {loading ? (
          <div className="skeleton" style={{ width: "100%", height: 160 }} />
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 170, overflowX: "auto", padding: "0 4px" }}>
            {series.map((s) => (
              <div key={s.month} style={{ flex: "1 0 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-primary)" }}>{s.count}</div>
                <div
                  style={{
                    width: "100%", maxWidth: 26, borderRadius: "5px 5px 0 0",
                    background: "var(--primary)",
                    height: `${Math.max((s.count / maxTrend) * 120, s.count > 0 ? 5 : 2)}px`,
                    opacity: s.count === 0 ? 0.25 : 1,
                  }}
                />
                <div style={{ fontSize: 10.5, color: "var(--text-secondary)" }}>{s.month}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
