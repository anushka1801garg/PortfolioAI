import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // INDIA-02: User-friendly notification for timeouts, offline status, or network connection dropouts
    const isNetworkError =
      error.code === "ECONNABORTED" ||
      error.message === "Network Error" ||
      error.code === "ERR_NETWORK" ||
      (!error.response && Boolean(error.request));

    if (isNetworkError && typeof window !== "undefined") {
      toast.error("Network connection unstable. Please check your internet and retry.", {
        id: "network-connection-error",
      });
    }

    // If receiving 401 Unauthorized and user has a token, clear stale session on protected pages
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const isPublicPath =
        currentPath.startsWith("/login") ||
        currentPath.startsWith("/register") ||
        currentPath.startsWith("/p/") ||
        currentPath.startsWith("/templates/preview");

      if (!isPublicPath && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
