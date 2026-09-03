import { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { userService } from "../../services/userService";

export default function SettingsPage() {
  const { user, setUserOverride } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const isDepartment = user?.role === "department";
  const isAdmin = user?.role === "admin";
  const Layout = isAdmin ? AdminLayout : isDepartment ? DepartmentLayout : DashboardLayout;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (newPassword.length < 8) {
      setErr("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await userService.changePassword(currentPassword, newPassword);
      setMsg("Password changed successfully.");
      if (typeof setUserOverride === "function" && data?.data?.user) setUserOverride(data.data.user);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErr(error?.response?.data?.message || "Couldn't change your password.");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5 };
  const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 };

  return (
    <Layout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        Settings
      </div>

      {/* Language preference */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 460, marginBottom: 20 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Language</div>
        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>Choose your preferred display language.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => lang !== "en" && toggleLang()}
            style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${lang === "en" ? "var(--primary)" : "var(--border)"}`,
              background: lang === "en" ? "rgba(0,128,128,0.08)" : "var(--card)",
              color: lang === "en" ? "var(--primary)" : "var(--text-secondary)",
            }}
          >
            English
          </button>
          <button
            onClick={() => lang !== "ne" && toggleLang()}
            style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
              border: `1.5px solid ${lang === "ne" ? "var(--primary)" : "var(--border)"}`,
              background: lang === "ne" ? "rgba(0,128,128,0.08)" : "var(--card)",
              color: lang === "ne" ? "var(--primary)" : "var(--text-secondary)",
            }}
          >
            नेपाली
          </button>
        </div>
      </div>

      {/* Change password */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 22, maxWidth: 460 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Change Password</div>
        <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14 }}>Use a strong password you don't use elsewhere.</div>

        {msg && <div style={{ background: "rgba(40,167,69,0.12)", color: "#1e7a34", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, marginBottom: 14 }}>{msg}</div>}
        {err && <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, marginBottom: 14 }}>{err}</div>}

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} required minLength={8} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required minLength={8} />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
