import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import FormField from "../../components/forms/FormField";
import { useAuth } from "../../context/AuthContext";
import { departmentService } from "../../services/departmentService";

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 118 0v4" />
  </svg>
);

const roleIconPaths = {
  citizen:    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  department: "M5 21V7l7-4 7 4v14M3 21h18M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",
  admin:      "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};
const RoleIcon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ROLE_OPTIONS = [
  { key: "citizen", label: "Citizen", desc: "Report issues & track complaints" },
  { key: "department", label: "Department Staff", desc: "Handle complaints for a department" },
  { key: "admin", label: "Administrator", desc: "Full access to the JanSewa portal" },
];

const initialForm = { name: "", email: "", password: "", confirmPassword: "", agree: false, role: "citizen", departmentId: "" };

// Admin accounts are reserved — the backend only accepts this exact
// pattern for role "admin", so validate it here too for a clear error
// instead of a confusing 403 after submit.
const ADMIN_EMAIL_REGEX = /^admin\.[a-z0-9._-]{2,40}@jansewa\.gov\.np$/i;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // Fetch the department list lazily, only once "Department Staff" is picked.
  useEffect(() => {
    if (form.role !== "department" || departments.length > 0) return;
    setDeptLoading(true);
    departmentService
      .getPublic()
      .then(({ data }) => setDepartments(data?.data?.departments || []))
      .catch(() => setDepartments([]))
      .finally(() => setDeptLoading(false));
  }, [form.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleSelect = (role) => {
    setForm((prev) => ({ ...prev, role, departmentId: role === "department" ? prev.departmentId : "" }));
    setErrors((prev) => ({ ...prev, role: undefined, departmentId: undefined }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required";
    else if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters";

    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    else if (form.role === "admin" && !ADMIN_EMAIL_REGEX.test(form.email.trim())) {
      next.email = "Admin email must match admin.<name>@jansewa.gov.np";
    }

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";

    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";

    if (!form.agree) next.agree = "You must agree to the Terms & Conditions";

    if (form.role === "department" && !form.departmentId) {
      next.departmentId = "Please select which department you work for";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        ...(form.role === "department" ? { departmentId: form.departmentId } : {}),
      });
      if (result && result.pending) {
        setSubmitSuccess(result.message);
      } else {
        navigate(form.role === "admin" ? "/admin" : form.role === "department" ? "/department" : "/home");
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Join JanSewa"
      title="Create your account"
      subtitle="Sign up to raise your voice and track public service issues near you."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Login
          </Link>
        </>
      }
    >
      {submitSuccess ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", background: "rgba(0,128,128,0.1)",
            color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            Request Submitted
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 24 }}>
            {submitSuccess}
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block", width: "100%", padding: "12px", borderRadius: 10,
              background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: 14.5,
              textDecoration: "none", boxShadow: "0 4px 14px rgba(0,128,128,0.35)",
            }}
          >
            Back to Login
          </Link>
        </div>
      ) : (
      <form onSubmit={handleSubmit} noValidate>
        {/* Role selector */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
            I am registering as
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {ROLE_OPTIONS.map(({ key, label, desc }) => {
              const active = form.role === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => handleRoleSelect(key)}
                  title={desc}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "12px 6px", borderRadius: 10, cursor: "pointer",
                    border: active ? "1.5px solid var(--primary)" : "1.5px solid var(--border)",
                    background: active ? "rgba(0,128,128,0.08)" : "var(--card)",
                    color: active ? "var(--primary)" : "var(--text-secondary)",
                    transition: "all 0.15s",
                  }}
                >
                  <RoleIcon d={roleIconPaths[key]} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: "center", lineHeight: 1.25 }}>{label}</span>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p style={{ fontSize: 12, color: "var(--accent)", marginTop: 6 }}>{errors.role}</p>
          )}
        </div>

        {/* Department picker only for staff registering under "Department Staff" */}
        {form.role === "department" && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Department
            </label>
            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              disabled={deptLoading}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13.5,
                border: errors.departmentId ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                background: "var(--background)", color: "var(--text-primary)",
                fontFamily: "var(--font-body)", boxSizing: "border-box",
              }}
            >
              <option value="">{deptLoading ? "Loading departments…" : "Select a department"}</option>
              {departments.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>{d.departmentName}</option>
              ))}
            </select>
            {errors.departmentId && (
              <p style={{ fontSize: 12, color: "var(--accent)", marginTop: 6 }}>{errors.departmentId}</p>
            )}
          </div>
        )}

        <FormField
          label="Full Name"
          name="name"
          placeholder="Enter full name"
          autoComplete="name"
          icon={<UserIcon />}
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          placeholder={form.role === "admin" ? "admin.yourname@jansewa.gov.np" : "you@example.com"}
          autoComplete="email"
          icon={<MailIcon />}
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••••"
          autoComplete="new-password"
          icon={<LockIcon />}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="••••••••••"
          autoComplete="new-password"
          icon={<LockIcon />}
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <label
          style={{
            display: "flex", alignItems: "flex-start", gap: 8,
            marginBottom: 20, cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            style={{ marginTop: 2, width: 15, height: 15, accentColor: "var(--primary)", flexShrink: 0 }}
          />
          <span style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
            I agree to the{" "}
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>Terms &amp; Conditions</span>
          </span>
        </label>
        {errors.agree && (
          <p style={{ fontSize: 12, color: "var(--accent)", marginTop: -14, marginBottom: 16 }}>
            {errors.agree}
          </p>
        )}

        {submitError && (
          <div
            style={{
              background: "var(--accent-light)", color: "var(--accent)",
              borderRadius: 8, padding: "10px 12px", fontSize: 13, marginBottom: 18,
            }}
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", padding: "12px", borderRadius: 10, border: "none",
            background: loading ? "var(--primary-Light)" : "var(--primary)",
            color: "#fff", fontWeight: 600, fontSize: 14.5,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 14px rgba(0,128,128,0.35)",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Creating account…" : "Register"}
        </button>
      </form>
      )}
    </AuthLayout>
  );
}
