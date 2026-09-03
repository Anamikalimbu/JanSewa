import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { complaintService } from "../../services/complaintService";
import { departmentService } from "../../services/departmentService";
import { COMPLAINT_STATUS_OPTIONS } from "../../constants/complaintStatus";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Pending:    { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00" },
  Assigned:   { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  InProgress: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  Resolved:   { bg: "rgba(40,167,69,0.14)", fg: "#1e7a34" },
  Closed:     { bg: "#eef0f2",              fg: "var(--text-secondary)" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || { bg: "#eef0f2", fg: "var(--text-secondary)" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const selectStyle = {
  fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)",
  background: "var(--card)", color: "var(--text-primary)", cursor: "pointer",
};

export default function AdminComplaintsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/home");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    departmentService
      .getAll()
      .then(({ data }) => setDepartments(data?.data?.departments || []))
      .catch(() => {});
  }, [user]);

  const load = () => {
    setLoading(true);
    setError("");

    const params = { page, limit: PAGE_SIZE };
    if (tab !== "all") params.tab = tab;
    if (search.trim()) params.search = search.trim();

    complaintService
      .getAll(params)
      .then(({ data }) => {
        setComplaints(data?.data || []);
        setTotal(data?.pagination?.total ?? data?.total ?? 0);
      })
      .catch(() => setError("Couldn't load complaints. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "admin") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab, search, page]);

  if (authLoading || !user || user.role !== "admin") return null;

  const handleStatusChange = async (complaint, status) => {
    if (status === complaint.status) return;
    setSavingId(complaint.id);
    setNotice("");
    setError("");
    try {
      await complaintService.updateStatus(complaint.id, status, "");
      setNotice(`Status updated for #${complaint.code}.`);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't update that complaint's status.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDepartmentChange = async (complaint, departmentId) => {
    setSavingId(complaint.id);
    setNotice("");
    setError("");
    try {
      await complaintService.assignDepartment(complaint.id, departmentId || null);
      setNotice(`Department updated for #${complaint.code}.`);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't reassign that complaint.");
    } finally {
      setSavingId(null);
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "inProgress", label: "In Progress" },
    { key: "resolved", label: "Resolved" },
  ];

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <AdminLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        Complaints
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
        Every complaint on the platform. Reassign departments or update status directly from this list.
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

      {/* Search */}
      <div style={{ marginBottom: 16, maxWidth: 340 }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by title, category, or #code"
          style={{
            width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
            border: "1px solid var(--border)", fontSize: 13.5, background: "var(--card)", color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            style={{
              padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === key ? 700 : 500,
              color: tab === key ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: tab === key ? "2px solid var(--primary)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ width: 60 }}>ID</span>
          <span style={{ flex: 3 }}>Title</span>
          <span style={{ flex: 2 }}>Department</span>
          <span style={{ flex: 1.6 }}>Status</span>
          <span style={{ flex: 1.3 }}>Date</span>
          <span style={{ width: 60, textAlign: "right" }}>View</span>
        </div>

        {loading ? (
          [0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ width: 60, height: 14 }} />
              <div className="skeleton" style={{ flex: 3, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 1.6, height: 14 }} />
            </div>
          ))
        ) : complaints.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)" }}>
            No complaints match this filter.
          </div>
        ) : (
          complaints.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13, opacity: savingId === c.id ? 0.6 : 1 }}>
              <span style={{ width: 60, fontSize: 11, color: "var(--text-muted)" }}>#{c.code}</span>
              <span style={{ flex: 3 }}>
                <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{c.category}{c.location?.address ? ` · ${c.location.address}` : ""}</div>
              </span>
              <span style={{ flex: 2 }}>
                <select
                  value={c.departmentId || ""}
                  onChange={(e) => handleDepartmentChange(c, e.target.value)}
                  disabled={savingId === c.id}
                  style={{ ...selectStyle, width: "100%" }}
                >
                  <option value="">Unassigned</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                  ))}
                </select>
              </span>
              <span style={{ flex: 1.6 }}>
                <select
                  value={c.status}
                  onChange={(e) => handleStatusChange(c, e.target.value)}
                  disabled={savingId === c.id}
                  style={selectStyle}
                >
                  {COMPLAINT_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </span>
              <span style={{ flex: 1.3, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(c.createdAt)}</span>
              <span style={{ width: 60, textAlign: "right" }}>
                <Link to={`/complaints/${c.id}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px" }}>
                  View
                </Link>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12.5, color: "var(--text-secondary)" }}>
          <div>Showing {rangeStart}-{rangeEnd} of {total}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, opacity: page === 1 ? 0.5 : 1 }}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "6px 12px", borderRadius: 6, fontSize: 12.5,
                  border: `1px solid ${p === page ? "var(--primary)" : "var(--border)"}`,
                  background: p === page ? "var(--primary)" : "var(--card)",
                  color: p === page ? "#fff" : "var(--text-primary)", fontWeight: p === page ? 700 : 500,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, opacity: page === totalPages ? 0.5 : 1 }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
