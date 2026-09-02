import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DepartmentLayout from "../../../layouts/DepartmentLayout";
import { useAuth } from "../../../context/AuthContext";
import { complaintService } from "../../../services/complaintService";
import { COMPLAINT_STATUS_OPTIONS } from "../../../constants/complaintStatus";

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

const STATUS_STYLES = {
  Pending:    { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00", label: "Pending" },
  Assigned:   { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)", label: "Assigned" },
  InProgress: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)", label: "In Progress" },
  Resolved:   { bg: "rgba(40,167,69,0.14)", fg: "#1e7a34", label: "Resolved" },
  Closed:     { bg: "#eef0f2",              fg: "var(--text-secondary)", label: "Closed" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: "#eef0f2", fg: "var(--text-secondary)", label: status };
  return (
    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

export default function DepartmentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ assigned: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Update-status form
  const [selectedId, setSelectedId] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([
      complaintService.getDepartmentStats(),
      complaintService.getAll({ limit: 10 }),
    ])
      .then(([statsRes, listRes]) => {
        setStats(statsRes.data?.data || {});
        setComplaints(listRes.data?.data || []);
      })
      .catch(() => setError("Couldn't load the department dashboard. Please try refreshing."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "department")) navigate("/home");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user?.role === "department") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || !user || user.role !== "department") return null;

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedId || !newStatus) return;
    setUpdating(true);
    setNotice("");
    setError("");
    try {
      await complaintService.updateStatus(selectedId, newStatus, note.trim());
      setNotice("Complaint status updated.");
      setSelectedId("");
      setNewStatus("");
      setNote("");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't update that complaint's status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DepartmentLayout>
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden", marginBottom: 20, height: 110,
      }}>
        <img
          src="https://images.unsplash.com/photo-1643576779741-7febf0b3a925?auto=format&fit=crop&w=1200&q=80"
          alt="Department workspace"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(0,51,51,0.85) 0%, rgba(0,51,51,0.4) 65%, rgba(0,51,51,0.1) 100%)",
          display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#fff" }}>
            Department Dashboard
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", marginTop: 3 }}>
            Complaints assigned to your department
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ background: "rgba(40,167,69,0.12)", color: "#1e7a34", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
          {notice}
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Assigned" value={stats.assigned} loading={loading} />
        <StatCard label="In Progress" value={stats.inProgress} loading={loading} />
        <StatCard label="Resolved" value={stats.resolved} loading={loading} />
        <StatCard label="Pending" value={stats.pending} loading={loading} />
      </div>

      {/* Assigned complaints table */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Assigned Complaints</div>
        <Link to="/department/assigned" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>View All →</Link>
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ width: 60 }}>ID</span>
          <span style={{ flex: 3 }}>Title</span>
          <span style={{ flex: 2 }}>Priority</span>
          <span style={{ flex: 1.5 }}>Status</span>
          <span style={{ flex: 1.5 }}>Date</span>
          <span style={{ width: 60, textAlign: "right" }}>Action</span>
        </div>

        {loading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ width: 60, height: 14 }} />
              <div className="skeleton" style={{ flex: 3, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 1.5, height: 14 }} />
            </div>
          ))
        ) : complaints.length === 0 ? (
          <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            No complaints have been assigned to your department yet.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ width: 60, fontSize: 11, color: "var(--text-muted)" }}>#{c.code}</span>
              <span style={{ flex: 3, fontWeight: 500, color: "var(--text-primary)" }}>{c.title}</span>
              <span style={{ flex: 2, fontSize: 12, color: "var(--text-secondary)" }}>{c.priority || "Medium"}</span>
              <span style={{ flex: 1.5 }}><StatusBadge status={c.status} /></span>
              <span style={{ flex: 1.5, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(c.createdAt)}</span>
              <span style={{ width: 60, textAlign: "right" }}>
                <Link to={`/complaints/${c.id}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px" }}>
                  View
                </Link>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Update status form */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Update Complaint Status</div>
        <form onSubmit={handleUpdateStatus} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Complaint</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "var(--background)" }}
            >
              <option value="">Select complaint</option>
              {complaints.map((c) => (
                <option key={c.id} value={c.id}>#{c.code} — {c.title}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "1 1 160px" }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              style={{ width: "100%", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "var(--background)" }}
            >
              <option value="">Select status</option>
              {COMPLAINT_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: "2 1 220px" }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Remark / Note</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add note..."
              style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, background: "var(--background)" }}
            />
          </div>
          <button
            type="submit"
            disabled={updating || !selectedId || !newStatus}
            style={{
              padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--primary)",
              color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer",
              opacity: (!selectedId || !newStatus || updating) ? 0.6 : 1, whiteSpace: "nowrap",
            }}
          >
            {updating ? "Updating…" : "Update Status"}
          </button>
        </form>
      </div>
    </DepartmentLayout>
  );
}
