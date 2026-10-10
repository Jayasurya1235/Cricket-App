import { useQuery } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

export function useHeadToHead(teamId, opponentId, { recent, top } = {}) {
  return useQuery({
    queryKey: [
      "teams",
      teamId,
      "head-to-head",
      opponentId,
      recent ?? "default",
      top ?? "default",
    ],
    queryFn: () => teamsApi.getHeadToHead(teamId, opponentId, { recent, top }),
    enabled: !!teamId && !!opponentId,
  });
}
