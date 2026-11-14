import api from "../../../services/api";

// Create
export const createPortfolio = (data) => api.post("/portfolios", data);

// Get All
export const getAllPortfolios = (params) => api.get("/portfolios", { params });

// Get One (with fallback to public endpoint if session mismatch or 404)
export const getPortfolio = async (id) => {
  try {
    return await api.get(`/portfolios/${id}`);
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 404) {
      return await api.get(`/portfolios/public/${id}`);
    }
    throw err;
  }
};

// Get Public Portfolio
export const getPublicPortfolio = (id) => api.get(`/portfolios/public/${id}`);

// Update
export const updatePortfolio = (id, data) => api.put(`/portfolios/${id}`, data);

// Upload Avatar / Photo
export const uploadPortfolioAvatar = (id, formData) =>
  api.post(`/portfolios/${id}/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Upload Resume Document
export const uploadPortfolioResume = (id, formData) =>
  api.post(`/portfolios/${id}/resume`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// Delete
export const deletePortfolio = (id) => api.delete(`/portfolios/${id}`);

// Duplicate
export const duplicatePortfolio = (id) => api.post(`/portfolios/duplicate/${id}`);

// Archive / Unarchive
export const toggleArchivePortfolio = (id) => api.patch(`/portfolios/archive/${id}`);

// Apply AI Suggestions (Creates version snapshot)
export const applyAISuggestions = (id, suggestions) =>
  api.post(`/portfolios/apply-ai/${id}`, { suggestions });

// Restore Version Snapshot
export const restoreVersion = (id, versionNumber) =>
  api.post(`/portfolios/restore-version/${id}/${versionNumber}`);

// AI Chat Assistant
export const chatWithPortfolioAI = (payload) =>
  api.post("/portfolios/chat", payload);

// ChatGPT-Style Chat History Sessions
export const getChatSessions = () => api.get("/portfolios/chat/sessions");
export const saveChatSession = (data) => api.post("/portfolios/chat/sessions", data);
export const deleteChatSession = (sessionId) => api.delete(`/portfolios/chat/sessions/${sessionId}`);
export const clearChatSessions = () => api.delete("/portfolios/chat/sessions");

// 1-Click Deployment (Vercel, Netlify, GitHub Pages)
export const deployPortfolio = (payload) =>
  api.post("/deployment/deploy", payload);

// Download Standalone Deployment Package (.zip)
export const downloadPortfolioZip = (portfolioId) =>
  api.get(`/deployment/download-zip/${portfolioId}`, {
    responseType: "blob",
  });

// Download Standalone HTML (.html)
export const downloadPortfolioHtml = (portfolioId) =>
  api.get(`/deployment/download-html/${portfolioId}`, {
    responseType: "blob",
  });

// Push Portfolio to GitHub
export const pushPortfolioToGitHub = (payload) =>
  api.post("/deployment/github-push", payload);

// Save Real Cloud Live URL (e.g. from Netlify Drop or custom domain)
export const saveLiveCloudUrl = (payload) =>
  api.post("/deployment/save-live-url", payload);

// Clear / Reset Deployment
export const clearPortfolioDeployment = (portfolioId) =>
  api.post("/deployment/clear-deployment", { portfolioId });

// GitHub OAuth Helpers (1-Click Global Integration)
export const getGitHubOAuthUrl = () =>
  api.get("/auth/github/url");

export const sendGitHubOAuthCode = (code, state) =>
  api.post("/auth/github/callback", { code, state });

export const getGitHubOAuthStatus = () =>
  api.get("/auth/github/status");

export const disconnectGitHubAccount = () =>
  api.post("/auth/github/disconnect");

export const generatePortfolio = async (formData) => {
  return await api.post("/portfolio-generator/generate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};


