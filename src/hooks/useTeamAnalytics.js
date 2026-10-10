import { useQuery } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

export function useTeamAnalytics(teamId, recent) {
  return useQuery({
    queryKey: ["teams", teamId, "analytics", recent ?? "default"],
    queryFn: () => teamsApi.getAnalytics(teamId, recent),
    enabled: !!teamId,
  });
}
