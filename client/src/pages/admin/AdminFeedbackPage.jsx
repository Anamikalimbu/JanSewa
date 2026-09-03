import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { feedbackService } from "../../services/feedbackService";

const cardStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 };

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const Stars = ({ rating, size = 14 }) => (
  <span style={{ color: "#eab308", fontSize: size, letterSpacing: 1 }}>
    {"★".repeat(rating)}
    <span style={{ color: "var(--border)" }}>{"★".repeat(5 - rating)}</span>
  </span>
);

export default function AdminFeedbackPage() {
  const [stats, setStats] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    feedbackService.getStats().then(({ data }) => setStats(data?.data || null)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    feedbackService
      .getAll({ page, limit: 10 })
      .then(({ data }) => {
        setFeedback(data?.data || []);
        setPagination(data?.pagination || null);
      })
      .catch(() => setError("Couldn't load feedback."))
      .finally(() => setLoading(false));
  }, [page]);

  const maxDist = Math.max(...(stats?.distribution || [{ count: 1 }]).map((d) => d.count), 1);

  return (
    <AdminLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        Citizen Feedback
      </div>

      <div className="ls-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 6 }}>Average Rating</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 700, color: "var(--primary)" }}>
              {stats ? stats.avgRating.toFixed(1) : "—"}
            </span>
            {stats && <Stars rating={Math.round(stats.avgRating)} size={16} />}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>from {stats?.total ?? 0} responses</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Rating Distribution</div>
          {(stats?.distribution || []).map((d) => (
            <div key={d.star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, width: 40, color: "var(--text-secondary)" }}>{d.star} star</span>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--background)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(d.count / maxDist) * 100}%`, background: "var(--primary)" }} />
              </div>
              <span style={{ fontSize: 11.5, width: 24, textAlign: "right", color: "var(--text-muted)" }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 76, borderRadius: 12 }} />)
        ) : feedback.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
            No feedback submitted yet.
          </div>
        ) : (
          feedback.map((f) => (
            <div key={f._id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{f.userId?.name || "Citizen"}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                    {f.complaintId?.title || "Complaint"} · {f.complaintId?.category}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Stars rating={f.rating} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{formatDate(f.createdAt)}</div>
                </div>
              </div>
              {f.message && <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 8 }}>"{f.message}"</div>}
            </div>
          ))
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12, fontWeight: 600, cursor: pagination.hasPrevPage ? "pointer" : "not-allowed", opacity: pagination.hasPrevPage ? 1 : 0.5 }}
          >
            ← Prev
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: 12, color: "var(--text-secondary)", padding: "0 8px" }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12, fontWeight: 600, cursor: pagination.hasNextPage ? "pointer" : "not-allowed", opacity: pagination.hasNextPage ? 1 : 0.5 }}
          >
            Next →
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
