import { apiClient } from "./client";

// ============================================================
// TOURNAMENTS API SERVICE
// ============================================================
// Verified against GET https://cricketapp.in/openapi.json (tournaments group):
//   GET    /v1/tournaments?skip&limit                 -> TournamentResponse[]
//   POST   /v1/tournaments                            -> TournamentResponse (TournamentCreate)
//   GET    /v1/tournaments/{id}                        -> TournamentResponse
//   PATCH  /v1/tournaments/{id}                        -> TournamentResponse (TournamentUpdate)
//   DELETE /v1/tournaments/{id}                        -> 204
//   GET    /v1/tournaments/{id}/teams                   -> TournamentTeamList
//   POST   /v1/tournaments/{id}/teams                   -> TournamentTeamResponse (TournamentTeamAdd)
//   DELETE /v1/tournaments/{id}/teams/{team_id}         -> 204
//   GET    /v1/tournaments/{id}/fixtures?skip&limit     -> FixtureResponse[]
//   POST   /v1/tournaments/{id}/fixtures                -> FixtureResponse (FixtureCreate)
//   POST   /v1/tournaments/{id}/fixtures/generate       -> FixtureResponse[] (FixtureGenerate)
//   POST   /v1/tournaments/{id}/fixtures/knockout       -> FixtureResponse[] (KnockoutGenerate)
//   PATCH  /v1/tournaments/{id}/fixtures/{fixture_id}   -> FixtureResponse (FixtureUpdate)
//   DELETE /v1/tournaments/{id}/fixtures/{fixture_id}   -> 204
//   POST   /v1/tournaments/{id}/fixtures/{fid}/result   -> FixtureResponse (FixtureResult)
//   GET    /v1/tournaments/{id}/points-table            -> PointsTableResponse
//   GET    /v1/tournaments/{id}/leaderboards?top        -> TournamentLeaderboardResponse
//
// TournamentCreate required: name. Optional: description, level_id, format
//   ("league"|"knockout"|"league_knockout", default "league"), status
//   ("upcoming"|"ongoing"|"completed", default "upcoming"), start_date,
//   end_date and the points config (points_win=2, points_tie=1, points_loss=0,
//   points_no_result=1).

export const tournamentsApi = {
  // GET /tournaments?skip=&limit=
  list: async (skip = 0, limit = 100) => {
    const res = await apiClient.get("/tournaments", { params: { skip, limit } });
    return res.data;
  },

  // GET /tournaments/{id}
  getById: async (id) => {
    const res = await apiClient.get(`/tournaments/${id}`);
    return res.data;
  },

  // POST /tournaments
  create: async (data) => {
    const res = await apiClient.post("/tournaments", data);
    return res.data;
  },

  // PATCH /tournaments/{id}
  update: async ({ id, data }) => {
    const res = await apiClient.patch(`/tournaments/${id}`, data);
    return res.data;
  },

  // DELETE /tournaments/{id}
  remove: async (id) => {
    await apiClient.delete(`/tournaments/${id}`);
  },

  // GET /tournaments/{id}/teams
  listTeams: async (id) => {
    const res = await apiClient.get(`/tournaments/${id}/teams`);
    return res.data;
  },

  // POST /tournaments/{id}/teams
  addTeam: async (id, teamId) => {
    const res = await apiClient.post(`/tournaments/${id}/teams`, {
      team_id: Number(teamId),
    });
    return res.data;
  },

  // DELETE /tournaments/{id}/teams/{team_id}
  removeTeam: async (id, teamId) => {
    await apiClient.delete(`/tournaments/${id}/teams/${teamId}`);
  },

  // GET /tournaments/{id}/fixtures?skip=&limit=
  listFixtures: async (id, skip = 0, limit = 100) => {
    const res = await apiClient.get(`/tournaments/${id}/fixtures`, {
      params: { skip, limit },
    });
    return res.data;
  },

  // POST /tournaments/{id}/fixtures
  createFixture: async (id, data) => {
    const res = await apiClient.post(`/tournaments/${id}/fixtures`, data);
    return res.data;
  },

  // POST /tournaments/{id}/fixtures/generate
  // Round-robin schedule across the tournament's registered teams.
  generateFixtures: async (id, { legs = 1, replace = false } = {}) => {
    const res = await apiClient.post(`/tournaments/${id}/fixtures/generate`, {
      legs,
      replace,
    });
    return res.data;
  },

  // POST /tournaments/{id}/fixtures/knockout
  // Seeded knockout draw from the top `teams` seeds (2, 4 or 8).
  generateKnockout: async (id, { teams = 4 } = {}) => {
    const res = await apiClient.post(`/tournaments/${id}/fixtures/knockout`, {
      teams,
    });
    return res.data;
  },

  // PATCH /tournaments/{id}/fixtures/{fixture_id}
  updateFixture: async (id, fixtureId, data) => {
    const res = await apiClient.patch(
      `/tournaments/${id}/fixtures/${fixtureId}`,
      data,
    );
    return res.data;
  },

  // DELETE /tournaments/{id}/fixtures/{fixture_id}
  deleteFixture: async (id, fixtureId) => {
    await apiClient.delete(`/tournaments/${id}/fixtures/${fixtureId}`);
  },

  // POST /tournaments/{id}/fixtures/{fixture_id}/result
  // Links a played match to the fixture so the points table can score it.
  setFixtureResult: async (id, fixtureId, matchId) => {
    const res = await apiClient.post(
      `/tournaments/${id}/fixtures/${fixtureId}/result`,
      { match_id: Number(matchId) },
    );
    return res.data;
  },

  // GET /tournaments/{id}/points-table
  // Returns null when the tournament has no completed fixtures yet (404).
  getPointsTable: async (id) => {
    try {
      const res = await apiClient.get(`/tournaments/${id}/points-table`);
      return res.data;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  // GET /tournaments/{id}/leaderboards?top=
  getLeaderboards: async (id, top = 10) => {
    const res = await apiClient.get(`/tournaments/${id}/leaderboards`, {
      params: { top },
    });
    return res.data;
  },
};
