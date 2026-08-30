import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import { useAuth } from "../../context/AuthContext";
import { complaintService } from "../../services/complaintService";

const STATUS_STYLES = {
  Pending:    { bg: "rgba(255,193,7,0.15)", fg: "#8a6d00" },
  Assigned:   { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  InProgress: { bg: "rgba(0,128,128,0.12)", fg: "var(--secondary)" },
  Resolved:   { bg: "rgba(40,167,69,0.14)", fg: "#1e7a34" },
  Closed:     { bg: "#eef0f2",              fg: "var(--text-secondary)" },
};
const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.fg }}>{status}</span>;
};
const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

/**
 * "Assigned to Me" — complaints in the department queue that have this
 * specific staff member named as the officer of record, i.e. a narrower
 * personal queue on top of the department-wide list.
 */
export default function DepartmentAssignedPage() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    complaintService
      .getAll({ limit: 100 })
      .then(({ data }) => { if (mounted) setAll(data?.data || []); })
      .catch(() => { if (mounted) setError("Couldn't load your assigned complaints."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const mine = all.filter(
    (c) => c.assignedOfficer && user?.name && c.assignedOfficer.toLowerCase().includes(user.name.toLowerCase())
  );

  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
        Assigned to Me
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18 }}>
        Complaints where you're named as the officer of record.
      </div>

      {error && <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ width: "60%", height: 14 }} />
            </div>
          ))
        ) : mine.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            No complaints are currently assigned to you by name. Your admin assigns officers when routing a complaint.
          </div>
        ) : (
          mine.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 10, borderBottom: "1px solid var(--border)", fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ flex: 1, minWidth: 160, fontWeight: 500 }}>{c.title}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{formatDate(c.createdAt)}</span>
              <StatusBadge status={c.status} />
              <Link to={`/complaints/${c.id}`} style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px" }}>
                View
              </Link>
            </div>
          ))
        )}
      </div>
    </DepartmentLayout>
  );
}
