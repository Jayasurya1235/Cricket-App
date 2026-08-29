import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function useUpdatePlayerTeamRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playerId, teamId, role }) =>
      playersApi.updatePlayerTeamRole(playerId, teamId, role),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["players", variables.playerId],
      });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
