import DepartmentLayout from "../../components/department/DepartmentLayout";
import { useAuth } from "../../context/AuthContext";

/**
 * Read-only view of the staff member's own department — department staff
 * can see their department's contact info but only an admin can edit it.
 */
export default function DepartmentInfoPage() {
  const { user } = useAuth();
  const department = user?.department;

  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        My Department
      </div>

      {!department ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, fontSize: 13.5, color: "var(--text-secondary)" }}>
          No department is linked to your account yet. Please contact an administrator.
        </div>
      ) : (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 480 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{department.departmentName}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18 }}>{department.description || "No description provided."}</div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed var(--border)", fontSize: 13 }}>
            <span style={{ color: "var(--text-secondary)" }}>Contact Email</span>
            <span style={{ fontWeight: 600 }}>{department.contactEmail}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13 }}>
            <span style={{ color: "var(--text-secondary)" }}>Your Designation</span>
            <span style={{ fontWeight: 600 }}>{user?.designation || "Field Officer"}</span>
          </div>
        </div>
      )}
    </DepartmentLayout>
  );
}
