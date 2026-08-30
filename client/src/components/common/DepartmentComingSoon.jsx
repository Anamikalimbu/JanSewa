import DepartmentLayout from "../../layouts/DepartmentLayout";

export default function DepartmentComingSoon({ title, description }) {
  return (
    <DepartmentLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
        {title}
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 24 }}>
        {description}
      </div>
      <div style={{
        border: "1px dashed var(--border)", borderRadius: 12, padding: "48px 24px",
        textAlign: "center", color: "var(--text-muted)", fontSize: 13.5, background: "var(--card)",
      }}>
        This page is coming soon.
      </div>
    </DepartmentLayout>
  );
}
