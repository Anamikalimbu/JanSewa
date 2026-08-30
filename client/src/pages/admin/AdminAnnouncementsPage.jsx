import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { announcementService } from "../../services/announcementService";

const emptyForm = { title: "", message: "", category: "General", isPinned: false };
const categories = ["General", "Maintenance", "Policy", "Alert"];

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--font-body)" };
const labelStyle = { display: "block", fontSize: 11.5, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 5 };

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    announcementService
      .getAll({ limit: 50, includeInactive: true })
      .then(({ data }) => setAnnouncements(data?.data || []))
      .catch(() => setError("Couldn't load announcements."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErr("");
    setShowForm(true);
  };

  const openEdit = (a) => {
    setEditingId(a._id);
    setForm({ title: a.title, message: a.message, category: a.category, isPinned: a.isPinned });
    setFormErr("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    try {
      if (editingId) {
        await announcementService.update(editingId, form);
        setMsg("Announcement updated.");
      } else {
        await announcementService.create(form);
        setMsg("Announcement published.");
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setFormErr(err?.response?.data?.message || "Couldn't save this announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePin = async (a) => {
    try {
      await announcementService.update(a._id, { isPinned: !a.isPinned });
      load();
    } catch {
      setError("Couldn't update pin status.");
    }
  };

  const handleToggleActive = async (a) => {
    try {
      await announcementService.update(a._id, { isActive: !a.isActive });
      load();
    } catch {
      setError("Couldn't update status.");
    }
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? This can't be undone.`)) return;
    try {
      await announcementService.remove(a._id);
      setMsg("Announcement deleted.");
      load();
    } catch {
      setError("Couldn't delete this announcement.");
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>Manage Announcements</div>
        <button
          onClick={showForm ? () => setShowForm(false) : openCreate}
          style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {msg && <div style={{ background: "rgba(40,167,69,0.12)", color: "#1e7a34", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{msg}</div>}
      {error && <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          {formErr && <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "9px 12px", fontSize: 12.5, marginBottom: 14 }}>{formErr}</div>}

          <div className="form-grid-responsive" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Message</label>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
            Pin to top of the announcements list
          </label>

          <button type="submit" disabled={saving} style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: "var(--text-primary)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : editingId ? "Save Changes" : "Publish Announcement"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          [0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />)
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: "var(--text-secondary)", fontSize: 13, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }}>
            No announcements yet. Publish your first one above.
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a._id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, opacity: a.isActive ? 1 : 0.55 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    {a.isPinned && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)" }}>📌 PINNED</span>}
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: "2px 8px" }}>{a.category}</span>
                    {!a.isActive && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 10, padding: "2px 8px" }}>Archived</span>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 6 }}>{a.message}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Published {formatDate(a.createdAt)}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => openEdit(a)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                  <button onClick={() => handleTogglePin(a)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                    {a.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => handleToggleActive(a)}
                    style={{
                      padding: "6px 12px", borderRadius: 6, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                      border: `1px solid ${a.isActive ? "var(--border)" : "var(--primary)"}`,
                      background: a.isActive ? "var(--card)" : "rgba(0,128,128,0.1)",
                      color: a.isActive ? "var(--accent)" : "var(--primary)",
                    }}
                  >
                    {a.isActive ? "Archive" : "Restore"}
                  </button>
                  <button onClick={() => handleDelete(a)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--accent)", background: "var(--card)", color: "var(--accent)", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
