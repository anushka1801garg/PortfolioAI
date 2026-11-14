import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import CustomCursor from "./components/common/CustomCursor";
import TemplateRenderer from "./features/portfolio/components/templates/TemplateRenderer";

import { fetchCurrentUser, setAuthChecked, logout } from "./redux/auth/authSlice";
import { fetchProfile, clearProfile } from "./redux/profile/profileSlice";
import { isTokenExpired, getTokenRemainingTime } from "./utils/token.util";

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem("token");
      dispatch(logout());
      dispatch(clearProfile());
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [dispatch]);

  // Initial authentication check & user profile hydration on app mount
  useEffect(() => {
    if (window.__PORTFOLIO_DATA__) return;

    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      // If the 1-day login has elapsed, clear session immediately and require login
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem("token");
        dispatch(logout());
        dispatch(clearProfile());
        dispatch(setAuthChecked());
        return;
      }

      dispatch(fetchCurrentUser());
      dispatch(fetchProfile());
    } else {
      dispatch(setAuthChecked());
    }
  }, [dispatch]);

  // Active session timer: automatically expires session after 1 day (runs on mount and on dynamic login)
  useEffect(() => {
    if (!token) return;

    const remainingMs = getTokenRemainingTime(token);
    if (remainingMs > 0) {
      const timer = setTimeout(() => {
        localStorage.removeItem("token");
        dispatch(logout());
        dispatch(clearProfile());
      }, remainingMs);
      return () => clearTimeout(timer);
    }
  }, [token, dispatch]);

  // When deployed standalone to Netlify, Vercel, or GitHub Pages:
  // Render the exact identical React component and styles as seen in the editor!
  if (window.__PORTFOLIO_DATA__) {
    return (
      <>
        <CustomCursor />
        <TemplateRenderer portfolio={window.__PORTFOLIO_DATA__} />
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <AppRoutes />
    </>
  );
}

export default App;
