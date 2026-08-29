import { useQuery } from "@tanstack/react-query";
import { locationsApi } from "../api/locations";

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsApi.list(),
    staleTime: 1000 * 60 * 60, // 1 hour — country/state/city data barely changes, no need to refetch often
  });
}
