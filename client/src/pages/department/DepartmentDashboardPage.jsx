import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import { useAuth } from "../../context/AuthContext";
import { complaintService } from "../../services/complaintService";

const STATUS_OPTIONS = ["Pending", "Assigned", "InProgress", "Resolved", "Closed"];
const STATUS_LABEL = { Pending: "Pending", Assigned: "Assigned", InProgress: "In Progress", Resolved: "Resolved", Closed: "Closed" };
const STATUS_STYLES = {
  Pending:    { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00" },
  Assigned:   { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  InProgress: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  Resolved:   { bg: "rgba(40,167,69,0.14)", fg: "#1e7a34" },
  Closed:     { bg: "#eef0f2",              fg: "var(--text-secondary)" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
};

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const StatCard = ({ label, value, loading }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
    {loading ? (
      <div className="skeleton" style={{ width: 40, height: 26, marginBottom: 6 }} />
    ) : (
      <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
    )}
    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>{label}</div>
  </div>
);

export default function DepartmentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Update-status form state
  const [selectedId, setSelectedId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([complaintService.getMyStats(), complaintService.getMine({ limit: 8 })])
      .then(([statsRes, recentRes]) => {
        setStats(statsRes.data?.data || {});
        setRecent(recentRes.data?.data?.complaints || []);
      })
      .catch(() => setError("Couldn't load the dashboard. Please try refreshing."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedId || !selectedStatus) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await complaintService.updateStatus(selectedId, selectedStatus, note.trim());
      setSuccess("Complaint status updated successfully.");
      setSelectedId("");
      setSelectedStatus("");
      setNote("");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't update the status.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  const departmentName = user.department?.departmentName || "your department";

  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
        Department Dashboard
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 22 }}>{departmentName}</div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(40,167,69,0.12)", color: "#1e7a34", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {success}
        </div>
      )}

      {/* STAT CARDS */}
      <div className="ls-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
        <StatCard label="Assigned"   value={stats.total} loading={loading} />
        <StatCard label="In Progress" value={stats.inProgress} loading={loading} />
        <StatCard label="Resolved"   value={stats.resolved} loading={loading} />
        <StatCard label="Pending"    value={stats.pending} loading={loading} />
      </div>

      {/* ASSIGNED COMPLAINTS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)" }}>Assigned Complaints</div>
        <Link to="/department/complaints" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>View All &gt;</Link>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 28, overflowX: "auto" }}>
        <div style={{ minWidth: 620 }}>
          <div style={{
            display: "flex", background: "var(--background)", padding: "10px 16px",
            borderBottom: "1px solid var(--border)", fontSize: 11.5, fontWeight: 700,
            color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
          }}>
            <span style={{ flex: 1.5 }}>ID</span>
            <span style={{ flex: 3 }}>Title</span>
            <span style={{ flex: 2.5 }}>Location</span>
            <span style={{ flex: 2 }}>Status</span>
            <span style={{ flex: 2 }}>Date</span>
          </div>

          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ flex: 1.5, height: 14 }} />
                <div className="skeleton" style={{ flex: 3, height: 14 }} />
                <div className="skeleton" style={{ flex: 2.5, height: 14 }} />
                <div className="skeleton" style={{ flex: 2, height: 14 }} />
                <div className="skeleton" style={{ flex: 2, height: 14 }} />
              </div>
            ))
          ) : recent.length === 0 ? (
            <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
              No complaints have been assigned to {departmentName} yet.
            </div>
          ) : (
            recent.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)" }}>
                <span style={{ flex: 1.5, fontSize: 11.5, color: "var(--text-muted)" }}>#{c.code}</span>
                <Link to={`/complaints/${c.id}`} style={{ flex: 3, fontWeight: 500, color: "var(--text-primary)" }}>{c.title}</Link>
                <span style={{ flex: 2.5, fontSize: 12, color: "var(--text-secondary)" }}>{c.location?.address}</span>
                <span style={{ flex: 2 }}><StatusBadge status={c.status} /></span>
                <span style={{ flex: 2, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(c.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* UPDATE COMPLAINT STATUS PANEL — matches the wireframe's "Update Complaint Status" widget */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Update Complaint Status</div>
        <form onSubmit={handleUpdateStatus} className="form-grid-responsive" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1.6fr auto", gap: 10, alignItems: "end" }}>
          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>Complaint</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
            >
              <option value="">Select complaint…</option>
              {recent.map((c) => (
                <option key={c.id} value={c.id}>#{c.code} — {c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
            >
              <option value="">Select status…</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>Remark / Note</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note…"
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !selectedId || !selectedStatus}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--text-primary)",
              color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              opacity: saving || !selectedId || !selectedStatus ? 0.6 : 1,
            }}
          >
            {saving ? "Updating…" : "Update Status"}
          </button>
        </form>
      </div>
    </DepartmentLayout>
  );
}
