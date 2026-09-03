import { useEffect, useState } from "react";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import { complaintService } from "../../services/complaintService";

/**
 * A simple category breakdown report scoped to this department's own
 * complaints (the backend already restricts GET /complaints to the
 * requesting officer's department).
 */
export default function DepartmentReportsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    complaintService
      .getAll({ limit: 200 })
      .then(({ data }) => { if (mounted) setComplaints(data?.data || []); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const byCategory = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const resolved = complaints.filter((c) => ["Resolved", "Closed"].includes(c.status)).length;
  const resolutionRate = complaints.length ? Math.round((resolved / complaints.length) * 100) : 0;

  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        Reports
      </div>

      <div className="ls-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{complaints.length}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>Total Complaints Handled</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{resolved}</div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>Resolved / Closed</div>
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{resolutionRate}%</div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>Resolution Rate</div>
        </div>
      </div>

      <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>By Category</div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
        {loading ? (
          <div className="skeleton" style={{ width: "100%", height: 80 }} />
        ) : Object.keys(byCategory).length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>No complaints recorded yet for this department.</div>
        ) : (
          Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([category, count]) => (
            <div key={category} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                <span style={{ fontWeight: 600 }}>{category}</span>
                <span style={{ color: "var(--text-secondary)" }}>{count}</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "var(--background)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(count / complaints.length) * 100}%`, background: "var(--primary)" }} />
              </div>
            </div>
          ))
        )}
      </div>
    </DepartmentLayout>
  );
}
