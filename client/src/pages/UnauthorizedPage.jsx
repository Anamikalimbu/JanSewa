import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicHeader from "../components/site/PublicHeader";
import PublicFooter from "../components/site/PublicFooter";
import { Icon, icons } from "../components/site/icons";

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const homeHref = user
    ? user.role === "admin" ? "/admin" : user.role === "department" ? "/department" : "/home"
    : "/";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <PublicHeader />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
        <div>
          <div style={{
            width: 84, height: 84, borderRadius: "50%", background: "var(--accent-light)", margin: "0 auto 24px",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)",
          }}>
            <Icon d={icons.lock} size={36} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
            You don't have access to this page
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6 }}>
            {user
              ? `Your account (${user.role}) doesn't have permission to view this page. If you think this is a mistake, contact an administrator.`
              : "You need to be signed in with the right account type to view this page."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={homeHref} style={{
              padding: "12px 26px", borderRadius: 10, background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13.5,
            }}>
              {user ? "Go to My Dashboard" : "Go to Login"}
            </Link>
            {user && (
              <button
                onClick={logout}
                style={{
                  padding: "12px 26px", borderRadius: 10, border: "1.5px solid var(--border)", background: "none",
                  color: "var(--text-primary)", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "var(--font-body)",
                }}
              >
                Switch Account
              </button>
            )}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
