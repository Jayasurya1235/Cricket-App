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

  // GET /teams/{team_id}/analytics?recent=
  // Record across completed matches this account owns. TeamAnalyticsResponse.
  getAnalytics: async (teamId, recent) => {
    const res = await apiClient.get(`/teams/${teamId}/analytics`, {
      params: recent ? { recent } : undefined,
    });
    return res.data;
  },

  // GET /teams/{team_id}/head-to-head/{opponent_id}?recent=&top=
  // Two teams' completed-meeting record. HeadToHeadAnalyticsResponse.
  getHeadToHead: async (teamId, opponentId, { recent, top } = {}) => {
    const params = {};
    if (recent) params.recent = recent;
    if (top) params.top = top;
    const res = await apiClient.get(
      `/teams/${teamId}/head-to-head/${opponentId}`,
      { params: Object.keys(params).length ? params : undefined },
    );
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

  // NOTE: there is no GET /teams/{id}/players in the API — that path only
  // accepts POST. To read a team's players use one of:
  //   GET /teams/{id}/squad              -> the full squad
  //   GET /teams/{id}/available-players  -> searchable, paginated

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
