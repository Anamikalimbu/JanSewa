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
  menu:        "M3 12h18M3 6h18M3 18h18",
  close:       "M6 18L18 6M6 6l12 12",
  clock:       "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
};

const Icon = ({ d, size = 18, className = "", ...rest }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...rest}>
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
  { to: "/admin/pending",     label: "Pending Approvals", icon: "clock" },
  { to: "/admin/settings",    label: "Settings",    icon: "settings" },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

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
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        if (!e.target.closest('#hamburger-btn-admin')) {
            setSidebarOpen(false);
        }
      }
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
    <div className="min-h-screen bg-background font-body">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 h-[60px] bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button 
            id="hamburger-btn-admin"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden flex items-center justify-center text-text-secondary hover:text-primary transition-colors p-1 bg-transparent border-none"
          >
            <Icon d={sidebarOpen ? iconPaths.close : iconPaths.menu} size={22} />
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-[13px] font-display">J</span>
            </div>
            <span className="font-display font-bold text-base text-text-primary hidden sm:block">
              JanSewa <span className="text-text-secondary font-medium hidden md:inline">— Admin Panel</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-lg border border-border flex items-center justify-center text-text-secondary">
            <Icon d={iconPaths.bell} size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer">
              <div className="w-8 h-8 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {initials}
              </div>
              <Icon d={iconPaths.chevron} size={14} className="text-text-muted hidden sm:block" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-[190px] bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in-down z-50">
                <div className="p-3 border-b border-border">
                  <div className="text-[13px] font-bold text-text-primary truncate">{user?.name}</div>
                  <div className="text-[11.5px] text-text-secondary truncate">{user?.email}</div>
                  <div className="text-[10.5px] text-primary font-bold mt-0.5 uppercase">Admin</div>
                </div>
                <Link
                  to="/admin/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 p-3 text-[13px] text-text-primary hover:bg-gray-50 transition-colors"
                >
                  <Icon d={iconPaths.user} size={15} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-3 text-[13px] text-accent bg-transparent border-none text-left cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <Icon d={iconPaths.logout} size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* OVERLAY FOR MOBILE SIDEBAR */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside 
          ref={sidebarRef}
          className={`fixed md:sticky top-[60px] left-0 z-50 w-[220px] shrink-0 h-[calc(100vh-60px)] bg-card border-r border-border p-4 box-border transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <nav className="flex flex-col gap-1 h-full overflow-y-auto pb-4">
            {navItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors ${isActive ? 'font-bold text-primary bg-primary/10' : 'font-medium text-text-secondary hover:bg-gray-50'}`
                }
              >
                <Icon d={iconPaths[icon]} size={17} />
                <span className="flex-1 truncate">{label}</span>
              </NavLink>
            ))}

            <div className="mt-auto pt-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-accent bg-transparent border-none text-left cursor-pointer hover:bg-red-50 transition-colors"
              >
                <Icon d={iconPaths.logout} size={17} />
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 box-border min-w-0 w-full md:w-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
