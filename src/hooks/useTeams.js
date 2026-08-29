import { useQuery } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => teamsApi.list(),
  });
}
