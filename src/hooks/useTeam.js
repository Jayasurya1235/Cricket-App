import { useQuery } from '@tanstack/react-query'
import { teamsApi } from '../api/teams'

export function useTeam(teamId) {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => teamsApi.getById(teamId),
    enabled: !!teamId,
  })
}