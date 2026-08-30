import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { complaintService } from "../../services/complaintService";
import { departmentService } from "../../services/departmentService";
import { feedbackService } from "../../services/feedbackService";

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
const STATUS_LABEL_PLAIN = { Pending: "Pending", Assigned: "Assigned", InProgress: "In Progress", Resolved: "Resolved", Closed: "Closed" };
const STATUS_ORDER = ["Pending", "Assigned", "InProgress", "Resolved"];
const STATUS_OPTIONS = ["Pending", "Assigned", "InProgress", "Resolved", "Closed"];

const StatusBadge = ({ status, t }) => {
  const s = STATUS_STYLES[status] || { bg: "#eef0f2", fg: "var(--text-secondary)" };
  return (
    <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12.5, fontWeight: 700, background: s.bg, color: s.fg }}>
      {t ? t(STATUS_KEY[status] || "status_pending") : STATUS_LABEL_PLAIN[status] || status}
    </span>
  );
};

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const infoRow = { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border)", fontSize: 13 };

export default function ComplaintDetailPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  // --- staff/admin management state ---
  const [statusChoice, setStatusChoice] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [manageMsg, setManageMsg] = useState("");

  const [departments, setDepartments] = useState([]);
  const [assignDept, setAssignDept] = useState("");
  const [assignOfficer, setAssignOfficer] = useState("");
  const [assigning, setAssigning] = useState(false);

  // --- citizen feedback state ---
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [fbRating, setFbRating] = useState(0);
  const [fbHoverRating, setFbHoverRating] = useState(0);
  const [fbMessage, setFbMessage] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbError, setFbError] = useState("");

  const isCitizen = user?.role === "citizen";
  const isDepartment = user?.role === "department";
  const isAdmin = user?.role === "admin";
  const Layout = isAdmin ? AdminLayout : isDepartment ? DepartmentLayout : DashboardLayout;
  const isResolvedOrClosed = complaint?.status === "Resolved" || complaint?.status === "Closed";

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

  useEffect(() => {
    if (!isAdmin) return;
    departmentService.getAll().then(({ data }) => setDepartments(data?.data?.departments || [])).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!isResolvedOrClosed) return;
    setFeedbackLoading(true);
    feedbackService
      .getForComplaint(id)
      .then(({ data }) => setFeedback(data?.data?.feedback || null))
      .catch(() => {})
      .finally(() => setFeedbackLoading(false));
  }, [isResolvedOrClosed, id]);

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

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusChoice) return;
    setSavingStatus(true);
    setManageMsg("");
    try {
      await complaintService.updateStatus(id, statusChoice, statusNote.trim());
      setManageMsg("Status updated successfully.");
      setStatusChoice("");
      setStatusNote("");
      loadComplaint();
    } catch (err) {
      setManageMsg(err?.response?.data?.message || "Couldn't update the status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignDept) return;
    setAssigning(true);
    setManageMsg("");
    try {
      await complaintService.assign(id, assignDept, assignOfficer.trim());
      setManageMsg("Complaint routed successfully.");
      setAssignDept("");
      setAssignOfficer("");
      loadComplaint();
    } catch (err) {
      setManageMsg(err?.response?.data?.message || "Couldn't assign this complaint.");
    } finally {
      setAssigning(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!fbRating) {
      setFbError("Please select a star rating before submitting.");
      return;
    }
    setFbSubmitting(true);
    setFbError("");
    try {
      const { data } = await feedbackService.submit(id, fbRating, fbMessage.trim());
      setFeedback(data?.data?.feedback || null);
      setFbMessage("");
      setFbRating(0);
    } catch (err) {
      setFbError(err?.response?.data?.message || "Couldn't submit your feedback.");
    } finally {
      setFbSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="skeleton" style={{ width: 200, height: 20, marginBottom: 20 }} />
        <div className="skeleton" style={{ width: "100%", height: 220, borderRadius: 12 }} />
      </Layout>
    );
  }

  if (error && !complaint) {
    return (
      <Layout>
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "14px 18px", fontSize: 13.5 }}>
          {error}
        </div>
        <Link to={isAdmin ? "/admin/complaints" : isDepartment ? "/department/complaints" : "/complaints"} style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: "var(--primary)", fontWeight: 600 }}>
          ← {t("detail_back")}
        </Link>
      </Layout>
    );
  }

  if (!complaint) return null;

  const currentStepIndex =
    complaint.status === "Closed" ? STATUS_ORDER.length : STATUS_ORDER.indexOf(complaint.status);

  return (
    <Layout>
      <Link
        to={isAdmin ? "/admin/complaints" : isDepartment ? "/department/complaints" : "/complaints"}
        style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600, display: "inline-block", marginBottom: 10 }}
      >
        ← {isCitizen ? t("detail_back") : "Back to complaints"}
      </Link>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        {isCitizen ? t("detail_title") : "Complaint Details"}
      </div>

      {/* Complaint info card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>{complaint.title}</div>
          <StatusBadge status={complaint.status} t={isCitizen ? t : null} />
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

      {/* Staff/Admin management panel — status update + (admin-only) assign to department */}
      {(isDepartment || isAdmin) && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Manage This Complaint</div>

          {manageMsg && (
            <div style={{ background: "rgba(0,128,128,0.1)", color: "var(--secondary)", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, marginBottom: 14 }}>
              {manageMsg}
            </div>
          )}

          {isAdmin && (
            <form onSubmit={handleAssign} className="form-grid-responsive" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr auto", gap: 10, alignItems: "end", marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid var(--border)" }}>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>Route to Department</label>
                <select value={assignDept} onChange={(e) => setAssignDept(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
                  <option value="">Select department…</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.departmentName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>Assigned Officer (optional)</label>
                <input value={assignOfficer} onChange={(e) => setAssignOfficer(e.target.value)} placeholder="e.g. Ram Bahadur" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }} />
              </div>
              <button type="submit" disabled={assigning || !assignDept} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: assigning || !assignDept ? 0.6 : 1, whiteSpace: "nowrap" }}>
                {assigning ? "Routing…" : "Assign"}
              </button>
            </form>
          )}

          <form onSubmit={handleUpdateStatus} className="form-grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>New Status</label>
              <select value={statusChoice} onChange={(e) => setStatusChoice(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
                <option value="">Select status…</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL_PLAIN[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 }}>Remark / Note</label>
              <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Add a note for the citizen…" style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }} />
            </div>
            <button type="submit" disabled={savingStatus || !statusChoice} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--text-primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: savingStatus || !statusChoice ? 0.6 : 1, whiteSpace: "nowrap" }}>
              {savingStatus ? "Updating…" : "Update Status"}
            </button>
          </form>
        </div>
      )}

      {/* Citizen Feedback — visible once a complaint has been resolved */}
      {isResolvedOrClosed && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Citizen Feedback</div>

          {feedbackLoading ? (
            <div className="skeleton" style={{ width: "100%", height: 60, borderRadius: 8 }} />
          ) : feedback ? (
            <div>
              <div style={{ fontSize: 22, color: "#eab308", letterSpacing: 3, marginBottom: 8 }}>
                {"★".repeat(feedback.rating)}
                <span style={{ color: "var(--border)" }}>{"★".repeat(5 - feedback.rating)}</span>
              </div>
              {feedback.message && (
                <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
                  "{feedback.message}"
                </div>
              )}
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 8 }}>
                Submitted {formatDateTime(feedback.createdAt)}
              </div>
            </div>
          ) : isCitizen ? (
            <form onSubmit={handleSubmitFeedback}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                How was your experience with how this complaint was handled?
              </p>
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFbRating(star)}
                    onMouseEnter={() => setFbHoverRating(star)}
                    onMouseLeave={() => setFbHoverRating(0)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: 28, lineHeight: 1, color: (fbHoverRating || fbRating) >= star ? "#eab308" : "var(--border)" }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={fbMessage}
                onChange={(e) => setFbMessage(e.target.value)}
                placeholder="Optional: tell us more about your experience…"
                rows={3}
                style={{ width: "100%", boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, marginBottom: 12, fontFamily: "var(--font-body)" }}
              />
              {fbError && <div style={{ color: "var(--accent)", fontSize: 12.5, marginBottom: 10 }}>{fbError}</div>}
              <button
                type="submit"
                disabled={fbSubmitting}
                style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: fbSubmitting ? 0.7 : 1 }}
              >
                {fbSubmitting ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>The citizen hasn't left feedback yet.</div>
          )}
        </div>
      )}

      {/* Actions (citizen-facing) */}
      {isCitizen && (
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
      )}

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

        <form onSubmit={handleAddComment} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t("detail_commentPlaceholder")}
            style={{ flex: 1, minWidth: 160, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
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
    </Layout>
  );
}
