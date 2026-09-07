import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesApi } from "../api/matches";

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => matchesApi.update({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}