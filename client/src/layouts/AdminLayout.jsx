import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/notificationService";

const iconPaths = {
  grid:        "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z",
  users:       "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  building:    "M5 21V7l7-4 7 4v14M3 21h18M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01",
  list:        "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  fileText:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  barChart:    "M18 20V10M12 20V4M6 20v-6",
  settings:    "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2.5a2 2 0 010-4h.09A1.65 1.65 0 004.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V2.5a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.36.24.8.38 1.27.38H21.5a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  logout:      "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  bell:        "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0",
  chevron:     "M6 9l6 6 6-6",
  user:        "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
};

const Icon = ({ d, size = 18, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    <path d={d} />
  </svg>
);

const navItems = [
  { to: "/admin",             label: "Dashboard",   icon: "grid" },
  { to: "/admin/users",       label: "Users",       icon: "users" },
  { to: "/admin/departments", label: "Departments", icon: "building" },
  { to: "/admin/complaints",  label: "Complaints",  icon: "list" },
  { to: "/admin/reports",     label: "Reports",     icon: "fileText" },
  { to: "/admin/analytics",   label: "Analytics",   icon: "barChart" },
  { to: "/admin/settings",    label: "Settings",    icon: "settings" },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    notificationService
      .getUnreadCount()
      .then(({ data }) => { if (mounted) setUnreadCount(data?.data?.unreadCount || 0); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = (user?.name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "var(--font-body)" }}>
      {/* TOP BAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50, height: 60,
        background: "var(--card)", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px",
      }}>
        <Link to="/admin" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-display)" }}>J</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
            JanSewa <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>— Admin Panel</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            position: "relative", width: 36, height: 36, borderRadius: 10,
            border: "1px solid var(--border)", display: "flex", alignItems: "center",
            justifyContent: "center", color: "var(--text-secondary)",
          }}>
            <Icon d={iconPaths.bell} size={17} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -5, right: -5, minWidth: 17, height: 17, borderRadius: 9,
                background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                color: "#fff", fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {initials}
              </div>
              <Icon d={iconPaths.chevron} size={14} style={{ color: "var(--text-muted)" }} />
            </button>

            {menuOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", width: 190,
                background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
                boxShadow: "0 8px 24px rgba(15,23,42,0.12)", overflow: "hidden",
              }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user?.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{user?.email}</div>
                  <div style={{ fontSize: 10.5, color: "var(--primary)", fontWeight: 700, marginTop: 2, textTransform: "uppercase" }}>Admin</div>
                </div>
                <Link
                  to="/admin/profile"
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", fontSize: 13, color: "var(--text-primary)" }}
                >
                  <Icon d={iconPaths.user} size={15} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", fontSize: 13, color: "var(--accent)", background: "none", border: "none", textAlign: "left", cursor: "pointer" }}
                >
                  <Icon d={iconPaths.logout} size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        {/* SIDEBAR */}
        <aside style={{
          width: 220, flexShrink: 0, minHeight: "calc(100vh - 60px)",
          background: "var(--card)", borderRight: "1px solid var(--border)",
          padding: "18px 12px", boxSizing: "border-box",
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 8, fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  background: isActive ? "rgba(0,128,128,0.1)" : "transparent",
                })}
              >
                <Icon d={iconPaths[icon]} size={17} />
                <span>{label}</span>
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                borderRadius: 8, fontSize: 13.5, fontWeight: 500, color: "var(--accent)",
                background: "none", border: "none", textAlign: "left", marginTop: 8,
                borderTop: "1px solid var(--border)", paddingTop: 14, cursor: "pointer",
              }}
            >
              <Icon d={iconPaths.logout} size={17} />
              Logout
            </button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: 28, boxSizing: "border-box", minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
