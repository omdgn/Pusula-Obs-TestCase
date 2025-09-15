// src/services/authService.js
import api from "../utils/axiosInstance";

export const register = async (data) => {
  const response = await api.post("/api/auth/register", data);
  return response.data;
};

export const login = async (data) => {
  const response = await api.post("/api/auth/login", data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};
