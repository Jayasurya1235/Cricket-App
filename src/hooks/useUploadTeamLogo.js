import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamsApi } from "../api/teams";

// POST /teams/{team_id}/upload-logo is a separate endpoint from the
// create/update call, so it needs its own mutation to refresh the team
// queries after it completes. Calling teamsApi.uploadLogo directly left the
// cached team (and therefore the logo shown after redirect) stale.

// 200 from the endpoint is TeamLogoResponse: { team_id, logo }.
// `["teams"]` holds an array (GET /teams) while `["teams", id]` holds a
// single record (GET /teams/{id}), so the updater has to cope with both.
function withLogo(data, teamId, logo) {
  const id = String(teamId);
  if (Array.isArray(data)) {
    return data.map((team) =>
      String(team?.id) === id ? { ...team, logo } : team,
    );
  }
  if (data && String(data.id) === id) return { ...data, logo };
  return data;
}

export function useUploadTeamLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }) => teamsApi.uploadLogo(id, file),
    onSuccess: (result, variables) => {
      const logo = result?.logo;
      const teamId = result?.team_id ?? variables.id;

      // Write the returned path straight into every cached team record so the
      // crest swaps the moment the upload finishes, without waiting on a
      // refetch (which may be slow or may fail while the UI already has the
      // answer).
      if (logo) {
        queryClient.setQueriesData({ queryKey: ["teams"] }, (data) =>
          data ? withLogo(data, teamId, logo) : data,
        );
      }

      // Still invalidate: the backend may normalize the stored path, and the
      // list carries counters the upload does not touch.
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
