import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

export function useRemovePlayerFromTeam(teamId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId) => teamsApi.removePlayer(teamId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
