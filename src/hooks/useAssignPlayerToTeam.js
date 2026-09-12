import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function useAssignPlayerToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, team_id, level_id, role }) =>
      playersApi.assignToTeam(playerId, { team_id, level_id, role }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.team_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["players", variables.playerId, "teams"],
      });
    },
  });
}
