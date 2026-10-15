import { useQuery } from "@tanstack/react-query";
import { teamVisualizationsApi } from "../api/visualizations";

export function useWinLossTrend(teamId) {
  return useQuery({
    queryKey: ["teams", teamId, "visualizations", "win-loss-trend"],
    queryFn: () => teamVisualizationsApi.winLossTrend(teamId),
    enabled: !!teamId,
  });
}

export function useTeamRecentForm(teamId, limit = 5) {
  return useQuery({
    queryKey: ["teams", teamId, "visualizations", "recent-form", limit],
    queryFn: () => teamVisualizationsApi.recentForm(teamId, limit),
    enabled: !!teamId,
  });
}
