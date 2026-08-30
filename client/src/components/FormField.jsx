import { useState } from "react";

/**
 * components/FormField.jsx
 *
 * A single labeled input used across Login / Register / Forgot Password.
 * Styled with the same CSS variables as the rest of the app (index.css)
 * so it inherits the JanSewa teal brand automatically.
 *
 * Supports:
 *  - left icon (mail, lock, user, phone...)
 *  - password visibility toggle (pass type="password")
 *  - inline error message + red focus ring
 */

const EyeIcon = ({ off }) =>
  off ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0112 20c-5 0-9.27-3.11-11-7.5a11.4 11.4 0 013.06-4.27M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 7.5a11.36 11.36 0 01-2.16 3.36M14.12 14.12a3 3 0 11-4.24-4.24M1 1l22 22" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

export default function FormField({
  label,
  icon,
  error,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  autoComplete,
  rightSlot,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: "block", fontSize: 13, fontWeight: 600,
            color: "var(--text-primary)", marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}

      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          border: `1.5px solid ${error ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 10, padding: "10px 12px",
          background: "var(--card)",
          transition: "border-color 0.15s",
        }}
      >
        {icon && (
          <span style={{ color: "var(--text-muted)", display: "flex", flexShrink: 0 }}>
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 14, fontFamily: "var(--font-body)", color: "var(--text-primary)",
            minWidth: 0,
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              background: "none", border: "none", padding: 2, cursor: "pointer",
              color: "var(--text-muted)", display: "flex",
            }}
          >
            <EyeIcon off={showPassword} />
          </button>
        )}

        {!isPassword && rightSlot}
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "var(--accent)", marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
}
