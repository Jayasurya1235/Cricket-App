import { apiClient } from "./client";

// ============================================================
// LEADERBOARDS API SERVICE
// ============================================================
// Verified against GET https://cricketapp.in/openapi.json:
//   GET /v1/leaderboards/batting?top&min_balls_faced&min_dismissals
//                                       -> BattingLeaderboardsResponse
//   GET /v1/leaderboards/bowling?top&min_overs
//                                       -> BowlingLeaderboardsResponse
//   GET /v1/leaderboards/fielding?top   -> FieldingLeaderboardsResponse
//
// Each response carries a `scope` ("all"|"tournament"), the filters used and a
// set of category boards (e.g. most_runs, highest_strike_rate, best_batting_average
// for batting). Every board is { category, title, entries: [...] } with entries
// ranked by `position` and mirrored across value/player/team fields.

export const leaderboardsApi = {
  getBatting: async ({ top = 10, minBallsFaced = 30, minDismissals = 3 } = {}) => {
    const res = await apiClient.get("/leaderboards/batting", {
      params: {
        top,
        min_balls_faced: minBallsFaced,
        min_dismissals: minDismissals,
      },
    });
    return res.data;
  },

  getBowling: async ({ top = 10, minOvers = 3 } = {}) => {
    const res = await apiClient.get("/leaderboards/bowling", {
      params: { top, min_overs: minOvers },
    });
    return res.data;
  },

  getFielding: async ({ top = 10 } = {}) => {
    const res = await apiClient.get("/leaderboards/fielding", { params: { top } });
    return res.data;
  },
};
