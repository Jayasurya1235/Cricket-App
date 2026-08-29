import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamsApi } from '../api/teams'

export function useAddPlayerToTeam(teamId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => teamsApi.addPlayer(teamId, data),
    onSuccess: () => {
      // Refresh this specific team's data so the new player shows up in the squad
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
    },
  })
}