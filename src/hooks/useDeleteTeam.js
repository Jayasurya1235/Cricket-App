import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId) => teamsApi.remove(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
