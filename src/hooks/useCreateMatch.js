import { useMutation, useQueryClient } from "@tanstack/react-query";
import { matchesMockApi } from "../api/matchesMock";

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => matchesMockApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
