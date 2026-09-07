// Reference shape for a Match object (plain JS has no enforced types,
// this is just documentation so we stay consistent across files).
//
// Verified against the backend OpenAPI spec at
// https://cricketapp.in/openapi.json — schemas MatchCreate / MatchResponse.
//
// Required for create: match_date, match_time, venue, match_type,
//   team_a_id, team_b_id, toss_winner_id, toss_decision.
// Optional (nullable): result, referee_1_name, referee_2_name, match_referee_name.
// MatchResponse additionally returns: id, team_a, team_b, toss_winner
//   (each is a { id, name, short_name } MatchTeamInfo object).

export const emptyMatchForm = {
  match_type: '',       // "Test" | "ODI" | "T20"
  venue: '',
  match_date: '',        // "YYYY-MM-DD"
  match_time: '',        // "HH:MM"
  team_a_id: '',         // team id
  team_b_id: '',         // team id
  toss_winner_id: '',    // team id (team_a_id or team_b_id)
  toss_decision: '',     // "Bat" | "Bowl"
  result: '',            // free text, e.g. "India won by 6 wickets"
  referee_1_name: '',    // umpire 1
  referee_2_name: '',    // umpire 2
  match_referee_name: '', // match referee
}

// Derives a displayable status. The backend response currently has no
// "status" field (it will likely arrive in a future API update), so we
// fall back to a sensible label.
export function getMatchStatus(match) {
  if (match?.status) return match.status;
  if (match?.result) return "Completed";
  return "Scheduled";
}