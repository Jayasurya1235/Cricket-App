import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teamsApi } from '../api/teams'

export function useAddPlayerToTeam(teamId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => teamsApi.addPlayer(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}