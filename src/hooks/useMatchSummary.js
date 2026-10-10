import { useQuery } from "@tanstack/react-query";
import { matchesApi } from "../api/matches";

export function useMatchSummary(matchId) {
  return useQuery({
    queryKey: ["matches", matchId, "summary"],
    queryFn: () => matchesApi.getSummary(matchId),
    enabled: !!matchId,
  });
}
