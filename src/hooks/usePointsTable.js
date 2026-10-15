import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "../api/tournaments";

// Returns null (not an error) when the tournament has no completed fixtures yet,
// so the points table can render an empty state.
export function usePointsTable(tournamentId) {
  return useQuery({
    queryKey: ["tournaments", tournamentId, "points-table"],
    queryFn: () => tournamentsApi.getPointsTable(tournamentId),
    enabled: !!tournamentId,
  });
}
