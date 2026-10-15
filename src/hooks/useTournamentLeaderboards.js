import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "../api/tournaments";

export function useTournamentLeaderboards(tournamentId, top = 10) {
  return useQuery({
    queryKey: ["tournaments", tournamentId, "leaderboards", top],
    queryFn: () => tournamentsApi.getLeaderboards(tournamentId, top),
    enabled: !!tournamentId,
  });
}
