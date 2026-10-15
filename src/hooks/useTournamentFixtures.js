import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "../api/tournaments";

export function useTournamentFixtures(tournamentId, skip = 0, limit = 100) {
  return useQuery({
    queryKey: ["tournaments", tournamentId, "fixtures", skip, limit],
    queryFn: () => tournamentsApi.listFixtures(tournamentId, skip, limit),
    enabled: !!tournamentId,
  });
}
