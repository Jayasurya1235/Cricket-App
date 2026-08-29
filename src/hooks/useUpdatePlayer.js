import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => playersApi.update({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}
