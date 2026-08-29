import { useQuery } from '@tanstack/react-query'
import { matchesMockApi } from '../api/matchesMock'

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesMockApi.list(),
  })
}