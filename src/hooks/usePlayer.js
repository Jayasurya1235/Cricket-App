import { useQuery } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function usePlayer(playerId) {
  return useQuery({
    queryKey: ["players", playerId],
    queryFn: () => playersApi.getById(playerId),
    enabled: !!playerId,
  });
}
