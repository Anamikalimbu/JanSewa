import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";

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

const initialForm = { name: "", email: "", password: "", confirmPassword: "", agree: false };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters";

    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";

    if (!form.agree) next.agree = "You must agree to the Terms & Conditions";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/home");
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
      <form onSubmit={handleSubmit} noValidate>
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
          placeholder="you@example.com"
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
    </AuthLayout>
  );
}
