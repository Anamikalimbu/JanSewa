import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useLanguage } from "../../context/LanguageContext";
import { complaintService } from "../../services/complaintService";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const iconPaths = {
  image: "M4 4h16v16H4V4zm4 10l3-3 3 3 4-4 2 2M8 9a1 1 0 100-2 1 1 0 000 2z",
  x:     "M18 6L6 18M6 6l12 12",
  plus:  "M12 5v14M5 12h14",
  check: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
};

const Icon = ({ d, size = 16, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);

const fieldLabelStyle = { fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, display: "block" };
const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8,
  border: "1px solid var(--border)", fontSize: 13.5, fontFamily: "var(--font-body)",
  color: "var(--text-primary)", background: "var(--card)",
};

export default function SubmitComplaintPage() {
  const { t, tLabel } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category: "", subCategory: "", title: "", address: "", wardNumber: "",
    priority: "Medium", description: "",
  });
  const [files, setFiles] = useState([]); // { file, previewUrl }
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [created, setCreated] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    complaintService
      .getCategories()
      .then(({ data }) => setCategories(data?.data?.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.previewUrl)), [files]);

  const selectedCategory = categories.find((c) => c.value === form.category);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subCategory: "" } : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const addFiles = (list) => {
    const incoming = Array.from(list);
    const accepted = [];
    let error = "";

    for (const file of incoming) {
      if (files.length + accepted.length >= MAX_IMAGES) {
        error = `You can upload up to ${MAX_IMAGES} images.`;
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        error = "Only JPG, PNG, and WEBP images are allowed.";
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        error = `Each image must be ${MAX_SIZE_MB}MB or smaller.`;
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    if (error) setErrors((prev) => ({ ...prev, images: error }));
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const validate = () => {
    const next = {};
    if (!form.category) next.category = t("required");
    if (!form.title || form.title.trim().length < 5) next.title = "Title must be at least 5 characters.";
    if (!form.address) next.address = t("required");
    if (!form.description || form.description.trim().length < 10)
      next.description = "Description must be at least 10 characters.";
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const { data } = await complaintService.create(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          subCategory: form.subCategory,
          priority: form.priority,
          wardNumber: form.wardNumber,
          location: { address: form.address },
        },
        files.map((f) => f.file)
      );
      setCreated(data?.data?.complaint || null);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || "Couldn't submit your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ category: "", subCategory: "", title: "", address: "", wardNumber: "", priority: "Medium", description: "" });
    setFiles([]);
    setErrors({});
    setCreated(null);
  };

  if (created) {
    return (
      <DashboardLayout>
        <div style={{
          maxWidth: 520, margin: "60px auto", textAlign: "center", background: "var(--card)",
          border: "1px solid var(--border)", borderRadius: 14, padding: "40px 28px",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", margin: "0 auto 18px",
            background: "rgba(40,167,69,0.14)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon d={iconPaths.check} size={26} style={{ color: "#1e7a34" }} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            {t("submit_success_title")}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 8 }}>
            {t("submit_success_body")}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>#{created.code}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => navigate(`/complaints/${created.id}`)}
              style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: 13.5 }}
            >
              {t("submit_viewComplaint")}
            </button>
            <button
              onClick={resetForm}
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13.5 }}
            >
              {t("submit_submitAnother")}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
        {t("submit_title")}
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 22 }}>
        {t("submit_subtitle")}
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 760 }}>
        {/* Category / Sub-category */}
        <div className="form-grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={fieldLabelStyle}>{t("submit_category")} *</label>
            <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
              <option value="">{t("submit_selectCategory")}</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{tLabel(c)}</option>
              ))}
            </select>
            {errors.category && <div style={{ color: "var(--accent)", fontSize: 11.5, marginTop: 4 }}>{errors.category}</div>}
          </div>
          <div>
            <label style={fieldLabelStyle}>{t("submit_subCategory")}</label>
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              disabled={!selectedCategory}
              style={{ ...inputStyle, opacity: selectedCategory ? 1 : 0.6 }}
            >
              <option value="">{t("submit_selectSubCategory")}</option>
              {selectedCategory?.subCategories?.map((s) => (
                <option key={s.value} value={s.value}>{tLabel(s)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabelStyle}>{t("submit_complaintTitle")} *</label>
          <input
            name="title" value={form.title} onChange={handleChange}
            placeholder={t("submit_titlePlaceholder")} style={inputStyle}
          />
          {errors.title && <div style={{ color: "var(--accent)", fontSize: 11.5, marginTop: 4 }}>{errors.title}</div>}
        </div>

        {/* Location */}
        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabelStyle}>{t("submit_location")} *</label>
          <input
            name="address" value={form.address} onChange={handleChange}
            placeholder={t("submit_locationPlaceholder")} style={inputStyle}
          />
          {errors.address && <div style={{ color: "var(--accent)", fontSize: 11.5, marginTop: 4 }}>{errors.address}</div>}
        </div>

        {/* Ward / Priority */}
        <div className="form-grid-responsive" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={fieldLabelStyle}>{t("submit_ward")}</label>
            <input
              name="wardNumber" value={form.wardNumber} onChange={handleChange}
              placeholder={t("submit_wardPlaceholder")} style={inputStyle}
            />
          </div>
          <div>
            <label style={fieldLabelStyle}>{t("submit_priority")}</label>
            <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
              <option value="Low">{t("submit_priority_low")}</option>
              <option value="Medium">{t("submit_priority_medium")}</option>
              <option value="High">{t("submit_priority_high")}</option>
              <option value="Critical">{t("submit_priority_critical")}</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={fieldLabelStyle}>{t("submit_description")} *</label>
          <textarea
            name="description" value={form.description} onChange={handleChange}
            placeholder={t("submit_descriptionPlaceholder")} rows={5}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-body)" }}
          />
          {errors.description && <div style={{ color: "var(--accent)", fontSize: 11.5, marginTop: 4 }}>{errors.description}</div>}
        </div>

        {/* Images */}
        <div style={{ marginBottom: 24 }}>
          <label style={fieldLabelStyle}>{t("submit_uploadImages")}</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? "var(--primary)" : "var(--border)"}`, borderRadius: 12,
              padding: "28px 16px", textAlign: "center", cursor: "pointer",
              background: dragOver ? "rgba(0,128,128,0.05)" : "var(--card)",
            }}
          >
            <Icon d={iconPaths.image} size={26} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{t("submit_dragDrop")}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4 }}>{t("submit_supported")}</div>
            <input
              ref={fileInputRef} type="file" multiple hidden
              accept={ACCEPTED_TYPES.join(",")}
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
          {errors.images && <div style={{ color: "var(--accent)", fontSize: 11.5, marginTop: 4 }}>{errors.images}</div>}

          {files.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {files.map((f, i) => (
                <div key={i} style={{ position: "relative", width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={f.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    style={{
                      position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", display: "flex",
                      alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}
                  >
                    <Icon d={iconPaths.x} size={10} />
                  </button>
                </div>
              ))}
              {files.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 72, height: 72, borderRadius: 8, border: "1px dashed var(--border)",
                    background: "var(--background)", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "var(--text-muted)", cursor: "pointer",
                  }}
                >
                  <Icon d={iconPaths.plus} size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {submitError && (
          <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 18 }}>
            {submitError}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate("/home")}
            style={{ padding: "11px 22px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text-primary)", fontWeight: 600, fontSize: 13.5 }}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "11px 22px", borderRadius: 8, border: "none",
              background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: 13.5,
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? t("submit_submitting") : t("submit_submitBtn")}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
