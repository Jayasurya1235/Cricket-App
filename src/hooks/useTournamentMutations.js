import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentsApi } from "../api/tournaments";

// Every tournament/fixture/team membership mutation lives here. They all
// invalidate the ["tournaments"] key tree so the detail page (meta, teams,
// fixtures, points table, leaderboards) refreshes after any change.

function invalidateTournament(queryClient, tournamentId) {
  queryClient.invalidateQueries({ queryKey: ["tournaments"] });
  if (tournamentId != null) {
    queryClient.invalidateQueries({ queryKey: ["tournaments", tournamentId] });
  }
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => tournamentsApi.create(data),
    onSuccess: () => invalidateTournament(queryClient),
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tournamentsApi.update({ id, data }),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.id),
  });
}

export function useDeleteTournament() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => tournamentsApi.remove(id),
    onSuccess: () => invalidateTournament(queryClient),
  });
}

export function useAddTournamentTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, teamId }) =>
      tournamentsApi.addTeam(tournamentId, teamId),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}

export function useRemoveTournamentTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, teamId }) =>
      tournamentsApi.removeTeam(tournamentId, teamId),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}

export function useCreateFixture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, data }) =>
      tournamentsApi.createFixture(tournamentId, data),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}

export function useGenerateFixtures() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, legs, replace }) =>
      tournamentsApi.generateFixtures(tournamentId, { legs, replace }),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}

export function useGenerateKnockout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, teams }) =>
      tournamentsApi.generateKnockout(tournamentId, { teams }),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}

export function useUpdateFixture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, fixtureId, data }) =>
      tournamentsApi.updateFixture(tournamentId, fixtureId, data),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}

export function useDeleteFixture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, fixtureId }) =>
      tournamentsApi.deleteFixture(tournamentId, fixtureId),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}

export function useSetFixtureResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tournamentId, fixtureId, matchId }) =>
      tournamentsApi.setFixtureResult(tournamentId, fixtureId, matchId),
    onSuccess: (_data, variables) =>
      invalidateTournament(queryClient, variables.tournamentId),
  });
}
