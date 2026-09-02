import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyStateIllustration } from "../../components/common/Illustrations";
import { useLanguage } from "../../context/LanguageContext";
import { complaintService } from "../../services/complaintService";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Pending:    { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00" },
  Assigned:   { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  InProgress: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  Resolved:   { bg: "rgba(40,167,69,0.14)", fg: "#1e7a34" },
  Closed:     { bg: "#eef0f2",              fg: "var(--text-secondary)" },
};

const STATUS_KEY = {
  Pending: "status_pending",
  Assigned: "status_assigned",
  InProgress: "status_inprogress",
  Resolved: "status_resolved",
  Closed: "status_closed",
};

const StatusBadge = ({ status, t }) => {
  const s = STATUS_STYLES[status] || { bg: "#eef0f2", fg: "var(--text-secondary)" };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.fg, whiteSpace: "nowrap",
    }}>
      {t(STATUS_KEY[status] || "status_pending")}
    </span>
  );
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const iconPaths = {
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
};
const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function TrackComplaintsPage() {
  const { t } = useLanguage();

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    const params = { page, limit: PAGE_SIZE, sort: "-createdAt" };
    if (search.trim()) params.search = search.trim();

    complaintService
      .getPublic(params)
      .then(({ data }) => {
        if (!mounted) return;
        setComplaints(data?.data || []);
        setTotal(data?.pagination?.total ?? data?.total ?? 0);
      })
      .catch(() => {
        if (mounted) setError("Couldn't load complaints. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [search, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const rangeStart = (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/images/emblem-of-nepal-sm.png" alt="Logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>JanSewa Tracker</span>
        </div>
        <Link to="/" style={{ fontSize: 14, fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          Public Complaint Tracker
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32 }}>
          Track the status of any complaint submitted in the system. Search by title or Complaint ID.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <div style={{ position: "absolute", left: 14, top: 12, color: "var(--text-muted)" }}>
              <Icon d={iconPaths.search} size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by ID (e.g. CMPA1B2C3) or title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 40px",
                borderRadius: 8, border: "1px solid var(--border)",
                fontSize: 14, boxSizing: "border-box"
              }}
            />
          </div>
          <button type="submit" style={{
            background: "var(--primary)", color: "#fff", border: "none",
            padding: "0 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer"
          }}>
            Search
          </button>
        </form>

        {error && (
          <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "12px 16px", fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{
            display: "flex", background: "var(--background)", padding: "14px 20px",
            borderBottom: "1px solid var(--border)", fontSize: 12, fontWeight: 700,
            color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 12,
          }}>
            <span style={{ flex: 1 }}>ID</span>
            <span style={{ flex: 3 }}>Title</span>
            <span style={{ flex: 2 }}>Category</span>
            <span style={{ flex: 2 }}>Status</span>
            <span style={{ flex: 2 }}>Department</span>
            <span style={{ flex: 1, textAlign: "right" }}>Date</span>
          </div>

          {loading ? (
            [0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 12, borderBottom: "1px solid var(--border)" }}>
                <div className="skeleton" style={{ flex: 1, height: 16 }} />
                <div className="skeleton" style={{ flex: 3, height: 16 }} />
                <div className="skeleton" style={{ flex: 2, height: 16 }} />
                <div className="skeleton" style={{ flex: 2, height: 16 }} />
                <div className="skeleton" style={{ flex: 2, height: 16 }} />
                <div className="skeleton" style={{ flex: 1, height: 16 }} />
              </div>
            ))
          ) : complaints.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <EmptyStateIllustration width={140} />
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)", marginTop: 12 }}>
                No complaints found
              </div>
              {search && (
                <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                  Try adjusting your search terms
                </div>
              )}
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", padding: "16px 20px", gap: 12,
                borderBottom: "1px solid var(--border)", fontSize: 14, color: "var(--text-primary)",
              }}>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>#{c.code}</span>
                <span style={{ flex: 3, fontWeight: 600 }}>{c.title}</span>
                <span style={{ flex: 2, fontSize: 13, color: "var(--text-secondary)" }}>{c.category}</span>
                <span style={{ flex: 2 }}><StatusBadge status={c.status} t={t} /></span>
                <span style={{ flex: 2, fontSize: 13, color: "var(--text-secondary)" }}>{c.department || "Unassigned"}</span>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text-muted)", textAlign: "right" }}>{formatDate(c.createdAt)}</span>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, fontSize: 14, color: "var(--text-secondary)" }}>
            <div>
              Showing {rangeStart}-{rangeEnd} of {total} complaints
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 14, fontWeight: 500, cursor: page === 1 ? "default" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 14, fontWeight: 500, cursor: page === totalPages ? "default" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
