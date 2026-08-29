import { useQuery } from '@tanstack/react-query'
import { matchesMockApi } from '../api/matchesMock'

export function useMatch(matchId) {
  return useQuery({
    queryKey: ['matches', matchId],
    queryFn: () => matchesMockApi.getById(matchId),
    enabled: !!matchId,
  })
}