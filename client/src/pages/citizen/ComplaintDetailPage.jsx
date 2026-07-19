import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { complaintService } from "../../services/complaintService";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const STATUS_STYLES = {
  Pending:    { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00" },
  Assigned:   { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  InProgress: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  Resolved:   { bg: "rgba(40,167,69,0.14)", fg: "#1e7a34" },
  Closed:     { bg: "#eef0f2",              fg: "var(--text-secondary)" },
};
const STATUS_KEY = {
  Pending: "status_pending", Assigned: "status_assigned", InProgress: "status_inprogress",
  Resolved: "status_resolved", Closed: "status_closed",
};
const STATUS_ORDER = ["Pending", "Assigned", "InProgress", "Resolved"];

const StatusBadge = ({ status, t }) => {
  const s = STATUS_STYLES[status] || { bg: "#eef0f2", fg: "var(--text-secondary)" };
  return (
    <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12.5, fontWeight: 700, background: s.bg, color: s.fg }}>
      {t(STATUS_KEY[status] || "status_pending")}
    </span>
  );
};

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const infoRow = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border)", fontSize: 13 };

export default function ComplaintDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const loadComplaint = () => {
    setLoading(true);
    setError("");
    complaintService
      .getById(id)
      .then(({ data }) => setComplaint(data?.data?.complaint || null))
      .catch((err) => setError(err?.response?.data?.message || "Couldn't load this complaint."))
      .finally(() => setLoading(false));
  };

  useEffect(loadComplaint, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await complaintService.addComment(id, commentText.trim());
      setCommentText("");
      loadComplaint();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't post your comment.");
    } finally {
      setPosting(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReporting(true);
    try {
      await complaintService.reportIssue(id, reportReason.trim());
      setReportDone(true);
      setReportReason("");
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't submit your report.");
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="skeleton" style={{ width: 200, height: 20, marginBottom: 20 }} />
        <div className="skeleton" style={{ width: "100%", height: 220, borderRadius: 12 }} />
      </DashboardLayout>
    );
  }

  if (error && !complaint) {
    return (
      <DashboardLayout>
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "14px 18px", fontSize: 13.5 }}>
          {error}
        </div>
        <Link to="/complaints" style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>
          ← {t("detail_back")}
        </Link>
      </DashboardLayout>
    );
  }

  if (!complaint) return null;

  const currentStepIndex =
    complaint.status === "Closed" ? STATUS_ORDER.length : STATUS_ORDER.indexOf(complaint.status);

  return (
    <DashboardLayout>
      <Link to="/complaints" style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600, display: "inline-block", marginBottom: 10 }}>
        ← {t("detail_back")}
      </Link>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        {t("detail_title")}
      </div>

      {/* Complaint info card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>{complaint.title}</div>
          <StatusBadge status={complaint.status} t={t} />
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {complaint.images?.length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", width: 160 }}>
              {complaint.images.map((src, i) => (
                <img key={i} src={`${API_ORIGIN}${src}`} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
              ))}
            </div>
          ) : (
            <div style={{
              width: 160, height: 100, borderRadius: 8, border: "1px dashed var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--text-muted)",
            }}>
              No images
            </div>
          )}

          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={infoRow}><span style={{ color: "var(--text-secondary)" }}>{t("detail_complaintId")}</span><span style={{ fontWeight: 600 }}>#{complaint.code}</span></div>
            <div style={infoRow}><span style={{ color: "var(--text-secondary)" }}>{t("detail_category")}</span><span style={{ fontWeight: 600 }}>{complaint.category}{complaint.subCategory ? ` · ${complaint.subCategory}` : ""}</span></div>
            <div style={infoRow}><span style={{ color: "var(--text-secondary)" }}>{t("detail_location")}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{complaint.location?.address}{complaint.wardNumber ? `, Ward ${complaint.wardNumber}` : ""}</span></div>
            <div style={infoRow}><span style={{ color: "var(--text-secondary)" }}>{t("detail_dateSubmitted")}</span><span style={{ fontWeight: 600 }}>{formatDateTime(complaint.createdAt)}</span></div>
            <div style={infoRow}><span style={{ color: "var(--text-secondary)" }}>{t("detail_department")}</span><span style={{ fontWeight: 600 }}>{complaint.department || t("detail_notAssigned")}</span></div>
            <div style={{ ...infoRow, borderBottom: "none" }}><span style={{ color: "var(--text-secondary)" }}>{t("detail_assignedTo")}</span><span style={{ fontWeight: 600 }}>{complaint.assignedOfficer || t("detail_notAssigned")}</span></div>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>{t("detail_description")}</div>
          <div style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.6 }}>{complaint.description}</div>
        </div>
      </div>

      {/* Status timeline */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>{t("detail_statusTimeline")}</div>

        {(complaint.statusHistory?.length ? complaint.statusHistory : [{ status: "Pending", changedAt: complaint.createdAt }]).map((step, i, arr) => (
          <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 3 }} />
              {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: "var(--border)", minHeight: 28 }} />}
            </div>
            <div style={{ paddingBottom: 20 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{t(STATUS_KEY[step.status] || "status_pending")}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{formatDateTime(step.changedAt)}{step.note ? ` · ${step.note}` : ""}</div>
            </div>
          </div>
        ))}

        {STATUS_ORDER.slice(currentStepIndex + 1).filter((s) => s !== complaint.status).map((s) => (
          <div key={s} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--border)", flexShrink: 0, marginTop: 3 }} />
            </div>
            <div style={{ paddingBottom: 20, fontSize: 13.5, color: "var(--text-muted)" }}>
              {t(STATUS_KEY[s])}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <a href="#comments" style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13.5 }}>
          {t("detail_addComment")}
        </a>
        <button
          onClick={() => setReportOpen((o) => !o)}
          style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--accent)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
        >
          {t("detail_reportIssue")}
        </button>
      </div>

      {reportOpen && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{t("detail_reportTitle")}</div>
          {reportDone ? (
            <div style={{ fontSize: 13, color: "#1e7a34" }}>{t("detail_reportSuccess")}</div>
          ) : (
            <form onSubmit={handleReport}>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={t("detail_reportPlaceholder")}
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, marginBottom: 10, fontFamily: "var(--font-body)" }}
              />
              <button
                type="submit"
                disabled={reporting || !reportReason.trim()}
                style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: reporting ? 0.7 : 1 }}
              >
                {t("detail_reportSubmit")}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Comments */}
      <div id="comments" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>{t("detail_comments")}</div>

        {complaint.comments?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {complaint.comments.map((c, i) => (
              <div key={i} style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{c.authorName}</span>
                  <span style={{ color: "var(--text-muted)" }}>{formatDateTime(c.createdAt)}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{c.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>{t("detail_noComments")}</div>
        )}

        <form onSubmit={handleAddComment} style={{ display: "flex", gap: 10 }}>
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t("detail_commentPlaceholder")}
            style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
          />
          <button
            type="submit"
            disabled={posting || !commentText.trim()}
            style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: posting ? 0.7 : 1 }}
          >
            {t("detail_postComment")}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
