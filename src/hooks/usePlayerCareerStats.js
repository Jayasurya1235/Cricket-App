import { useQuery } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function usePlayerCareerStats(playerId) {
  return useQuery({
    queryKey: ["players", playerId, "career-stats"],
    queryFn: () => playersApi.getCareerStats(playerId),
    enabled: !!playerId,
  });
}
