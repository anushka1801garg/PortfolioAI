import api from "../../../services/api";

export const subscribeToPlan = async (paymentData) => {
  const response = await api.post("/users/subscribe", paymentData);
  return response.data;
};
