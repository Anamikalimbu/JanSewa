import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DepartmentLayout from "../../../layouts/DepartmentLayout";
import { useAuth } from "../../../context/AuthContext";
import { departmentService } from "../../../services/departmentService";

export default function DepartmentDepartmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "department")) navigate("/home");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user?.role !== "department") return;
    setLoading(true);
    setError("");
    departmentService
      .getDirectory()
      .then(({ data }) => setDepartments(data?.data?.departments || []))
      .catch(() => setError("Couldn't load the department directory."))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user || user.role !== "department") return null;

  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        Departments
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
        Other departments on JanSewa, for context on who handles what.
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18 }}>
              <div className="skeleton" style={{ width: "60%", height: 16, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: "90%", height: 12, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: "40%", height: 12 }} />
            </div>
          ))
        ) : departments.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}>
            No departments have been set up yet.
          </div>
        ) : (
          departments.map((d) => {
            const myDeptId = user.departmentId?._id || user.departmentId;
            const isMine = myDeptId && String(d._id || d.id) === String(myDeptId);
            return (
              <div
                key={d._id || d.id}
                style={{
                  background: "var(--card)", border: `1px solid ${isMine ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 12, padding: 18, position: "relative",
                }}
              >
                {isMine && (
                  <span style={{
                    position: "absolute", top: 14, right: 14, fontSize: 10.5, fontWeight: 700,
                    color: "var(--primary)", background: "rgba(0,128,128,0.1)", padding: "2px 8px", borderRadius: 20,
                  }}>
                    Your department
                  </span>
                )}
                <div style={{ fontSize: 15.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, paddingRight: isMine ? 90 : 0 }}>
                  {d.departmentName}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 10, minHeight: 16 }}>
                  {d.description || "No description provided."}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
                  ✉ {d.contactEmail}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {(d.categories || []).length === 0 ? (
                    <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>No categories assigned</span>
                  ) : (
                    d.categories.map((c) => (
                      <span key={c} style={{ fontSize: 10, fontWeight: 600, color: "var(--secondary)", background: "rgba(0,128,128,0.1)", padding: "1px 7px", borderRadius: 20 }}>
                        {c}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DepartmentLayout>
  );
}
