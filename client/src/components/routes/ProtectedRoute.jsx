import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { isTokenExpired } from "../../utils/token.util";

const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated, authChecked } = useSelector(
    (state) => state.auth,
  );

  // If token is expired (older than 1 day), redirect immediately to login
  if (token && isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  // If a token exists but auth check hasn't completed yet, show a sleek spinner
  if (token && !authChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090B] text-white gap-4">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm font-medium animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
