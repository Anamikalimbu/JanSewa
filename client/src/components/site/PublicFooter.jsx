import { Link } from "react-router-dom";
import { Icon, icons } from "./icons";

/**
 * components/site/PublicFooter.jsx
 * Shared footer for standalone public pages — mirrors LandingPage's
 * footer styling, with a fuller sitemap since these pages don't have
 * in-page anchors to fall back on.
 */
const columns = [
  {
    title: "Explore",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/services", label: "Services" },
      { to: "/categories", label: "Complaint Categories" },
      { to: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/announcements", label: "Announcements" },
      { to: "/faqs", label: "FAQs" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer style={{ background: "var(--card)", borderTop: "1px solid var(--border)", width: "100%", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 24px", boxSizing: "border-box" }}>
        <div
          className="pub-footer-grid"
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 24, marginBottom: 28 }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <img src="/images/emblem-of-nepal-sm.png" alt="JanSewa" style={{ width: 26, height: 26, objectFit: "contain" }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>JanSewa</span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 260 }}>
              A digital platform for citizens to report public service issues and track them through to resolution — built to make local government more responsive and transparent.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
              <a href="mailto:support@jansewa.gov.np" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
                <Icon d={icons.mail} size={13} /> support@jansewa.gov.np
              </a>
              <a href="tel:1111" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-secondary)" }}>
                <Icon d={icons.phone} size={13} /> 1111 (toll-free)
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {col.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map((l) => (
                  <Link key={l.to} to={l.to} style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex",
          justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
        }}>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>© {new Date().getFullYear()} JanSewa. All rights reserved.</span>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Built for citizens, by citizens.</span>
        </div>
      </div>
    </footer>
  );
}
