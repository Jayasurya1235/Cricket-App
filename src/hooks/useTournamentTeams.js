import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "../api/tournaments";

export function useTournamentTeams(tournamentId) {
  return useQuery({
    queryKey: ["tournaments", tournamentId, "teams"],
    queryFn: () => tournamentsApi.listTeams(tournamentId),
    enabled: !!tournamentId,
  });
}
