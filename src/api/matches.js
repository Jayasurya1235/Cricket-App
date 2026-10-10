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

  // GET /matches/{match_id}/summary
  // Full summary: result/winner/margin, toss, both innings, top performers,
  // player of the match and highlights. Returns null when the match has no
  // summary yet (404), mirroring scoringApi.getScorecard.
  getSummary: async (id) => {
    try {
      const res = await apiClient.get(`/matches/${id}/summary`);
      return res.data;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  // GET /matches/{match_id}/analytics
  // Per-innings analytics for the whole match (MatchAnalyticsResponse): every
  // delivery in order plus the over-by-over, scoring pattern, extras breakdown
  // and run-rate progression. Unlike the scorecard endpoint (one innings at a
  // time) this covers BOTH innings, so the summary page rebuilds each side's
  // full batting/bowling card from the delivery log. Returns null when the
  // match has no recorded deliveries yet (404).
  getAnalytics: async (id) => {
    try {
      const res = await apiClient.get(`/matches/${id}/analytics`);
      return res.data;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
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