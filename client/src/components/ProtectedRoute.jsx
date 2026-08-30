import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * components/ProtectedRoute.jsx
 *
 * Wraps a route that requires the user to be logged in. While the
 * initial session-restore check runs (on page refresh), it shows a
 * lightweight loading state instead of flashing the login page.
 *
 * Pass `role="admin"` to additionally restrict the route to a specific role;
 * users with the wrong role are redirected to the Unauthorized page, which
 * offers a link back to their own dashboard.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "var(--primary)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
