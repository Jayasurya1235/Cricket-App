import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "../api/tournaments";

export function useTournament(tournamentId) {
  return useQuery({
    queryKey: ["tournaments", tournamentId],
    queryFn: () => tournamentsApi.getById(tournamentId),
    enabled: !!tournamentId,
  });
}
