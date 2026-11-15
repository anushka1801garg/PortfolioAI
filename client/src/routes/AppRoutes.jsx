import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import ProtectedRoute from "../components/routes/ProtectedRoute";

// Lazy-loaded page components for route-level code splitting (PERF-01)
const LandingPage = lazy(() => import("../features/landing/pages/LandingPage"));
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const MyPortfoliosPage = lazy(() => import("../features/portfolio/pages/MyPortfoliosPage"));
const CreatePortfolioPage = lazy(() => import("../features/portfolio/pages/CreatePortfolioPage"));
const EditPortfolioPage = lazy(() => import("../features/portfolio/pages/EditPortfolioPage"));
const PortfolioDetailsPage = lazy(() => import("../features/portfolio/pages/PortfolioDetailsPage"));
const PortfolioGenerator = lazy(() => import("../features/portfolio/pages/PortfolioGenerator"));
const PublicPortfolioPage = lazy(() => import("../features/portfolio/pages/PublicPortfolioPage"));
const AnalyzerPage = lazy(() => import("../features/analyzer/pages/AnalyzerPage"));
const SettingsPage = lazy(() => import("../features/settings/pages/SettingsPage"));
const TemplatePreviewPage = lazy(() => import("../features/portfolio/pages/TemplatePreviewPage"));
const PaymentSuccessPage = lazy(() => import("../features/subscription/pages/PaymentSuccessPage"));
const ChatbotPage = lazy(() => import("../features/chat/pages/ChatbotPage"));
const GitHubCallbackPage = lazy(() => import("../features/auth/pages/GitHubCallbackPage"));

// Branded loading fallback for lazy-loaded route transitions
const RouteLoadingFallback = () => (
  <div className="flex min-h-[70vh] items-center justify-center bg-[#09090B] text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-mono text-zinc-400">Loading module...</span>
    </div>
  </div>
);

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
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
    </Suspense>
  );
};

export default AppRoutes;
