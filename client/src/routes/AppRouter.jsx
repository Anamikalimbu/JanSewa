import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import MyComplaintsPage from "../pages/citizen/MyComplaintsPage";
import SubmitComplaintPage from "../pages/citizen/SubmitComplaintPage";
import NotificationsPage from "../pages/citizen/NotificationsPage";
import ProfilePage from "../pages/citizen/ProfilePage";
import SettingsPage from "../pages/citizen/SettingsPage";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/complaints" element={<MyComplaintsPage />} />
      <Route path="/complaints/new" element={<SubmitComplaintPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      {/* Routes will be added here each week */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
