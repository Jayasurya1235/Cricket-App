import { apiClient } from "./client";

export const locationsApi = {
  // GET /locations
  list: async () => {
    const res = await apiClient.get("/locations");
    return res.data;
  },
};
