import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scoringApi } from "../api/scoring";

const SCORING_KEY = "scoring";

export function useScoringState(matchId) {
  return useQuery({
    queryKey: [SCORING_KEY, matchId],
    queryFn: () => scoringApi.getScorecard(matchId),
    enabled: !!matchId,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}

function useScorecardMutation(matchId, mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.setQueryData([SCORING_KEY, matchId], data);
    },
  });
}

export function useStartInnings(matchId) {
  return useScorecardMutation(matchId, (battingOrder) =>
    scoringApi.startInnings(matchId, battingOrder),
  );
}

export function useRecordDelivery(matchId) {
  return useScorecardMutation(matchId, (data) =>
    scoringApi.recordDelivery(matchId, data),
  );
}

export function useAddBatsman(matchId) {
  return useScorecardMutation(matchId, (playerId) =>
    scoringApi.addBatsman(matchId, playerId),
  );
}