/**
 * pages/department/DepartmentProfilePage.jsx
 * Profile screen for department staff — same editable pattern used by
 * citizens/admins, wrapped in DepartmentLayout and showing the
 * assigned department name.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DepartmentLayout from "../../../layouts/DepartmentLayout";
import { ProfileIllustration } from "../../../components/common/Illustrations";
import { useAuth } from "../../../context/AuthContext";
import { userService } from "../../../services/userService";

const iconPaths = {
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  building: "M5 21V7l7-4 7 4v14M3 21h18M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",
};
const Icon = ({ d, size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);

const Field = ({ label, name, value, onChange, editing, readOnly = false, icon }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
      {icon && <Icon d={icon} size={13} />} {label}
    </label>
    {editing && !readOnly ? (
      <input
        type="text" name={name} value={value} onChange={onChange}
        style={{
          width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
          borderRadius: 8, fontSize: 13.5, background: "var(--background)",
          color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
          fontFamily: "var(--font-body)",
        }}
      />
    ) : (
      <div style={{ padding: "9px 12px", borderRadius: 8, fontSize: 13.5, color: "var(--text-primary)", background: "var(--background)" }}>
        {value || <span style={{ color: "var(--text-muted)" }}>Not set</span>}
      </div>
    )}
  </div>
);

export default function DepartmentProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "department")) navigate("/home");
  }, [authLoading, user, navigate]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user]);

  const initials = (user?.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const deptName = user?.departmentId?.departmentName;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    setStatus(null);
    try {
      const { data } = await userService.update(user._id, form);
      updateUser(data?.data?.user || form);
      setStatus("success");
      setEditing(false);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setStatus(null), 3500);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || "", phone: user?.phone || "" });
    setEditing(false);
  };

  if (authLoading || !user || user.role !== "department") return null;

  return (
    <DepartmentLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>My Profile</div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Your staff account details.</div>
        </div>
        <ProfileIllustration width={130} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, alignItems: "start", maxWidth: 780 }}>
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, textAlign: "center", boxSizing: "border-box" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", margin: "0 auto 14px",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            color: "#fff", fontSize: 24, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {initials}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>{user?.email}</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,128,128,0.1)",
            color: "var(--primary)", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
          }}>
            <Icon d={iconPaths.building} size={12} /> {deptName ? `${deptName} Dept.` : "Department Staff"}
          </div>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Account Details</div>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{
                display: "flex", alignItems: "center", gap: 6, background: "none",
                border: "1.5px solid var(--primary)", color: "var(--primary)", fontSize: 12.5,
                fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
              }}>
                <Icon d={iconPaths.edit} size={14} /> Edit
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleCancel} style={{
                  display: "flex", alignItems: "center", gap: 6, background: "none",
                  border: "1.5px solid var(--border)", color: "var(--text-secondary)", fontSize: 12.5,
                  fontWeight: 600, padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                }}>
                  <Icon d={iconPaths.x} size={14} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  display: "flex", alignItems: "center", gap: 6, background: "var(--primary)",
                  border: "none", color: "#fff", fontSize: 12.5, fontWeight: 600,
                  padding: "7px 14px", borderRadius: 8, cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}>
                  <Icon d={iconPaths.check} size={14} /> {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          <Field label="Full Name" name="name" value={form.name} onChange={handleChange} editing={editing} />
          <Field label="Email Address" value={user?.email} editing={false} readOnly icon={iconPaths.mail} />
          <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} editing={editing} icon={iconPaths.phone} />
          <Field label="Department" value={deptName} editing={false} readOnly icon={iconPaths.building} />

          {status === "success" && <p style={{ fontSize: 12.5, color: "var(--success)", marginTop: 4 }}>✓ Profile updated successfully.</p>}
          {status === "error" && <p style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 4 }}>Something went wrong. Please try again.</p>}
        </div>
      </div>
    </DepartmentLayout>
  );
}
