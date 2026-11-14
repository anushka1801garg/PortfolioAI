import api from "../../../services/api";

export const analyzeResume = async (formData) => {
  return await api.post("/analyzer/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const analyzePortfolio = async (payload) => {
  return await api.post("/analyzer/analyze-portfolio", payload);
};

export const analyzeUrl = async (payload) => {
  return await api.post("/analyzer/analyze-url", payload);
};

export const analyzeCode = async (payload) => {
  return await api.post("/analyzer/analyze-code", payload);
};

export const fetchRawHtml = async (url) => {
  return await api.get("/analyzer/fetch-raw-html", { params: { url } });
};

