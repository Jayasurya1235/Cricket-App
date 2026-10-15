import { useQuery } from "@tanstack/react-query";
import { tournamentsApi } from "../api/tournaments";

export function useTournaments(skip = 0, limit = 100) {
  return useQuery({
    queryKey: ["tournaments", skip, limit],
    queryFn: () => tournamentsApi.list(skip, limit),
  });
}
