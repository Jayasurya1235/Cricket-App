import { useQueries } from "@tanstack/react-query";
import { scoringApi } from "../api/scoring";
import { getMatchStatus } from "../api/matchSchema";

// The matches list endpoint (GET /matches) returns MatchResponse, which carries
// the fixture metadata plus a free-text `result` string. It does NOT carry
// scores, overs or wickets - those only exist on ScorecardResponse, and the
// scoring API exposes exactly one scorecard endpoint, which reports a single
// (the current) innings of a match.
//
// So a finished match card can only show real numbers if it asks for that
// scorecard. This fetches one per finished match and nothing for the rest:
// scheduled matches have no innings yet (that endpoint 404s, which
// scoringApi.getScorecard already normalises to null) and live matches are
// already covered by their own scoring screen.
//
// Status is read through the app's existing getMatchStatus() helper rather than
// re-deriving the mapping, so this stays in step with the badges on the cards.
const FINISHED_STATUSES = new Set(["Completed", "Abandoned"]);

export function useFinishedMatchScorecards(matches) {
  const finishedIds = (matches ?? [])
    .filter((match) => FINISHED_STATUSES.has(getMatchStatus(match)))
    .map((match) => match.id);

  const results = useQueries({
    queries: finishedIds.map((id) => ({
      queryKey: ["scoring", id],
      queryFn: () => scoringApi.getScorecard(id),
      enabled: !!id,
      staleTime: 60_000,
      retry: false,
    })),
  });

  const scorecards = {};
  results.forEach((result, index) => {
    if (result.data) scorecards[finishedIds[index]] = result.data;
  });

  return scorecards;
}