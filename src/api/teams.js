import { apiClient } from "./client";

export const teamsApi = {
  // GET /teams
  list: async (skip = 0, limit = 100) => {
    const res = await apiClient.get("/teams", { params: { skip, limit } });
    return res.data;
  },

  // GET /teams/{id}
  getById: async (id) => {
    const res = await apiClient.get(`/teams/${id}`);
    return res.data;
  },

  // POST /teams
  create: async (data) => {
    const res = await apiClient.post("/teams", data);
    return res.data;
  },

  // PATCH /teams/{id}
  update: async (id, data) => {
    const res = await apiClient.patch(`/teams/${id}`, data);
    return res.data;
  },

  // DELETE /teams/{id}
  remove: async (id) => {
    await apiClient.delete(`/teams/${id}`);
  },

  // POST /teams/{id}/upload-logo
  uploadLogo: async (id, file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await apiClient.post(`/teams/${id}/upload-logo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // GET /teams/{id}/players
  listPlayers: async (teamId) => {
    const res = await apiClient.get(`/teams/${teamId}/players`);
    return res.data;
  },

  // POST /teams/{id}/players
  addPlayer: async (teamId, data) => {
    const res = await apiClient.post(`/teams/${teamId}/players`, data);
    return res.data;
  },

  // DELETE /players/{player_id}/teams/{team_id}
  removePlayer: async (teamId, playerId) => {
    await apiClient.delete(`/players/${playerId}/teams/${teamId}`);
  },
};
