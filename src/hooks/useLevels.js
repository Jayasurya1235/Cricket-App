import { useQuery } from "@tanstack/react-query";
import { levelsApi } from "../api/levels";

export function useLevels() {
  return useQuery({
    queryKey: ["team-levels"],
    queryFn: () => levelsApi.list(),
    staleTime: 1000 * 60 * 60,
  });
}
