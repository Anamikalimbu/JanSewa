import { useEffect, useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import DepartmentLayout from "../../components/department/DepartmentLayout";
import AdminLayout from "../../components/admin/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";

export default function ProfilePage() {
  const { user, setUserOverride } = useAuth();
  const isDepartment = user?.role === "department";
  const isAdmin = user?.role === "admin";
  const Layout = isAdmin ? AdminLayout : isDepartment ? DepartmentLayout : DashboardLayout;

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const { data } = await userService.updateProfile({ name: name.trim(), phone: phone.trim() });
      setMsg("Profile updated successfully.");
      if (typeof setUserOverride === "function") setUserOverride(data?.data?.user);
    } catch (error) {
      setErr(error?.response?.data?.message || "Couldn't update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Layout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 18 }}>
        My Profile
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          color: "#fff", fontSize: 22, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{user?.email}</div>
          <div style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>
            {user?.role}{user?.department?.departmentName ? ` · ${user.department.departmentName}` : ""}
          </div>
        </div>
      </div>

      {msg && <div style={{ background: "rgba(40,167,69,0.12)", color: "#1e7a34", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{msg}</div>}
      {err && <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{err}</div>}

      <form onSubmit={handleSave} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, maxWidth: 460 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Phone Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98XXXXXXXX"
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5 }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Email</label>
          <input
            value={user?.email || ""}
            disabled
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13.5, background: "var(--background)", color: "var(--text-muted)" }}
          />
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Email cannot be changed.</div>
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13.5, cursor: "pointer", opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </Layout>
  );
}
