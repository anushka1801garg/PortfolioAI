import api from "../../../services/api";

export const getProfile = () => api.get("/users/profile");

export const updateProfile = (data) => api.put("/users/profile", data);

export const uploadAvatar = (formData) =>
  api.post("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
