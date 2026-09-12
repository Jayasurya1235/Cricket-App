import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scoringApi } from "../api/scoring";

const SCORING_KEY = "scoring";

export function useScoringState(matchId) {
  return useQuery({
    queryKey: [SCORING_KEY, matchId],
    queryFn: () => scoringApi.getMatchState(matchId),
    enabled: !!matchId,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

export function useRecordDelivery(matchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => scoringApi.recordDelivery(matchId, data),
    onSuccess: (data) => {
      queryClient.setQueryData([SCORING_KEY, matchId], data);
    },
  });
}

export function useRecordWicket(matchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => scoringApi.recordWicket(matchId, data),
    onSuccess: (data) => {
      queryClient.setQueryData([SCORING_KEY, matchId], data);
    },
  });
}

export function useSwapStriker(matchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scoringApi.swapStriker(matchId),
    onSuccess: (data) => {
      queryClient.setQueryData([SCORING_KEY, matchId], data);
    },
  });
}

export function useUndo(matchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scoringApi.undo(matchId),
    onSuccess: (data) => {
      queryClient.setQueryData([SCORING_KEY, matchId], data);
    },
  });
}

export function useEndOver(matchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scoringApi.endOver(matchId),
    onSuccess: (data) => {
      queryClient.setQueryData([SCORING_KEY, matchId], data);
    },
  });
}

export function useInitializeMatch(matchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scoringApi.initializeMatch(matchId),
    onSuccess: (data) => {
      queryClient.setQueryData([SCORING_KEY, matchId], data);
    },
  });
}
