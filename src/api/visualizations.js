import { apiClient } from "./client";

// ============================================================
// VISUALIZATION API SERVICE
// ============================================================
// Verified against GET https://cricketapp.in/openapi.json. Every endpoint
// returns null instead of throwing when there is no data yet (404), so callers
// can render an empty state rather than an error.
//
// Match visualizations (all accept ?innings_number):
//   GET /v1/matches/{id}/visualizations/runs-by-over        -> RunsByOverResponse
//   GET /v1/matches/{id}/visualizations/innings-progression -> InningsProgressionResponse
//   GET /v1/matches/{id}/visualizations/player-runs         -> PlayerRunsResponse
//   GET /v1/matches/{id}/visualizations/player-strike-rate  -> PlayerRunsResponse (?min_balls_faced, default 1)
//   GET /v1/matches/{id}/visualizations/bowler-economy      -> BowlerStatsResponse (?min_overs, default 0.0)
//   GET /v1/matches/{id}/visualizations/wickets-by-bowler   -> BowlerStatsResponse
//   GET /v1/matches/{id}/visualizations/run-distribution    -> RunDistributionResponse
//   GET /v1/matches/{id}/visualizations/partnerships        -> PartnershipsResponse
//
// Team visualizations:
//   GET /v1/teams/{id}/visualizations/win-loss-trend        -> WinLossTrendResponse
//   GET /v1/teams/{id}/visualizations/recent-form?limit=5   -> RecentFormResponse

async function getOrNull(url, params) {
  try {
    const res = await apiClient.get(url, { params });
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

function inningsParam(inningsNumber) {
  return inningsNumber != null ? { innings_number: inningsNumber } : undefined;
}

export const matchVisualizationsApi = {
  runsByOver: (matchId, inningsNumber) =>
    getOrNull(
      `/matches/${matchId}/visualizations/runs-by-over`,
      inningsParam(inningsNumber),
    ),

  inningsProgression: (matchId, inningsNumber) =>
    getOrNull(
      `/matches/${matchId}/visualizations/innings-progression`,
      inningsParam(inningsNumber),
    ),

  playerRuns: (matchId, inningsNumber) =>
    getOrNull(
      `/matches/${matchId}/visualizations/player-runs`,
      inningsParam(inningsNumber),
    ),

  playerStrikeRate: (matchId, inningsNumber, minBallsFaced = 1) =>
    getOrNull(`/matches/${matchId}/visualizations/player-strike-rate`, {
      ...inningsParam(inningsNumber),
      min_balls_faced: minBallsFaced,
    }),

  bowlerEconomy: (matchId, inningsNumber, minOvers = 0) =>
    getOrNull(`/matches/${matchId}/visualizations/bowler-economy`, {
      ...inningsParam(inningsNumber),
      min_overs: minOvers,
    }),

  wicketsByBowler: (matchId, inningsNumber) =>
    getOrNull(
      `/matches/${matchId}/visualizations/wickets-by-bowler`,
      inningsParam(inningsNumber),
    ),

  runDistribution: (matchId, inningsNumber) =>
    getOrNull(
      `/matches/${matchId}/visualizations/run-distribution`,
      inningsParam(inningsNumber),
    ),

  partnerships: (matchId, inningsNumber) =>
    getOrNull(
      `/matches/${matchId}/visualizations/partnerships`,
      inningsParam(inningsNumber),
    ),
};

export const teamVisualizationsApi = {
  winLossTrend: (teamId) =>
    getOrNull(`/teams/${teamId}/visualizations/win-loss-trend`),

  recentForm: (teamId, limit = 5) =>
    getOrNull(`/teams/${teamId}/visualizations/recent-form`, { limit }),
};
