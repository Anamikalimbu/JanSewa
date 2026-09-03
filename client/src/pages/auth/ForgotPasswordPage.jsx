import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import FormField from "../../components/FormField";
import { useAuth } from "../../context/AuthContext";

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      // In non-production environments, the API also returns the reset
      // link directly so the flow can be tested without SMTP set up.
      setDevResetUrl(res?.data?.resetUrl || "");
      setSent(true);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Couldn't send the reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Forgot Password"
      subtitle={
        sent
          ? "Check your inbox for the reset link."
          : "Enter your registered email and we'll send you a link to reset your password."
      }
      footer={
        <>
          Remember password?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Back to Login
          </Link>
        </>
      }
    >
      {sent ? (
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
            We've sent a password reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
            Didn't get it?{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              style={{ background: "none", border: "none", padding: 0, color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}
            >
              Try again
            </button>
          </p>

          {devResetUrl && (
            <div style={{
              marginTop: 16, background: "var(--background)", border: "1px dashed var(--border)",
              borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)",
              wordBreak: "break-all",
            }}>
              <strong style={{ color: "var(--text-primary)" }}>Dev mode</strong> — SMTP isn't configured, so here's your reset link directly:{" "}
              <Link to={devResetUrl.replace(/^https?:\/\/[^/]+/, "")} style={{ color: "var(--primary)", fontWeight: 600 }}>
                {devResetUrl}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <FormField
            label="Enter your registered email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<MailIcon />}
            value={email}
            onChange={handleChange}
            error={error}
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
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
