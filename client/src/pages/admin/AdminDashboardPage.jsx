import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import DonutChart from "../../components/admin/DonutChart";
import BarChart from "../../components/admin/BarChart";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";
import { userService } from "../../services/userService";
import { departmentService } from "../../services/departmentService";

const CATEGORY_COLORS = {
  Water: "#0d9488",
  Garbage: "#d97706",
  Road: "#64748b",
  Electricity: "#eab308",
  Drainage: "#7c3aed",
  StreetLight: "#2563eb",
  Other: "#9ca3af",
};

const ROLE_OPTIONS = [
  { value: "citizen", label: "Citizen" },
  { value: "department", label: "Dept. Staff" },
  { value: "admin", label: "Admin" },
];

const StatCard = ({ label, value, loading }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", textAlign: "center" }}>
    {loading ? (
      <div className="skeleton" style={{ width: 60, height: 30, margin: "0 auto 6px" }} />
    ) : (
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>
        {value?.toLocaleString?.() ?? value}
      </div>
    )}
    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>{label}</div>
  </div>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const cardStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 };
const sectionTitle = { fontSize: 15, fontWeight: 700, color: "var(--text-primary)" };

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, totalComplaints: 0, resolved: 0, pending: 0 });
  const [categories, setCategories] = useState([]);
  const [series, setSeries] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pendingRoles, setPendingRoles] = useState({}); // { [userId]: role }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/home");
  }, [authLoading, user, navigate]);

  const loadAll = () => {
    setLoading(true);
    setError("");
    Promise.all([
      adminService.getStats(),
      adminService.getCategoryAnalytics(),
      adminService.getComplaintsOverTime(6),
      userService.getAll({ limit: 3 }),
      departmentService.getAll(),
    ])
      .then(([statsRes, catRes, seriesRes, usersRes, deptRes]) => {
        setStats(statsRes.data?.data || {});
        setCategories(catRes.data?.data?.categories || []);
        setSeries(seriesRes.data?.data?.series || []);
        setRecentUsers(usersRes.data?.data || []);
        setDepartments(deptRes.data?.data?.departments || []);
      })
      .catch(() => setError("Couldn't load the admin dashboard. Please try refreshing."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "admin") loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || !user || user.role !== "admin") return null;

  const donutData = categories
    .filter((c) => c.count > 0)
    .map((c) => ({ label: c.category, percentage: c.percentage, color: CATEGORY_COLORS[c.category] || "#9ca3af" }));

  const handleSaveRole = async (userId) => {
    const role = pendingRoles[userId];
    if (!role) return;
    setSavingUserId(userId);
    try {
      await userService.updateRole(userId, role);
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't update that user's role.");
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
        Admin Dashboard
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Users" value={stats.totalUsers} loading={loading} />
        <StatCard label="Total Complaints" value={stats.totalComplaints} loading={loading} />
        <StatCard label="Resolved" value={stats.resolved} loading={loading} />
        <StatCard label="Pending" value={stats.pending} loading={loading} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <div style={{ ...sectionTitle, marginBottom: 16 }}>Complaint Analytics</div>
          {loading ? (
            <div className="skeleton" style={{ width: "100%", height: 140 }} />
          ) : donutData.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No complaints yet.</div>
          ) : (
            <DonutChart data={donutData} />
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ ...sectionTitle, marginBottom: 16 }}>Complaints Over Time</div>
          {loading ? (
            <div className="skeleton" style={{ width: "100%", height: 160 }} />
          ) : (
            <BarChart data={series} />
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={sectionTitle}>Recent Users</div>
        <Link to="/admin/users" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>Manage Users →</Link>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 24 }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ flex: 2 }}>Name</span>
          <span style={{ flex: 2 }}>Email</span>
          <span style={{ flex: 2 }}>Role</span>
          <span style={{ flex: 1 }}>Joined</span>
          <span style={{ width: 70, textAlign: "right" }}>Action</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
            </div>
          ))
        ) : recentUsers.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>No users yet.</div>
        ) : (
          recentUsers.map((u) => (
            <div key={u._id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ flex: 2, fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</span>
              <span style={{ flex: 2, color: "var(--text-secondary)", fontSize: 12.5 }}>{u.email}</span>
              <span style={{ flex: 2 }}>
                <select
                  value={pendingRoles[u._id] ?? u.role}
                  onChange={(e) => setPendingRoles((prev) => ({ ...prev, [u._id]: e.target.value }))}
                  style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12.5, background: "var(--card)", color: "var(--text-primary)" }}
                >
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </span>
              <span style={{ flex: 1, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(u.createdAt)}</span>
              <span style={{ width: 70, textAlign: "right" }}>
                <button
                  onClick={() => handleSaveRole(u._id)}
                  disabled={savingUserId === u._id || !pendingRoles[u._id] || pendingRoles[u._id] === u.role}
                  style={{
                    fontSize: 12, fontWeight: 700, color: "var(--text-primary)", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "4px 10px", background: "var(--card)", cursor: "pointer",
                    opacity: (!pendingRoles[u._id] || pendingRoles[u._id] === u.role) ? 0.5 : 1,
                  }}
                >
                  {savingUserId === u._id ? "…" : "Edit"}
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Departments Overview */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={sectionTitle}>Departments Overview</div>
        <Link to="/admin/departments" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>Manage →</Link>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ flex: 2 }}>Department</span>
          <span style={{ flex: 1, textAlign: "center" }}>Staff</span>
          <span style={{ flex: 1, textAlign: "center" }}>Assigned</span>
          <span style={{ flex: 1, textAlign: "center" }}>Resolved</span>
          <span style={{ flex: 1, textAlign: "center" }}>Pending</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
            </div>
          ))
        ) : departments.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            No departments yet. <Link to="/admin/departments" style={{ color: "var(--primary)", fontWeight: 600 }}>Add one →</Link>
          </div>
        ) : (
          departments.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ flex: 2, fontWeight: 600, color: "var(--text-primary)" }}>{d.departmentName}</span>
              <span style={{ flex: 1, textAlign: "center", color: "var(--text-secondary)" }}>{d.staff}</span>
              <span style={{ flex: 1, textAlign: "center", color: "var(--text-secondary)" }}>{d.assigned}</span>
              <span style={{ flex: 1, textAlign: "center", color: "#1e7a34", fontWeight: 600 }}>{d.resolved}</span>
              <span style={{ flex: 1, textAlign: "center", color: "#8a6d00", fontWeight: 600 }}>{d.pending}</span>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
