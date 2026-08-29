import { apiClient } from "./client";

export const playersApi = {
  // GET /players
  list: async (skip = 0, limit = 100) => {
    const res = await apiClient.get("/players", { params: { skip, limit } });
    return res.data;
  },

  // GET /players/search?q=...
  search: async (query, skip = 0, limit = 100) => {
    const res = await apiClient.get("/players/search", {
      params: { q: query, skip, limit },
    });
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

  // PUT /players/{id}
  replace: async (id, data) => {
    const res = await apiClient.put(`/players/${id}`, data);
    return res.data;
  },

  // PATCH /players/{id}
  update: async ({ id, data }) => {
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

  // POST /players/{player_id}/teams
  // Assigns an existing player to a team at a given level, with a role.
  // NOTE: team_id/level_id/role are NOT part of PlayerCreate/PlayerUpdate —
  // this is the only correct endpoint for team assignment.
  assignToTeam: async (playerId, { team_id, level_id, role }) => {
    const res = await apiClient.post(`/players/${playerId}/teams`, {
      team_id,
      level_id,
      role: role || "playing_11",
    });
    return res.data;
  },

  // GET /players/{player_id}/teams
  getPlayerTeams: async (playerId) => {
    const res = await apiClient.get(`/players/${playerId}/teams`);
    return res.data;
  },

  // PATCH /players/{player_id}/teams/{team_id}
  // Updates ONLY the role of an existing assignment — not the team or level.
  updatePlayerTeamRole: async (playerId, teamId, role) => {
    const res = await apiClient.patch(`/players/${playerId}/teams/${teamId}`, {
      role,
    });
    return res.data;
  },

  // DELETE /players/{player_id}/teams/{team_id}
  removeFromTeam: async (playerId, teamId) => {
    await apiClient.delete(`/players/${playerId}/teams/${teamId}`);
  },
};
