import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import { complaintService } from "../../services/complaintService";

const PAGE_SIZE = 8;

const STATUS_STYLES = {
  Pending:    { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00" },
  Assigned:   { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  InProgress: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  Resolved:   { bg: "rgba(40,167,69,0.14)", fg: "#1e7a34" },
  Closed:     { bg: "#eef0f2",              fg: "var(--text-secondary)" },
};
const STATUS_LABEL = { Pending: "Pending", Assigned: "Assigned", InProgress: "In Progress", Resolved: "Resolved", Closed: "Closed" };

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap" }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
};

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const iconPaths = { search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" };
const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

export default function DepartmentComplaintsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    complaintService.getMyStats().then(({ data }) => setCounts(data?.data || {})).catch(() => {});
  }, [complaints.length]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    const params = { page, limit: PAGE_SIZE };
    if (tab !== "all") params.tab = tab;
    if (search.trim()) params.search = search.trim();

    complaintService
      .getAll(params)
      .then(({ data }) => {
        if (!mounted) return;
        setComplaints(data?.data || []);
        setTotal(data?.pagination?.total ?? 0);
      })
      .catch(() => { if (mounted) setError("Couldn't load complaints. Please try again."); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [tab, search, page]);

  const tabs = [
    { key: "all", label: "All", count: counts.total },
    { key: "inProgress", label: "In Progress", count: counts.inProgress },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "resolved", label: "Resolved", count: counts.resolved },
  ];

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        Department Complaints
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
            <Icon d={iconPaths.search} />
          </span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, ID, or category…"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 36px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5, background: "var(--card)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setPage(1); }}
            style={{
              padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === key ? 700 : 500,
              color: tab === key ? "var(--primary)" : "var(--text-secondary)",
              borderBottom: tab === key ? "2px solid var(--primary)" : "2px solid transparent", marginBottom: -1,
            }}
          >
            {label} {typeof count === "number" ? `(${count})` : ""}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", overflowX: "auto" }}>
        <div style={{ minWidth: 680 }}>
          <div style={{ display: "flex", background: "var(--background)", padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8 }}>
            <span style={{ width: 90 }}>ID</span>
            <span style={{ flex: 3 }}>Title</span>
            <span style={{ flex: 2 }}>Location</span>
            <span style={{ flex: 2 }}>Status</span>
            <span style={{ flex: 2 }}>Date</span>
            <span style={{ width: 70, textAlign: "right" }}>Action</span>
          </div>

          {loading ? (
            [0, 1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ width: 90, height: 14 }} />
                <div className="skeleton" style={{ flex: 3, height: 14 }} />
                <div className="skeleton" style={{ flex: 2, height: 14 }} />
                <div className="skeleton" style={{ flex: 2, height: 14 }} />
                <div className="skeleton" style={{ flex: 2, height: 14 }} />
              </div>
            ))
          ) : complaints.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
              No complaints match this view.
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)" }}>
                <span style={{ width: 90, fontSize: 11.5, color: "var(--text-muted)" }}>#{c.code}</span>
                <span style={{ flex: 3, fontWeight: 500 }}>{c.title}</span>
                <span style={{ flex: 2, fontSize: 12.5, color: "var(--text-secondary)" }}>{c.location?.address}</span>
                <span style={{ flex: 2 }}><StatusBadge status={c.status} /></span>
                <span style={{ flex: 2, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(c.createdAt)}</span>
                <span style={{ width: 70, textAlign: "right" }}>
                  <Link to={`/complaints/${c.id}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px" }}>
                    View
                  </Link>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {total > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12.5, color: "var(--text-secondary)", flexWrap: "wrap", gap: 10 }}>
          <div>Showing {rangeStart}-{rangeEnd} of {total} complaints</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12.5, border: `1px solid ${p === page ? "var(--primary)" : "var(--border)"}`, background: p === page ? "var(--primary)" : "var(--card)", color: p === page ? "#fff" : "var(--text-primary)", fontWeight: p === page ? 700 : 500 }}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
          </div>
        </div>
      )}
    </DepartmentLayout>
  );
}
