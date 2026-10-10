import { useQuery } from "@tanstack/react-query";
import { matchesApi } from "../api/matches";

export function useMatchAnalytics(matchId) {
  return useQuery({
    queryKey: ["matches", matchId, "analytics"],
    queryFn: () => matchesApi.getAnalytics(matchId),
    enabled: !!matchId,
  });
}
