import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import LandingPage from "../pages/Home/LandingPage";
import LoginPage from "../pages/Login/LoginPage";
import RegisterPage from "../pages/Register/RegisterPage";
import ForgotPasswordPage from "../pages/Login/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Login/ResetPasswordPage";
import MyComplaintsPage from "../pages/Complaints/MyComplaintsPage";
import SubmitComplaintPage from "../pages/Complaints/SubmitComplaintPage";
import ComplaintsMapPage from "../pages/Complaints/ComplaintsMapPage";
import ComplaintDetailPage from "../pages/Complaints/ComplaintDetailPage";
import NotificationsPage from "../pages/Dashboard/NotificationsPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import SettingsPage from "../pages/Profile/SettingsPage";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import AdminUsersPage from "../pages/Admin/AdminUsersPage";
import AdminDepartmentsPage from "../pages/Admin/AdminDepartmentsPage";
import AdminComplaintsPage from "../pages/Admin/AdminComplaintsPage";
import AdminReportsPage from "../pages/Admin/AdminReportsPage";
import AdminAnalyticsPage from "../pages/Admin/AdminAnalyticsPage";
import AdminSettingsPage from "../pages/Admin/AdminSettingsPage";
import AdminProfilePage from "../pages/Admin/AdminProfilePage";
import DepartmentDashboardPage from "../pages/Admin/Department/DepartmentDashboardPage";
import DepartmentAssignedPage from "../pages/Admin/Department/DepartmentAssignedPage";
import DepartmentDepartmentsPage from "../pages/Admin/Department/DepartmentDepartmentsPage";
import DepartmentReportsPage from "../pages/Admin/Department/DepartmentReportsPage";

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
      <Route path="/map" element={<ComplaintsMapPage />} />
      <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
      <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
      <Route path="/admin/profile" element={<AdminProfilePage />} />
      <Route path="/department" element={<DepartmentDashboardPage />} />
      <Route path="/department/assigned" element={<DepartmentAssignedPage />} />
      <Route path="/department/departments" element={<DepartmentDepartmentsPage />} />
      <Route path="/department/reports" element={<DepartmentReportsPage />} />
      {/* Routes will be added here each week */}
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
