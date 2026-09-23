import { apiClient } from "./client";

// ============================================================
// SCORING API SERVICE
// ============================================================
// Real backend endpoints (verified against the live server):
//   GET  /v1/matches/{id}/scorecard     -> ScorecardResponse (404 if no innings)
//   POST /v1/matches/{id}/start-innings -> ScorecardResponse (body: {batting_order:[player_id]})
//   POST /v1/matches/{id}/deliveries    -> ScorecardResponse
//   POST /v1/matches/{id}/batting-order -> ScorecardResponse (body: {player_id})
//
// DeliveryCreate body: { striker_id, non_striker_id, bowler_id,
//   runs_batsman=0, runs_extras=0, extra_type="none"|"wide"|"no_ball"|"bye"|"leg_bye",
//   wicket_type="bowled"|"caught"|"lbw"|"run_out"|"stumped"|"hit_wicket"|null,
//   dismissed_player_id=null }
//
// The server is the source of truth for the striker/non-striker and every
// delivery response returns the full scorecard; the UI should re-render from
// the returned ScorecardResponse.
// ============================================================

export const scoringApi = {
  // GET /matches/{match_id}/scorecard
  // Returns null when the match has no innings started yet (404).
  getScorecard: async (matchId) => {
    try {
      const res = await apiClient.get(`/matches/${matchId}/scorecard`);
      return res.data;
    } catch (err) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  // POST /matches/{match_id}/start-innings
  startInnings: async (matchId, battingOrder) => {
    const res = await apiClient.post(`/matches/${matchId}/start-innings`, {
      batting_order: battingOrder,
    });
    return res.data;
  },

  // POST /matches/{match_id}/deliveries
  recordDelivery: async (matchId, data) => {
    const res = await apiClient.post(`/matches/${matchId}/deliveries`, data);
    return res.data;
  },

  // POST /matches/{match_id}/batting-order
  // Adds a batsman (e.g. substitute) who was not part of the initial order.
  addBatsman: async (matchId, playerId) => {
    const res = await apiClient.post(`/matches/${matchId}/batting-order`, {
      player_id: playerId,
    });
    return res.data;
  },
};