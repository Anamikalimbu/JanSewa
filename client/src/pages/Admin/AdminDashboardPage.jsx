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
  <div className="bg-card border border-border rounded-xl p-4 md:p-5 text-center">
    {loading ? (
      <div className="skeleton w-[60px] h-[30px] mx-auto mb-1.5" />
    ) : (
      <div className="font-display text-2xl md:text-[28px] font-bold text-text-primary">
        {value?.toLocaleString?.() ?? value}
      </div>
    )}
    <div className="text-[12.5px] text-text-secondary mt-1 font-medium">{label}</div>
  </div>
);

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

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
      <div className="relative rounded-2xl overflow-hidden mb-5 h-24 md:h-[110px]">
        <img
          src="https://images.unsplash.com/photo-1643576779741-7febf0b3a925?auto=format&fit=crop&w=1200&q=80"
          alt="Admin workspace"
          className="w-full h-full object-cover block"
        />
        <div 
          className="absolute inset-0 flex items-center px-4 md:px-6"
          style={{ background: "linear-gradient(90deg, rgba(0,51,51,0.85) 0%, rgba(0,51,51,0.4) 65%, rgba(0,51,51,0.1) 100%)" }}
        >
          <div className="font-display text-xl md:text-[22px] font-bold text-white">
            Admin Dashboard
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-accent-light text-accent rounded-lg px-3.5 py-2.5 text-[13px] mb-4.5">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <StatCard label="Total Users" value={stats.totalUsers} loading={loading} />
        <StatCard label="Total Departments" value={departments.length} loading={loading} />
        <StatCard label="Total Complaints" value={stats.totalComplaints} loading={loading} />
        <StatCard label="Resolved" value={stats.resolved} loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-[15px] font-bold text-text-primary mb-4">Complaint Analytics</div>
          {loading ? (
            <div className="skeleton w-full h-[140px]" />
          ) : donutData.length === 0 ? (
            <div className="text-[13px] text-text-muted">No complaints yet.</div>
          ) : (
            <DonutChart data={donutData} />
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-[15px] font-bold text-text-primary mb-4">Complaints Over Time</div>
          {loading ? (
            <div className="skeleton w-full h-[160px]" />
          ) : (
            <BarChart data={series} />
          )}
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-text-primary">Recent Complaints</div>
        <Link to="/admin/complaints" className="text-[12.5px] text-primary font-semibold hover:underline">Manage Complaints →</Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto mb-6">
        <div className="flex bg-background px-4 py-2.5 border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider gap-2 min-w-[700px]">
          <span className="w-[60px]">ID</span>
          <span className="flex-[2]">Title</span>
          <span className="flex-[1.5]">Category</span>
          <span className="flex-1">Priority</span>
          <span className="flex-[1.5]">Status</span>
          <span className="w-[60px] text-right">Action</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="flex items-center px-4 py-3 gap-2 border-b border-border min-w-[700px]">
              <div className="skeleton w-[60px] h-3.5" />
              <div className="skeleton flex-[2] h-3.5" />
              <div className="skeleton flex-[1.5] h-3.5" />
              <div className="skeleton flex-1 h-3.5" />
              <div className="skeleton flex-[1.5] h-3.5" />
            </div>
          ))
        ) : recentComplaints.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-text-secondary">No complaints yet.</div>
        ) : (
          recentComplaints.map((c) => (
            <div key={c._id || c.id} className="flex items-center px-4 py-2.5 gap-2 border-b border-border text-[13px] min-w-[700px]">
              <span className="w-[60px] text-[11px] text-text-muted">#{c.code}</span>
              <span className="flex-[2] font-semibold text-text-primary truncate">{c.title}</span>
              <span className="flex-[1.5] text-text-secondary text-[12.5px] truncate">{c.category}</span>
              <span className="flex-1 text-text-secondary text-[12.5px]">{c.priority || "Medium"}</span>
              <span className={`flex-[1.5] text-[11px] font-bold ${c.status === "Resolved" ? "text-[#1e7a34]" : "text-secondary"}`}>{c.status}</span>
              <span className="w-[60px] text-right">
                <Link to={`/admin/complaints`} className="text-[12px] font-bold text-primary border border-border rounded-md px-2.5 py-1 hover:bg-gray-50 transition-colors">
                  View
                </Link>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Departments Overview */}
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-text-primary">Departments Overview</div>
        <Link to="/admin/departments" className="text-[12.5px] text-primary font-semibold hover:underline">Manage →</Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <div className="flex bg-background px-4 py-2.5 border-b border-border text-[11px] font-bold text-text-secondary uppercase tracking-wider gap-2 min-w-[600px]">
          <span className="flex-[2]">Department</span>
          <span className="flex-1 text-center">Staff</span>
          <span className="flex-1 text-center">Assigned</span>
          <span className="flex-1 text-center">Resolved</span>
          <span className="flex-1 text-center">Pending</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="flex items-center px-4 py-3 gap-2 border-b border-border min-w-[600px]">
              <div className="skeleton flex-[2] h-3.5" />
              <div className="skeleton flex-1 h-3.5" />
              <div className="skeleton flex-1 h-3.5" />
              <div className="skeleton flex-1 h-3.5" />
              <div className="skeleton flex-1 h-3.5" />
            </div>
          ))
        ) : departments.length === 0 ? (
          <div className="px-4 py-6 text-center text-[13px] text-text-secondary">
            No departments yet. <Link to="/admin/departments" className="text-primary font-semibold hover:underline">Add one →</Link>
          </div>
        ) : (
          departments.map((d) => (
            <div key={d.id} className="flex items-center px-4 py-2.5 gap-2 border-b border-border text-[13px] min-w-[600px]">
              <span className="flex-[2] font-semibold text-text-primary truncate">{d.departmentName}</span>
              <span className="flex-1 text-center text-text-secondary">{d.staff}</span>
              <span className="flex-1 text-center text-text-secondary">{d.assigned}</span>
              <span className="flex-1 text-center text-[#1e7a34] font-semibold">{d.resolved}</span>
              <span className="flex-1 text-center text-[#8a6d00] font-semibold">{d.pending}</span>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
