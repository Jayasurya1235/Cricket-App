import { apiClient } from "./client";

export const otpApi = {
  verify: async (data) => {
    const res = await apiClient.post("/verify-otp", data);
    return res.data;
  },
};
