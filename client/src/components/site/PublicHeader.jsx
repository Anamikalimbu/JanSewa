import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "./icons";

/**
 * components/site/PublicHeader.jsx
 *
 * Shared sticky header used by every standalone public/info page (About,
 * Services, Complaint Categories, How It Works, Announcements, FAQs,
 * Contact, 404, Unauthorized). LandingPage keeps its own richer,
 * single-page navbar with in-page anchor scrolling — this is the
 * equivalent for pages that live at their own route, reusing the same
 * design tokens so the whole site still feels like one product.
 */
const navLinks = [
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/categories", label: "Categories" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/announcements", label: "Announcements" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
];

export default function PublicHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const dashboardHref = user
    ? user.role === "admin" ? "/admin" : user.role === "department" ? "/department" : "/home"
    : null;

  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 100, width: "100%",
        background: "rgba(255,255,255,0.94)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/images/emblem-of-nepal-sm.png" alt="JanSewa" style={{ width: 28, height: 28, objectFit: "contain" }} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
            JanSewa
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="pub-nav-links" style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                fontSize: 13.5, fontWeight: 500,
                color: isActive ? "var(--primary)" : "var(--text-secondary)",
              })}
            >
              {label}
            </NavLink>
          ))}
          {dashboardHref ? (
            <Link
              to={dashboardHref}
              style={{
                fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 8,
                background: "var(--primary)", color: "#fff", whiteSpace: "nowrap",
              }}
            >
              My Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={{
                fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 8,
                border: "1.5px solid var(--primary)", color: "var(--primary)", whiteSpace: "nowrap",
              }}>
                Login
              </Link>
              <Link to="/register" style={{
                fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 8,
                background: "var(--primary)", color: "#fff", whiteSpace: "nowrap",
              }}>
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="pub-nav-hamburger"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-primary)" }}
        >
          <Icon d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="pub-nav-drawer"
          style={{
            width: "100%", boxSizing: "border-box", background: "var(--card)",
            borderBottom: "1px solid var(--border)", padding: "10px 20px 16px",
            display: "flex", flexDirection: "column", gap: 2,
          }}
        >
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              style={{ padding: "10px 4px", fontSize: 14.5, fontWeight: 500, color: "var(--text-primary)", borderBottom: "1px solid var(--border)" }}
            >
              {label}
            </NavLink>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {dashboardHref ? (
              <Link to={dashboardHref} onClick={() => setOpen(false)} style={{
                flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, padding: "10px 0", borderRadius: 8,
                background: "var(--primary)", color: "#fff",
              }}>
                My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} style={{
                  flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, padding: "10px 0", borderRadius: 8,
                  border: "1.5px solid var(--primary)", color: "var(--primary)",
                }}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} style={{
                  flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, padding: "10px 0", borderRadius: 8,
                  background: "var(--primary)", color: "#fff",
                }}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
