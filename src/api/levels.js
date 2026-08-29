import { apiClient } from "./client";

export const levelsApi = {
  list: async () => {
    const res = await apiClient.get("/team-levels");
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post("/team-levels", data);
    return res.data;
  },
};
