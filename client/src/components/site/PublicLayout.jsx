import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

/**
 * components/site/PublicLayout.jsx
 * Wraps header + page content + footer for every standalone public page.
 * `contain` narrows content to a readable max-width; pass `contain={false}`
 * for pages (like 404/Unauthorized) that want a full-bleed centered layout.
 */
export default function PublicLayout({ children, contain = true }) {
  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--background)", color: "var(--text-primary)", fontFamily: "var(--font-body)", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <main style={{ flex: 1, width: "100%", boxSizing: "border-box" }}>
        {contain ? (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>{children}</div>
        ) : (
          children
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
