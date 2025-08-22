import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import DashboardWrapper from "./components/DashboardWrapper";
import LoginPage from "./components/LoginPage";

export default function App() {
  return (
    <Routes>
      {/* Login page as default */}
      <Route path="/" element={<LoginPage />} />

      {/* Dashboard page */}
      <Route path="/dashboard" element={<DashboardWrapper />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
