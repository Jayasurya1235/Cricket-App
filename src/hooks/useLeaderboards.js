import { useQuery } from "@tanstack/react-query";
import { leaderboardsApi } from "../api/leaderboards";

export function useBattingLeaderboards({
  top = 10,
  minBallsFaced = 30,
  minDismissals = 3,
} = {}) {
  return useQuery({
    queryKey: ["leaderboards", "batting", top, minBallsFaced, minDismissals],
    queryFn: () => leaderboardsApi.getBatting({ top, minBallsFaced, minDismissals }),
  });
}

export function useBowlingLeaderboards({ top = 10, minOvers = 3 } = {}) {
  return useQuery({
    queryKey: ["leaderboards", "bowling", top, minOvers],
    queryFn: () => leaderboardsApi.getBowling({ top, minOvers }),
  });
}

export function useFieldingLeaderboards({ top = 10 } = {}) {
  return useQuery({
    queryKey: ["leaderboards", "fielding", top],
    queryFn: () => leaderboardsApi.getFielding({ top }),
  });
}
