/**
 * pages/department/DepartmentSettingsPage.jsx
 * Password change + notification preferences for department staff.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DepartmentLayout from "../../../layouts/DepartmentLayout";
import { SettingsIllustration } from "../../../components/common/Illustrations";
import { useAuth } from "../../../context/AuthContext";

const iconPaths = {
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0",
  check: "M20 6L9 17l-5-5",
};
const Icon = ({ d, size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);

const SectionCard = ({ icon, title, desc, children }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, boxSizing: "border-box", marginBottom: 18 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(0,128,128,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
        <Icon d={icon} size={16} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
    </div>
    {desc && <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 16, marginLeft: 44 }}>{desc}</div>}
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
      {description && <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 20, border: "none", cursor: "pointer",
        background: checked ? "var(--primary)" : "var(--border)", position: "relative", flexShrink: 0,
      }}
      aria-pressed={checked}
    >
      <span style={{ position: "absolute", top: 2, left: checked ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
    </button>
  </div>
);

const PREF_KEY = "jansewa_dept_prefs";
const defaultPrefs = { newAssignment: true, dailySummary: false };

export default function DepartmentSettingsPage() {
  const { user, loading: authLoading, changePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "department")) navigate("/home");
  }, [authLoading, user, navigate]);

  const [prefs, setPrefs] = useState(defaultPrefs);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY));
      if (saved) setPrefs({ ...defaultPrefs, ...saved });
    } catch {}
  }, []);
  const updatePref = (key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(PREF_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwStatus, setPwStatus] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  const handlePwChange = (e) => setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.newPassword.length < 8) { setPwStatus("New password must be at least 8 characters."); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwStatus("New password and confirmation do not match."); return; }
    setPwSaving(true);
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwStatus("success");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwStatus(err?.response?.data?.message || "Could not change password. Check your current password.");
    } finally {
      setPwSaving(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 8,
    fontSize: 13.5, background: "var(--background)", color: "var(--text-primary)",
    outline: "none", boxSizing: "border-box", fontFamily: "var(--font-body)", marginBottom: 12,
  };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 };

  if (authLoading || !user || user.role !== "department") return null;

  return (
    <DepartmentLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>Settings</div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Manage your password and alert preferences.</div>
        </div>
        <SettingsIllustration width={130} />
      </div>

      <div style={{ maxWidth: 640 }}>
        <SectionCard icon={iconPaths.lock} title="Change Password" desc="Use a strong password you don't use elsewhere.">
          <form onSubmit={handlePwSubmit} noValidate>
            <label style={labelStyle}>Current Password</label>
            <input type="password" name="currentPassword" value={pwForm.currentPassword} onChange={handlePwChange} style={inputStyle} required />
            <label style={labelStyle}>New Password</label>
            <input type="password" name="newPassword" value={pwForm.newPassword} onChange={handlePwChange} style={inputStyle} required minLength={8} />
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" name="confirmPassword" value={pwForm.confirmPassword} onChange={handlePwChange} style={inputStyle} required minLength={8} />

            <button type="submit" disabled={pwSaving} style={{
              display: "flex", alignItems: "center", gap: 8, background: "var(--primary)", color: "#fff",
              border: "none", borderRadius: 9, padding: "10px 20px", fontSize: 13.5, fontWeight: 600,
              cursor: pwSaving ? "default" : "pointer", opacity: pwSaving ? 0.7 : 1, fontFamily: "var(--font-body)",
            }}>
              <Icon d={iconPaths.check} size={15} /> {pwSaving ? "Updating…" : "Update Password"}
            </button>

            {pwStatus === "success" && <p style={{ fontSize: 12.5, color: "var(--success)", marginTop: 10 }}>✓ Password changed successfully.</p>}
            {pwStatus && pwStatus !== "success" && <p style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 10 }}>{pwStatus}</p>}
          </form>
        </SectionCard>

        <SectionCard icon={iconPaths.bell} title="Notification Preferences" desc="Choose how you'd like to be alerted about assigned complaints.">
          <Toggle checked={prefs.newAssignment} onChange={(v) => updatePref("newAssignment", v)} label="New assignment alerts" description="Get notified when a complaint is assigned to you." />
          <Toggle checked={prefs.dailySummary} onChange={(v) => updatePref("dailySummary", v)} label="Daily summary email" description="A recap of your open and resolved complaints each day." />
        </SectionCard>
      </div>
    </DepartmentLayout>
  );
}
