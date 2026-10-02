import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

// POST /teams/{team_id}/upload-logo is a separate endpoint from the
// create/update call, so it needs its own mutation to invalidate the team
// queries after it completes. Calling teamsApi.uploadLogo directly left the
// cached team (and therefore the logo shown after redirect) stale.
export function useUploadTeamLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }) => teamsApi.uploadLogo(id, file),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["teams", variables.id] });
    },
  });
}
