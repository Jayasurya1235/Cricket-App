import { apiClient } from "./client";

export const countryCodesApi = {
  list: async () => {
    const res = await apiClient.get("/country-codes");
    return res.data;
  },
};
