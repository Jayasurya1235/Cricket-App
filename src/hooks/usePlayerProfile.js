import { useQuery } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function usePlayerProfile(playerId) {
  return useQuery({
    queryKey: ["players", playerId, "profile"],
    queryFn: () => playersApi.getProfile(playerId),
    enabled: !!playerId,
  });
}
