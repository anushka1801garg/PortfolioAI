import api from "../../../services/api";

// Upload Resume
export const uploadResume = async (formData) => {
  return await api.post("/resume/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Get All Resumes
export const getResumes = async () => {
  return await api.get("/resume");
};

// Delete Resume
export const deleteResume = async (id) => {
  return await api.delete(`/resume/${id}`);
};
