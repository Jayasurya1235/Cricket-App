import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playerId) => playersApi.remove(playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}
