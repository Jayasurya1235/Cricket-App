import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => teamsApi.update(id, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.id] });
    },
  });
}
