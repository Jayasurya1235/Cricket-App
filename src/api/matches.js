import { apiClient } from "./client";

// Verified against GET https://cricketapp.in/openapi.json (match group):
//   POST   /v1/matches                -> 201 MatchResponse   (MatchCreate body)
//   GET    /v1/matches?skip&limit     -> MatchResponse[]
//   GET    /v1/matches/{match_id}     -> MatchResponse
//   PUT    /v1/matches/{match_id}     -> MatchResponse       (MatchCreate body)
//   PATCH  /v1/matches/{match_id}     -> MatchResponse       (MatchUpdate body)
//   DELETE /v1/matches/{match_id}     -> 204
//
// MatchCreate required: match_date, match_time, venue, match_type,
//   team_a_id, team_b_id, toss_winner_id, toss_decision.
// Optional (nullable): result, referee_1_name, referee_2_name, match_referee_name.

export const matchesApi = {
  // GET /matches?skip=&limit=
  list: async (skip = 0, limit = 100) => {
    const res = await apiClient.get("/matches", { params: { skip, limit } });
    return res.data;
  },

  // GET /matches/{id}
  getById: async (id) => {
    const res = await apiClient.get(`/matches/${id}`);
    return res.data;
  },

  // POST /matches
  create: async (data) => {
    const res = await apiClient.post("/matches", data);
    return res.data;
  },

  // PUT /matches/{id}  (full replacement)
  replace: async (id, data) => {
    const res = await apiClient.put(`/matches/${id}`, data);
    return res.data;
  },

  // PATCH /matches/{id}  (partial update)
  update: async ({ id, data }) => {
    const res = await apiClient.patch(`/matches/${id}`, data);
    return res.data;
  },

  // DELETE /matches/{id}
  remove: async (id) => {
    await apiClient.delete(`/matches/${id}`);
  },
};