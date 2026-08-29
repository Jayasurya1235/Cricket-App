import { apiClient } from "./client";

export const playersApi = {
  // GET /players
  list: async (skip = 0, limit = 100) => {
    const res = await apiClient.get("/players", { params: { skip, limit } });
    return res.data;
  },

  // GET /players/{id}
  getById: async (id) => {
    const res = await apiClient.get(`/players/${id}`);
    return res.data;
  },

  // POST /players
  create: async (data) => {
    const res = await apiClient.post("/players", data);
    return res.data;
  },

  // PATCH /players/{id}
  update: async (id, data) => {
    const res = await apiClient.patch(`/players/${id}`, data);
    return res.data;
  },

  // DELETE /players/{id}
  remove: async (id) => {
    await apiClient.delete(`/players/${id}`);
  },

  // POST /players/{id}/resend-otp
  resendOtp: async (id) => {
    const res = await apiClient.post(`/players/${id}/resend-otp`);
    return res.data;
  },
};
