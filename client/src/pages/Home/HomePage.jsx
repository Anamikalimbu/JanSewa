/**
 * pages/HomePage.jsx
 *
 * This is what a logged-in user lands on at "/home". Citizens see the
 * Citizen Dashboard; admins are sent straight to the Admin Dashboard
 * instead, since "/home" isn't a meaningful landing page for them.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CitizenDashboardPage from "../Dashboard/CitizenDashboardPage";

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.role === "admin") navigate("/admin");
  }, [loading, user, navigate]);

  if (!loading && user?.role === "admin") return null; // redirecting

  return <CitizenDashboardPage />;
};

export default HomePage;
