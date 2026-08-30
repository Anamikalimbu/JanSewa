import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import FormField from "../../components/forms/FormField";
import { useAuth } from "../../context/AuthContext";

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 118 0v4" />
  </svg>
);

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";

    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "This reset link is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Set a new password"
      subtitle={
        done
          ? "Your password has been updated. Redirecting you now…"
          : "Choose a new password for your JanSewa account."
      }
      footer={
        <>
          Remember your password?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Back to Login
          </Link>
        </>
      }
    >
      {done ? (
        <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%", margin: "0 auto 16px",
              background: "var(--accent-light)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
          </div>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            You're logged in with your new password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="New password"
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
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••••"
            autoComplete="new-password"
            icon={<LockIcon />}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

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
            {loading ? "Updating…" : "Reset Password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
