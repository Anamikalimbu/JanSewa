import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { adminService } from "../../services/adminService";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function AdminPendingUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/home");
  }, [authLoading, user, navigate]);

  const load = () => {
    setLoading(true);
    setError("");

    adminService
      .getPendingUsers()
      .then(({ data }) => {
        setUsers(data?.data?.users || []);
      })
      .catch(() => setError("Couldn't load pending approvals. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "admin") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading || !user || user.role !== "admin") return null;

  const handleApprove = async (target) => {
    setProcessingId(target._id);
    setNotice("");
    setError("");
    try {
      await adminService.approveUser(target._id);
      setNotice(`${target.name}'s account has been approved.`);
      setUsers((prev) => prev.filter((u) => u._id !== target._id));
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't approve the account.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (target) => {
    setProcessingId(target._id);
    setNotice("");
    setError("");
    try {
      await adminService.rejectUser(target._id, rejectReason);
      setNotice(`${target.name}'s account request has been rejected.`);
      setUsers((prev) => prev.filter((u) => u._id !== target._id));
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't reject the account.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        Pending Approvals
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
        Review and approve or reject department and admin account requests.
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

      {/* Table */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ flex: 3 }}>Name / Email</span>
          <span style={{ flex: 2 }}>Requested Role</span>
          <span style={{ flex: 2 }}>Requested At</span>
          <span style={{ width: 150, textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ flex: 3, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ width: 150, height: 14 }} />
            </div>
          ))
        ) : users.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)" }}>
            There are no pending account requests.
          </div>
        ) : (
          users.map((u) => (
            <div key={u._id} style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", fontSize: 13, opacity: processingId === u._id ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 3 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {u.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{u.email}</div>
                </span>
                <span style={{ flex: 2 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)", textTransform: "capitalize" }}>
                    {u.role === "department" ? "Department Staff" : u.role}
                  </span>
                  {u.role === "department" && u.departmentId?.departmentName && (
                    <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{u.departmentId.departmentName}</div>
                  )}
                </span>
                <span style={{ flex: 2, fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(u.createdAt)}</span>
                <span style={{ width: 150, textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleApprove(u)}
                    disabled={processingId === u._id}
                    style={{
                      fontSize: 11.5, fontWeight: 700, color: "#fff",
                      border: "none",
                      borderRadius: 6, padding: "6px 12px", background: "#1e7a34",
                      cursor: processingId === u._id ? "not-allowed" : "pointer",
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(u._id)}
                    disabled={processingId === u._id}
                    style={{
                      fontSize: 11.5, fontWeight: 700, color: "var(--accent)",
                      border: "1px solid var(--accent)",
                      borderRadius: 6, padding: "5px 11px", background: "var(--card)",
                      cursor: processingId === u._id ? "not-allowed" : "pointer",
                    }}
                  >
                    Reject
                  </button>
                </span>
              </div>

              {/* Inline reject reason input */}
              {rejectingId === u._id && (
                <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", background: "var(--background)", borderRadius: 8, padding: "10px 12px" }}>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Optional rejection reason..."
                    style={{
                      flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border)",
                      fontSize: 12, background: "var(--card)", color: "var(--text-primary)"
                    }}
                  />
                  <button
                    onClick={() => handleReject(u)}
                    disabled={processingId === u._id}
                    style={{
                      fontSize: 11.5, fontWeight: 700, color: "#fff", background: "var(--accent)",
                      border: "none", borderRadius: 6, padding: "7px 14px", cursor: processingId === u._id ? "not-allowed" : "pointer"
                    }}
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => { setRejectingId(null); setRejectReason(""); }}
                    style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
