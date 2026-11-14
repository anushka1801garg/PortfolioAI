import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingPage from "../features/landing/pages/LandingPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";

import ProtectedRoute from "../components/routes/ProtectedRoute";
import MyPortfoliosPage from "../features/portfolio/pages/MyPortfoliosPage";
import CreatePortfolioPage from "../features/portfolio/pages/CreatePortfolioPage";
import EditPortfolioPage from "../features/portfolio/pages/EditPortfolioPage";
import PortfolioDetailsPage from "../features/portfolio/pages/PortfolioDetailsPage";
import PortfolioGenerator from "../features/portfolio/pages/PortfolioGenerator";
import PublicPortfolioPage from "../features/portfolio/pages/PublicPortfolioPage";
import AnalyzerPage from "../features/analyzer/pages/AnalyzerPage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import TemplatePreviewPage from "../features/portfolio/pages/TemplatePreviewPage";
import PaymentSuccessPage from "../features/subscription/pages/PaymentSuccessPage";
import ChatbotPage from "../features/chat/pages/ChatbotPage";
import GitHubCallbackPage from "../features/auth/pages/GitHubCallbackPage";

// Smart route handler: authenticated owners get full management dashboard;
// unauthenticated public visitors get routed directly to the public portfolio view!
const PortfolioAccessRoute = () => {
  const { isAuthenticated, authChecked, token } = useSelector(
    (state) => state.auth
  );
  const { id } = useParams();

  if (token && !authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B] text-white">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/p/${id}`} replace />;
  }

  return <PortfolioDetailsPage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* GitHub OAuth Callback */}
      <Route
        path="/auth/github/callback"
        element={
          <ProtectedRoute>
            <GitHubCallbackPage />
          </ProtectedRoute>
        }
      />


      {/* Template Live Preview (Public Interactive Demo) */}
      <Route
        path="/templates/preview/:templateId"
        element={<TemplatePreviewPage />}
      />
      <Route path="/templates/preview" element={<TemplatePreviewPage />} />

      {/* Public Shareable Portfolio View */}
      <Route path="/p/:id" element={<PublicPortfolioPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* My Portfolios Listing */}
      <Route
        path="/portfolio"
        element={
          <ProtectedRoute>
            <MyPortfoliosPage />
          </ProtectedRoute>
        }
      />

      {/* Create Portfolio */}
      <Route
        path="/portfolio/create"
        element={
          <ProtectedRoute>
            <CreatePortfolioPage />
          </ProtectedRoute>
        }
      />

      {/* Edit Portfolio */}
      <Route
        path="/portfolio/edit/:id"
        element={
          <ProtectedRoute>
            <EditPortfolioPage />
          </ProtectedRoute>
        }
      />

      {/* Portfolio Preview & Management (Auto-routes public visitors to public view) */}
      <Route path="/portfolio/:id" element={<PortfolioAccessRoute />} />

      {/* AI Portfolio Generator */}
      <Route
        path="/portfolio-generator"
        element={
          <ProtectedRoute>
            <PortfolioGenerator />
          </ProtectedRoute>
        }
      />

      {/* Legacy /resume redirected to AI Portfolio Studio */}
      <Route
        path="/resume"
        element={<Navigate to="/portfolio-generator" replace />}
      />

      {/* ATS Analyzer */}
      <Route
        path="/analyzer"
        element={
          <ProtectedRoute>
            <AnalyzerPage />
          </ProtectedRoute>
        }
      />

      {/* Settings & Profile */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* AI Career Chatbot */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatbotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbot"
        element={
          <ProtectedRoute>
            <ChatbotPage />
          </ProtectedRoute>
        }
      />

      {/* Stripe Payment Success */}
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
