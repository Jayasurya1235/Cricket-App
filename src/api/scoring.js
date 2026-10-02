import { apiClient } from "./client";

// ============================================================
// SCORING API SERVICE
// ============================================================
// Verified against GET https://cricketapp.in/openapi.json (scoring group):
//   GET  /v1/matches/{match_id}/scorecard      -> ScorecardResponse | 404
//   POST /v1/matches/{match_id}/start-innings  -> ScorecardResponse
//   POST /v1/matches/{match_id}/deliveries     -> ScorecardResponse
//   POST /v1/matches/{match_id}/batting-order  -> ScorecardResponse
//
// DeliveryCreate (striker_id, non_striker_id and bowler_id are required):
//   runs_batsman=0, runs_extras=0,
//   extra_type="none"|"wide"|"no_ball"|"bye"|"leg_bye",
//   wicket_type="bowled"|"caught"|"lbw"|"run_out"|"stumped"|"hit_wicket"|null,
//   dismissed_player_id=null
//
// AddBatsmanRequest: { player_id }  (brings in the next batsman after a
// wicket, or a substitute who was not in the original order)
//
// The server is the source of truth: it owns the striker/non-striker, the
// over count, the legal-ball count and the previous over's bowler, and every
// mutation returns the full ScorecardResponse. The UI re-renders from that
// response and never computes runs, wickets or overs itself.
//
// Note: ScorecardResponse has NO ball-by-ball list and the API exposes no
// delivery-history endpoint, so the "Recent Balls" strip is assembled by the
// client from the deliveries it submitted, annotated with the server's own
// legal/non-legal verdict. See src/utils/scoring.js.
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
  // Brings in the batsman who comes in after a wicket (the server then sets
  // striker_id / non_striker_id), or adds a substitute who was not part of the
  // initial batting order. Returns the updated ScorecardResponse.
  addBatsman: async (matchId, playerId) => {
    const res = await apiClient.post(`/matches/${matchId}/batting-order`, {
      player_id: playerId,
    });
    return res.data;
  },
};