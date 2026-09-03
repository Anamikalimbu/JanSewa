import { useEffect, useState } from "react";
import PublicLayout from "../components/site/PublicLayout";
import { Icon, icons } from "../components/site/icons";
import { announcementService } from "../services/announcementService";

const CATEGORY_STYLE = {
  General: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  Maintenance: { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00" },
  Policy: { bg: "rgba(59,130,246,0.12)", fg: "#1d4ed8" },
  Alert: { bg: "var(--accent-light)", fg: "var(--accent)" },
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    announcementService
      .getAll({ page, limit: 8, ...(category ? { category } : {}) })
      .then(({ data }) => {
        setAnnouncements(data?.data || []);
        setPagination(data?.pagination || null);
      })
      .catch(() => setError("Couldn't load announcements right now. Please try again shortly."))
      .finally(() => setLoading(false));
  }, [page, category]);

  const categories = ["General", "Maintenance", "Policy", "Alert"];

  return (
    <PublicLayout>
      <section style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{
          display: "inline-block", fontSize: 12, fontWeight: 700, color: "var(--primary)",
          background: "rgba(0,128,128,0.1)", padding: "6px 14px", borderRadius: 20, marginBottom: 16,
        }}>
          ANNOUNCEMENTS
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, marginBottom: 10 }}>
          Official Notices &amp; Updates
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto" }}>
          Maintenance windows, policy changes, and service alerts from the JanSewa team.
        </p>
      </section>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
        {["", ...categories].map((c) => (
          <button
            key={c || "all"}
            onClick={() => { setCategory(c); setPage(1); }}
            style={{
              padding: "7px 16px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${category === c ? "var(--primary)" : "var(--border)"}`,
              background: category === c ? "var(--primary)" : "var(--card)",
              color: category === c ? "#fff" : "var(--text-secondary)",
            }}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760, margin: "0 auto" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 10, padding: "14px 18px", fontSize: 13.5, textAlign: "center" }}>
          {error}
        </div>
      )}

      {!loading && !error && announcements.length === 0 && (
        <div style={{
          textAlign: "center", padding: "48px 24px", color: "var(--text-muted)", fontSize: 13.5,
          border: "1px dashed var(--border)", borderRadius: 14, maxWidth: 500, margin: "0 auto",
        }}>
          <Icon d={icons.megaphone} size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
          <div>No announcements in this category right now.</div>
        </div>
      )}

      {!loading && !error && announcements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760, margin: "0 auto" }}>
          {announcements.map((a) => {
            const style = CATEGORY_STYLE[a.category] || CATEGORY_STYLE.General;
            return (
              <div key={a._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {a.isPinned && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>
                        📌 PINNED
                      </span>
                    )}
                    <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 10.5, fontWeight: 700, background: style.bg, color: style.fg }}>
                      {a.category}
                    </span>
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{formatDate(a.createdAt)}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{a.title}</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>{a.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, fontWeight: 600, cursor: pagination.hasPrevPage ? "pointer" : "not-allowed", opacity: pagination.hasPrevPage ? 1 : 0.5 }}
          >
            ← Prev
          </button>
          <span style={{ display: "flex", alignItems: "center", fontSize: 12.5, color: "var(--text-secondary)", padding: "0 8px" }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12.5, fontWeight: 600, cursor: pagination.hasNextPage ? "pointer" : "not-allowed", opacity: pagination.hasNextPage ? 1 : 0.5 }}
          >
            Next →
          </button>
        </div>
      )}
    </PublicLayout>
  );
}
