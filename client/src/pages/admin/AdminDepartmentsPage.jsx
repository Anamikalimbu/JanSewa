import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { departmentService } from "../../services/departmentService";
import { complaintService } from "../../services/complaintService";

const emptyForm = { departmentName: "", description: "", contactEmail: "", categories: [] };

const cardStyle = { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 };
const fieldLabelStyle = { fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "block" };
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
  border: "1px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-body)",
  color: "var(--text-primary)", background: "var(--card)",
};

export default function AdminDepartmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) navigate("/home");
  }, [authLoading, user, navigate]);

  const loadDepartments = () => {
    setLoading(true);
    setError("");
    departmentService
      .getAll()
      .then(({ data }) => setDepartments(data?.data?.departments || []))
      .catch(() => setError("Couldn't load departments. Please try refreshing."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "admin") loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    complaintService
      .getCategories()
      .then(({ data }) => setCategoryOptions(data?.data?.categories || []))
      .catch(() => setCategoryOptions([]));
  }, []);

  if (authLoading || !user || user.role !== "admin") return null;

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setSaveError("");
    setShowForm(true);
  };

  const openEditForm = (dept) => {
    setEditingId(dept.id);
    setForm({
      departmentName: dept.departmentName || "",
      description: dept.description || "",
      contactEmail: dept.contactEmail || "",
      categories: dept.categories || [],
    });
    setFormErrors({});
    setSaveError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setSaveError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleCategory = (value) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter((c) => c !== value)
        : [...prev.categories, value],
    }));
  };

  const validate = () => {
    const next = {};
    if (!form.departmentName.trim()) next.departmentName = "Department name is required.";
    if (!form.contactEmail.trim()) next.contactEmail = "Contact email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) next.contactEmail = "Enter a valid email address.";
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        departmentName: form.departmentName.trim(),
        description: form.description.trim(),
        contactEmail: form.contactEmail.trim(),
        categories: form.categories,
      };
      if (editingId) {
        await departmentService.update(editingId, payload);
      } else {
        await departmentService.create(payload);
      }
      closeForm();
      loadDepartments();
    } catch (err) {
      setSaveError(err?.response?.data?.message || "Couldn't save this department. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (dept) => {
    if (dept.isActive) {
      const ok = window.confirm(
        `Deactivate ${dept.departmentName}? It will no longer receive new complaints or appear on the "Department Staff" registration dropdown.`
      );
      if (!ok) return;
    }
    setTogglingId(dept.id);
    try {
      await departmentService.update(dept.id, { isActive: !dept.isActive });
      loadDepartments();
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't update that department.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>
            Departments
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4 }}>
            Create and manage departments. Only active departments appear on the "Department Staff" registration dropdown.
          </div>
        </div>
        <button
          onClick={openCreateForm}
          style={{
            padding: "10px 18px", borderRadius: 8, border: "none", background: "var(--primary)",
            color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          + Add Department
        </button>
      </div>

      {error && (
        <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            {editingId ? "Edit Department" : "New Department"}
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={fieldLabelStyle}>Department Name *</label>
                <input
                  name="departmentName" value={form.departmentName} onChange={handleChange}
                  placeholder="e.g. Water Supply" style={inputStyle}
                />
                {formErrors.departmentName && (
                  <div style={{ color: "var(--accent)", fontSize: 11.5, marginTop: 4 }}>{formErrors.departmentName}</div>
                )}
              </div>
              <div>
                <label style={fieldLabelStyle}>Contact Email *</label>
                <input
                  name="contactEmail" value={form.contactEmail} onChange={handleChange}
                  placeholder="water@jansewa.np" style={inputStyle}
                />
                {formErrors.contactEmail && (
                  <div style={{ color: "var(--accent)", fontSize: 11.5, marginTop: 4 }}>{formErrors.contactEmail}</div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabelStyle}>Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="What this department handles" rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-body)" }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={fieldLabelStyle}>Handles Categories</label>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginBottom: 8 }}>
                Complaints filed under these categories are routed to this department automatically.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {categoryOptions.map((cat) => {
                  const selected = form.categories.includes(cat.value);
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      style={{
                        fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: 20,
                        border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                        background: selected ? "var(--primary)" : "var(--card)",
                        color: selected ? "#fff" : "var(--text-primary)",
                        cursor: "pointer",
                      }}
                    >
                      {cat.label_en}
                    </button>
                  );
                })}
              </div>
            </div>

            {saveError && (
              <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
                {saveError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={closeForm}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13.5 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--primary)",
                  color: "#fff", fontWeight: 600, fontSize: 13.5,
                  cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving…" : editingId ? "Save Changes" : "Create Department"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Departments table */}
      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{
          display: "flex", background: "var(--background)", padding: "10px 16px",
          borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700,
          color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5, gap: 8,
        }}>
          <span style={{ flex: 2 }}>Department</span>
          <span style={{ flex: 2 }}>Contact Email</span>
          <span style={{ flex: 1, textAlign: "center" }}>Staff</span>
          <span style={{ flex: 1, textAlign: "center" }}>Assigned</span>
          <span style={{ flex: 1, textAlign: "center" }}>Pending</span>
          <span style={{ flex: 1, textAlign: "center" }}>Status</span>
          <span style={{ width: 140, textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          [0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border)" }}>
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 2, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
              <div className="skeleton" style={{ flex: 1, height: 14 }} />
            </div>
          ))
        ) : departments.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13.5, color: "var(--text-secondary)" }}>
            No departments yet. Click "+ Add Department" to create the first one citizens can't register as
            Department Staff until at least one exists.
          </div>
        ) : (
          departments.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", gap: 8, borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ flex: 2, fontWeight: 600, color: "var(--text-primary)" }}>
                {d.departmentName}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {(d.categories || []).length === 0 ? (
                    <span style={{ fontSize: 10.5, fontWeight: 500, color: "var(--text-muted)" }}>No categories set</span>
                  ) : (
                    d.categories.map((c) => (
                      <span key={c} style={{ fontSize: 10, fontWeight: 600, color: "var(--secondary)", background: "rgba(0,128,128,0.1)", padding: "1px 7px", borderRadius: 20 }}>
                        {c}
                      </span>
                    ))
                  )}
                </div>
              </span>
              <span style={{ flex: 2, color: "var(--text-secondary)", fontSize: 12.5 }}>{d.contactEmail}</span>
              <span style={{ flex: 1, textAlign: "center", color: "var(--text-secondary)" }}>{d.staff}</span>
              <span style={{ flex: 1, textAlign: "center", color: "var(--text-secondary)" }}>{d.assigned}</span>
              <span style={{ flex: 1, textAlign: "center", color: "#8a6d00", fontWeight: 600 }}>{d.pending}</span>
              <span style={{ flex: 1, textAlign: "center" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                  background: d.isActive ? "rgba(40,167,69,0.14)" : "rgba(148,163,184,0.18)",
                  color: d.isActive ? "#1e7a34" : "#64748b",
                }}>
                  {d.isActive ? "Active" : "Inactive"}
                </span>
              </span>
              <span style={{ width: 140, textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  onClick={() => openEditForm(d)}
                  style={{
                    fontSize: 12, fontWeight: 700, color: "var(--text-primary)", border: "1px solid var(--border)",
                    borderRadius: 6, padding: "4px 10px", background: "var(--card)", cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(d)}
                  disabled={togglingId === d.id}
                  style={{
                    fontSize: 12, fontWeight: 700, color: d.isActive ? "var(--accent)" : "#1e7a34",
                    border: `1px solid ${d.isActive ? "var(--accent)" : "#1e7a34"}`,
                    borderRadius: 6, padding: "4px 10px", background: "var(--card)",
                    cursor: togglingId === d.id ? "not-allowed" : "pointer",
                    opacity: togglingId === d.id ? 0.6 : 1,
                  }}
                >
                  {togglingId === d.id ? "…" : d.isActive ? "Deactivate" : "Activate"}
                </button>
              </span>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
