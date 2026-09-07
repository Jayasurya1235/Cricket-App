import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '../api/matches'

export function useMatch(matchId) {
  return useQuery({
    queryKey: ['matches', matchId],
    queryFn: () => matchesApi.getById(matchId),
    enabled: !!matchId,
  })
}