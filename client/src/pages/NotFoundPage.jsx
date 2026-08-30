import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicHeader from "../components/site/PublicHeader";
import PublicFooter from "../components/site/PublicFooter";
import { Icon, icons } from "../components/site/icons";

export default function NotFoundPage() {
  const { user } = useAuth();
  const homeHref = user
    ? user.role === "admin" ? "/admin" : user.role === "department" ? "/department" : "/home"
    : "/";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--background)" }}>
      <PublicHeader />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
        <div>
          <div style={{
            width: 84, height: 84, borderRadius: "50%", background: "rgba(0,128,128,0.1)", margin: "0 auto 24px",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)",
          }}>
            <Icon d={icons.pin} size={38} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 700, color: "var(--primary)", lineHeight: 1 }}>404</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "12px 0 10px" }}>
            Page not found
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.6 }}>
            The page you're looking for doesn't exist, may have been moved, or the link might be broken.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={homeHref} style={{
              padding: "12px 26px", borderRadius: 10, background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: 13.5,
            }}>
              {user ? "Go to Dashboard" : "Go to Homepage"}
            </Link>
            <Link to="/contact" style={{
              padding: "12px 26px", borderRadius: 10, border: "1.5px solid var(--border)", color: "var(--text-primary)", fontWeight: 700, fontSize: 13.5,
            }}>
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
