import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";

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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [portal, setPortal] = useState("citizen"); // "citizen" | "admin"
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const loggedInUser = await login({ ...form, role: portal });
      navigate(loggedInUser?.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Couldn't sign you in. Check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title={portal === "admin" ? "Admin / Staff Login" : "Login to your account"}
      subtitle={
        portal === "admin"
          ? "Sign in to manage complaints, departments, and users."
          : "Enter your details to continue tracking and submitting complaints."
      }
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Register
          </Link>
        </>
      }
    >
      {/* Citizen / Admin portal selector */}
      <div style={{
        display: "flex", background: "var(--background)", borderRadius: 10, padding: 4, marginBottom: 22,
      }}>
        {[
          { key: "citizen", label: "Citizen" },
          { key: "admin", label: "Admin / Staff" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setPortal(key); setSubmitError(""); }}
            style={{
              flex: 1, padding: "9px 10px", borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700,
              background: portal === key ? "var(--card)" : "transparent",
              color: portal === key ? "var(--primary)" : "var(--text-secondary)",
              boxShadow: portal === key ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
          icon={<LockIcon />}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, marginTop: -6 }}>
          <Link
            to="/forgot-password"
            style={{ fontSize: 12.5, color: "var(--text-secondary)", textDecoration: "underline" }}
          >
            Forgot Password?
          </Link>
        </div>

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
          {loading ? "Signing in…" : portal === "admin" ? "Login as Admin / Staff" : "Login as Citizen"}
        </button>
      </form>
    </AuthLayout>
  );
}
