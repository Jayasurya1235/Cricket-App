import { useQuery } from "@tanstack/react-query";
import { matchVisualizationsApi } from "../api/visualizations";

// All match visualization queries are keyed under ["matches", id, "visualizations"]
// so they can be invalidated together, and each carries the innings filter.

const KEY = "visualizations";

export function useRunsByOver(matchId, inningsNumber) {
  return useQuery({
    queryKey: ["matches", matchId, KEY, "runs-by-over", inningsNumber ?? "all"],
    queryFn: () => matchVisualizationsApi.runsByOver(matchId, inningsNumber),
    enabled: !!matchId,
  });
}

export function useInningsProgression(matchId, inningsNumber) {
  return useQuery({
    queryKey: [
      "matches",
      matchId,
      KEY,
      "innings-progression",
      inningsNumber ?? "all",
    ],
    queryFn: () =>
      matchVisualizationsApi.inningsProgression(matchId, inningsNumber),
    enabled: !!matchId,
  });
}

export function usePlayerRuns(matchId, inningsNumber) {
  return useQuery({
    queryKey: ["matches", matchId, KEY, "player-runs", inningsNumber ?? "all"],
    queryFn: () => matchVisualizationsApi.playerRuns(matchId, inningsNumber),
    enabled: !!matchId,
  });
}

export function usePlayerStrikeRate(matchId, inningsNumber, minBallsFaced = 1) {
  return useQuery({
    queryKey: [
      "matches",
      matchId,
      KEY,
      "player-strike-rate",
      inningsNumber ?? "all",
      minBallsFaced,
    ],
    queryFn: () =>
      matchVisualizationsApi.playerStrikeRate(
        matchId,
        inningsNumber,
        minBallsFaced,
      ),
    enabled: !!matchId,
  });
}

export function useBowlerEconomy(matchId, inningsNumber, minOvers = 0) {
  return useQuery({
    queryKey: [
      "matches",
      matchId,
      KEY,
      "bowler-economy",
      inningsNumber ?? "all",
      minOvers,
    ],
    queryFn: () =>
      matchVisualizationsApi.bowlerEconomy(matchId, inningsNumber, minOvers),
    enabled: !!matchId,
  });
}

export function useWicketsByBowler(matchId, inningsNumber) {
  return useQuery({
    queryKey: [
      "matches",
      matchId,
      KEY,
      "wickets-by-bowler",
      inningsNumber ?? "all",
    ],
    queryFn: () =>
      matchVisualizationsApi.wicketsByBowler(matchId, inningsNumber),
    enabled: !!matchId,
  });
}

export function useRunDistribution(matchId, inningsNumber) {
  return useQuery({
    queryKey: [
      "matches",
      matchId,
      KEY,
      "run-distribution",
      inningsNumber ?? "all",
    ],
    queryFn: () =>
      matchVisualizationsApi.runDistribution(matchId, inningsNumber),
    enabled: !!matchId,
  });
}

export function useVisualizationPartnerships(matchId, inningsNumber) {
  return useQuery({
    queryKey: [
      "matches",
      matchId,
      KEY,
      "partnerships",
      inningsNumber ?? "all",
    ],
    queryFn: () =>
      matchVisualizationsApi.partnerships(matchId, inningsNumber),
    enabled: !!matchId,
  });
}
