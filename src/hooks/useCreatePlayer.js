import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playersApi } from "../api/players";

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => playersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}
