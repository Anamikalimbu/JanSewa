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
    <div className="min-h-screen w-full flex bg-background font-body text-text-primary">
      {/* LEFT — BRAND PANEL (hidden on small screens) */}
      <div
        className="hidden lg:flex flex-[0_0_44%] relative overflow-hidden flex-col justify-between p-12 bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0,128,128,0.88) 0%, rgba(0,102,102,0.92) 100%), url(https://images.unsplash.com/photo-1680471818128-b85e28f34edd?auto=format&fit=crop&w=1200&q=80)",
        }}
      >
        {/* decorative blobs, echoing the LandingPage hero */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)" }} />
        <div className="absolute -bottom-16 -left-16 w-[260px] h-[260px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,193,7,0.18), transparent 70%)" }} />

        {/* logo */}
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-extrabold text-[15px] font-display">J</span>
          </div>
          <span className="font-display font-bold text-[19px] tracking-tight">
            JanSewa
          </span>
        </Link>

        {/* mission copy */}
        <div className="relative max-w-[380px]">
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3.5 py-1 text-xs font-semibold mb-4.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />
            Built for citizens of Nepal
          </div>

          <h1 className="font-display font-extrabold text-[32px] leading-[1.2] tracking-tight mb-3.5">
            Raise your voice.<br />Build a better city.
          </h1>
          <p className="text-[14.5px] leading-relaxed text-white/85 mb-8">
            JanSewa connects citizens with local departments so public service
            issues get seen, routed, and resolved without the runaround.
          </p>

          <div className="flex flex-col gap-4">
            {highlights.map((h) => (
              <div key={h.title} className="flex gap-3 items-start">
                <div className="shrink-0 w-[22px] h-[22px] rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{h.title}</div>
                  <div className="text-[13px] text-white/75 mt-0.5">{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/65">
          © {new Date().getFullYear()} JanSewa · Dharan, Koshi Province, Nepal
        </div>
      </div>

      {/* RIGHT — FORM PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 relative">
        {/* mobile-only logo */}
        <Link to="/" className="flex lg:hidden items-center gap-2 mb-7">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-white font-extrabold text-[13px] font-display">J</span>
          </div>
          <span className="font-display font-bold text-base text-text-primary">
            JanSewa
          </span>
        </Link>

        <div className="w-full max-w-[400px] bg-card border border-border rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] px-6 py-8 md:px-8 md:py-9">
          {eyebrow && (
            <span className="text-[11px] font-bold tracking-[2px] text-primary uppercase">
              {eyebrow}
            </span>
          )}
          <h2 className="font-display text-2xl font-bold text-text-primary mt-1.5 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[13.5px] text-text-secondary mt-1.5 mb-6">
              {subtitle}
            </p>
          )}
          {!subtitle && <div className="mb-6" />}

          {children}
        </div>

        {footer && (
          <p className="text-[13.5px] text-text-secondary mt-5.5 text-center">
            {footer}
          </p>
        )}
      </div>
    </div>
  );
}
