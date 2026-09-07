import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '../api/matches'

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.list(),
  })
}