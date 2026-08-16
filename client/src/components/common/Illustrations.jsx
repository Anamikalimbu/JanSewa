/**
 * components/Illustrations.jsx
 *
 * Small, self-contained SVG illustrations shared across the app.
 * They lean on the same CSS variables as LandingPage.jsx's
 * HeroIllustration so every illustration stays visually consistent
 * and never depends on an external image host.
 */

// Used at the top of Profile pages (citizen / department / admin).
export const ProfileIllustration = ({ width = 220 }) => (
  <svg viewBox="0 0 240 160" width={width} height="auto" role="img" aria-label="Citizen profile illustration">
    <circle cx="120" cy="80" r="76" fill="rgba(0,128,128,0.07)" />
    <circle cx="120" cy="60" r="26" fill="var(--primary)" opacity="0.9" />
    <path d="M62 142c0-34 26-52 58-52s58 18 58 52" fill="var(--secondary)" opacity="0.85" />
    <circle cx="184" cy="42" r="14" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
    <path d="M178 42l4 4 8-8" stroke="var(--primary)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="44" cy="112" r="6" fill="var(--accent)" opacity="0.6" />
    <circle cx="200" cy="118" r="5" fill="var(--warning)" opacity="0.6" />
  </svg>
);

// Used at the top of Settings pages.
export const SettingsIllustration = ({ width = 220 }) => (
  <svg viewBox="0 0 240 160" width={width} height="auto" role="img" aria-label="Account settings illustration">
    <circle cx="120" cy="80" r="76" fill="rgba(0,128,128,0.07)" />
    <rect x="66" y="52" width="108" height="70" rx="10" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
    <circle cx="96" cy="76" r="9" fill="var(--primary)" opacity="0.85" />
    <rect x="112" y="72" width="46" height="7" rx="3.5" fill="var(--border)" />
    <circle cx="96" cy="98" r="9" fill="var(--secondary)" opacity="0.85" />
    <rect x="112" y="94" width="34" height="7" rx="3.5" fill="var(--border)" />
    <g transform="translate(150,28)">
      <circle r="16" fill="var(--warning)" opacity="0.9" />
      <path d="M0 -9v3M0 6v3M-9 0h3M6 0h3M-6.4 -6.4l2.1 2.1M4.3 4.3l2.1 2.1M-6.4 6.4l2.1 -2.1M4.3 -4.3l2.1 -2.1"
        stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle r="5" fill="#fff" />
    </g>
    <circle cx="52" cy="120" r="5" fill="var(--accent)" opacity="0.55" />
  </svg>
);

// Small empty-state illustration for lists with nothing in them yet
// (complaints, notifications, etc). `variant` swaps the icon inside.
export const EmptyStateIllustration = ({ width = 150, variant = "doc" }) => {
  const icon =
    variant === "bell" ? (
      <path d="M-16 8c0-16 8-24 16-24s16 8 16 24z M-20 8h40 M-4 14a4 4 0 008 0"
        fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <>
        <rect x="-22" y="-28" width="44" height="56" rx="5" fill="var(--card)" stroke="var(--border)" strokeWidth="2.5" />
        <rect x="-13" y="-14" width="26" height="4.5" rx="2.25" fill="var(--border)" />
        <rect x="-13" y="-3" width="26" height="4.5" rx="2.25" fill="var(--border)" />
        <rect x="-13" y="8" width="16" height="4.5" rx="2.25" fill="var(--border)" />
      </>
    );
  return (
    <svg viewBox="0 0 200 140" width={width} height="auto" role="img" aria-hidden="true">
      <circle cx="100" cy="68" r="58" fill="rgba(0,128,128,0.07)" />
      <g transform="translate(100,68)">{icon}</g>
    </svg>
  );
};

export default { ProfileIllustration, SettingsIllustration, EmptyStateIllustration };
