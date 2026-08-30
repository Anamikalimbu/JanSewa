import { Link } from "react-router-dom";

/**
 * components/AuthLayout.jsx
 *
 * Shared two-column shell for all authentication screens
 * (Login / Register / Forgot Password).
 *
 * Left  — brand panel (gradient, mission statement, trust stats)
 * Right — the actual form, passed in as children
 *
 * Visually matches LandingPage.jsx: Sora display font, Inter body,
 * teal primary palette, soft gradient blobs — all pulled from the
 * CSS variables defined in index.css so the whole app stays in sync.
 *
 * Brand-panel background photo: Kathmandu, Nepal by Lidia Stawinska
 * on Unsplash — free to use under the Unsplash License.
 */

const highlights = [
  { title: "Report in seconds", desc: "Snap a photo, pick a category, and your complaint is on its way." },
  { title: "AI-powered routing", desc: "Issues reach the right department automatically no manual sorting." },
  { title: "Track in real time", desc: "Follow every complaint from submission to resolution, transparently." },
];

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "var(--background)",
        fontFamily: "var(--font-body)",
        color: "var(--text-primary)",
      }}
    >
      {/* LEFT — BRAND PANEL (hidden on small screens) */}
      <div
        className="hidden lg:flex"
        style={{
          flex: "0 0 44%",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 48px",
          backgroundImage:
            "linear-gradient(135deg, rgba(0,128,128,0.88) 0%, rgba(0,102,102,0.92) 100%), url(https://images.unsplash.com/photo-1680471818128-b85e28f34edd?auto=format&fit=crop&w=1200&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
        }}
      >
        {/* decorative blobs, echoing the LandingPage hero */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,193,7,0.18), transparent 70%)", pointerEvents: "none" }} />

        {/* logo */}
        <Link to="/" style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(255,255,255,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)" }}>J</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, letterSpacing: -0.3 }}>
            JanSewa
          </span>
        </Link>

        {/* mission copy */}
        <div style={{ position: "relative", maxWidth: 380 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.14)", borderRadius: 20, padding: "4px 14px",
              fontSize: 12, fontWeight: 600, marginBottom: 18,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--warning)", display: "inline-block" }} />
            Built for citizens of Nepal
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 32, lineHeight: 1.2, letterSpacing: -0.8, marginBottom: 14,
            }}
          >
            Raise your voice.<br />Build a better city.
          </h1>
          <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "rgba(255,255,255,0.85)", marginBottom: 32 }}>
            JanSewa connects citizens with local departments so public service
            issues get seen, routed, and resolved without the runaround.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {highlights.map((h) => (
              <div key={h.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(255,255,255,0.18)",
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{h.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          © {new Date().getFullYear()} JanSewa · Dharan, Koshi Province, Nepal
        </div>
      </div>

      {/* RIGHT — FORM PANEL */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >
        {/* mobile-only logo */}
        <Link
          to="/"
          className="flex lg:hidden"
          style={{ alignItems: "center", gap: 8, marginBottom: 28 }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-display)" }}>J</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
            JanSewa
          </span>
        </Link>

        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
            padding: "36px 32px",
          }}
        >
          {eyebrow && (
            <span
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 2,
                color: "var(--primary)", textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </span>
          )}
          <h2
            style={{
              fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700,
              color: "var(--text-primary)", marginTop: 6, letterSpacing: -0.5,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 6, marginBottom: 24 }}>
              {subtitle}
            </p>
          )}
          {!subtitle && <div style={{ marginBottom: 24 }} />}

          {children}
        </div>

        {footer && (
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 22 }}>
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
