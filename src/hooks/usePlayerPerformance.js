import { useQuery } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function usePlayerPerformance(playerId) {
  return useQuery({
    queryKey: ["players", playerId, "performance"],
    queryFn: () => playersApi.getPerformance(playerId),
    enabled: !!playerId,
  });
}
