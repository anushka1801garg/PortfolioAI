import api from "../../../services/api";

export const generatePortfolio = async (formData) => {
  return await api.post("/portfolio-generator/generate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const generateFromData = async (payload) => {
  return await api.post("/portfolio-generator/generate-from-data", payload);
};

export const extractGitHubUsername = (input) => {
  if (!input || typeof input !== "string") return "";
  let str = input.trim();
  str = str.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const ghRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-.]+)/i;
  const match = str.match(ghRegex);
  if (match && match[1]) {
    const segment = match[1].replace(/^\/+/, "").replace(/\/+$/, "");
    if (!["topics", "search", "explore", "settings", "features", "pricing", "login", "join"].includes(segment.toLowerCase())) {
      return segment;
    }
  }
  return str.replace(/^@+/, "").replace(/\/.*$/, "").trim();
};

export const fetchGitHubProfile = async (username) => {
  const cleanUsername = extractGitHubUsername(username);
  if (!cleanUsername) {
    throw new Error("Invalid GitHub username or profile URL");
  }
  return await api.get(`/portfolio-generator/github/${encodeURIComponent(cleanUsername)}`);
};

export const extractPortfolioUrl = async (url) => {
  return await api.post("/portfolio-generator/extract-url", { url });
};

export const analyzePortfolioReference = async (data) => {
  if (data instanceof FormData) {
    return await api.post("/portfolio-generator/analyze-reference", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  return await api.post("/portfolio-generator/analyze-reference", data);
};

