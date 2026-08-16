import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import DonutChart from "../../components/ui/DonutChart";
import BarChart from "../../components/ui/BarChart";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";
import { userService } from "../../services/userService";
import { departmentService } from "../../services/departmentService";
import { complaintService } from "../../services/complaintService";

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
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      complaintService.getAll({ limit: 5 }),
      departmentService.getAll(),
    ])
      .then(([statsRes, catRes, seriesRes, compRes, deptRes]) => {
        setStats(statsRes.data?.data || {});
        setCategories(catRes.data?.data?.categories || []);
        setSeries(seriesRes.data?.data?.series || []);
        setRecentComplaints(compRes.data?.data || []);
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



  return (
    <AdminLayout>
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 20, height: 110,
      }}>
        <img
          src="https://images.unsplash.com/photo-1643576779741-7febf0b3a925?auto=format&fit=crop&w=1200&q=80"
          alt="Admin workspace"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(0,51,51,0.85) 0%, rgba(0,51,51,0.4) 65%, rgba(0,51,51,0.1) 100%)",
          display: "flex", alignItems: "center", padding: "0 24px",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#fff" }}>
            Admin Dashboard
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Users" value={stats.totalUsers} loading={loading} />
        <StatCard label="Total Departments" value={departments.length} loading={loading} />
        <StatCard label="Total Complaints" value={stats.totalComplaints} loading={loading} />
        <StatCard label="Resolved" value={stats.resolved} loading={loading} />
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

      {/* Recent Complaints */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={sectionTitle}>Recent Complaints</div>
        <Link to="/admin/complaints" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>Manage Complaints →</Link>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 24 }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ width: 60 }}>ID</span>
          <span style={{ flex: 2 }}>Title</span>
          <span style={{ flex: 1.5 }}>Category</span>
          <span style={{ flex: 1 }}>Priority</span>
          <span style={{ flex: 1.5 }}>Status</span>
          <span style={{ width: 60, textAlign: "right" }}>Action</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ width: 60, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 1.5, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
              <div className="skeleton" style={{ flex: 1.5, height: 14 }} />
            </div>
          ))
        ) : recentComplaints.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>No complaints yet.</div>
        ) : (
          recentComplaints.map((c) => (
            <div key={c._id || c.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ width: 60, fontSize: 11, color: "var(--text-muted)" }}>#{c.code}</span>
              <span style={{ flex: 2, fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</span>
              <span style={{ flex: 1.5, color: "var(--text-secondary)", fontSize: 12.5 }}>{c.category}</span>
              <span style={{ flex: 1, color: "var(--text-secondary)", fontSize: 12.5 }}>{c.priority || "Medium"}</span>
              <span style={{ flex: 1.5, fontSize: 11, fontWeight: 700, color: c.status === "Resolved" ? "#1e7a34" : "var(--secondary)" }}>{c.status}</span>
              <span style={{ width: 60, textAlign: "right" }}>
                <Link to={`/admin/complaints`} style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px" }}>
                  View
                </Link>
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
