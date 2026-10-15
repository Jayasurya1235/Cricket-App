import { useQuery } from "@tanstack/react-query";
import { matchesApi } from "../api/matches";

export function useMatchPartnerships(matchId, inningsNumber) {
  return useQuery({
    queryKey: ["matches", matchId, "partnerships", inningsNumber ?? "all"],
    queryFn: () => matchesApi.getPartnerships(matchId, inningsNumber),
    enabled: !!matchId,
  });
}
