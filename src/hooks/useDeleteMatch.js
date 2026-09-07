import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi } from "../api/matches";

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => matchesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}