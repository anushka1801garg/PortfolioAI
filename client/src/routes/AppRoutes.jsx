import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../features/landing/pages/LandingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
