/**
 * pages/citizen/SettingsPage.jsx
 *
 * Real settings screen for citizens: change password, notification
 * preferences (stored locally per-browser), and language.
 */
import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { SettingsIllustration } from "../../components/common/Illustrations";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

const iconPaths = {
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0",
  globe: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  check: "M20 6L9 17l-5-5",
};
const Icon = ({ d, size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);

const SectionCard = ({ icon, title, desc, children }) => (
  <div style={{
    background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
    padding: 24, boxSizing: "border-box", marginBottom: 18,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, background: "rgba(0,128,128,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
      }}>
        <Icon d={icon} size={16} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
    </div>
    {desc && <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 16, marginLeft: 44 }}>{desc}</div>}
    <div style={{ marginLeft: 0 }}>{children}</div>
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
        transition: "background 0.15s",
      }}
      aria-pressed={checked}
    >
      <span style={{
        position: "absolute", top: 2, left: checked ? 20 : 2, width: 18, height: 18,
        borderRadius: "50%", background: "#fff", transition: "left 0.15s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }} />
    </button>
  </div>
);

const PREF_KEY = "jansewa_notif_prefs";
const defaultPrefs = { email: true, inApp: true, sms: false };

export default function SettingsPage() {
  const { changePassword } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

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
  const [pwStatus, setPwStatus] = useState(null); // null | "success" | error string
  const [pwSaving, setPwSaving] = useState(false);

  const handlePwChange = (e) => setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.newPassword.length < 8) {
      setPwStatus("New password must be at least 8 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwStatus("New password and confirmation do not match.");
      return;
    }
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
    width: "100%", padding: "9px 12px", border: "1px solid var(--border)",
    borderRadius: 8, fontSize: 13.5, background: "var(--background)",
    color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
    fontFamily: "var(--font-body)", marginBottom: 12,
  };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 };

  return (
    <DashboardLayout>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, marginBottom: 24,
      }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            Settings
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Manage your password, notifications, and language.
          </div>
        </div>
        <SettingsIllustration width={140} />
      </div>

      <div style={{ maxWidth: 640 }}>
        {/* Change password */}
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

            {pwStatus === "success" && (
              <p style={{ fontSize: 12.5, color: "var(--success)", marginTop: 10 }}>✓ Password changed successfully.</p>
            )}
            {pwStatus && pwStatus !== "success" && (
              <p style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 10 }}>{pwStatus}</p>
            )}
          </form>
        </SectionCard>

        {/* Notification preferences */}
        <SectionCard icon={iconPaths.bell} title="Notification Preferences" desc="Choose how you'd like to hear about updates to your complaints.">
          <Toggle checked={prefs.email} onChange={(v) => updatePref("email", v)} label="Email notifications" description="Status changes and replies sent to your inbox." />
          <Toggle checked={prefs.inApp} onChange={(v) => updatePref("inApp", v)} label="In-app notifications" description="Shown in the bell icon at the top of the dashboard." />
          <Toggle checked={prefs.sms} onChange={(v) => updatePref("sms", v)} label="SMS alerts" description="Text message alerts for urgent status changes." />
        </SectionCard>

        {/* Language */}
        <SectionCard icon={iconPaths.globe} title="Language" desc="Switch the interface between English and Nepali.">
          <div style={{ display: "flex", gap: 10 }}>
            {[{ key: "en", label: "English" }, { key: "ne", label: "नेपाली" }].map((l) => (
              <button
                key={l.key}
                onClick={() => { if (lang !== l.key) toggleLang(); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: 9, cursor: "pointer",
                  border: lang === l.key ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                  background: lang === l.key ? "rgba(0,128,128,0.08)" : "var(--background)",
                  color: lang === l.key ? "var(--primary)" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: 700, fontFamily: "var(--font-body)",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
