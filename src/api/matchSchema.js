// Reference shape for a Match object (plain JS has no enforced types,
// this is just documentation so we stay consistent across files).
//
// Verified against the backend OpenAPI spec at
// https://cricketapp.in/openapi.json — schemas MatchCreate / MatchResponse.
//
// Required for create: match_date, match_time, venue, match_type,
//   team_a_id, team_b_id, toss_winner_id, toss_decision.
// Optional (nullable): result, referee_1_name, referee_2_name, match_referee_name.
// MatchResponse additionally returns: id, status, current_innings_number,
// team_a, team_b, toss_winner
//   (each is a { id, name, short_name } MatchTeamInfo object).

export const emptyMatchForm = {
  match_type: '',       // "Test" | "ODI" | "T20"
  venue: '',
  match_date: '',        // "YYYY-MM-DD"
  match_time: '',        // "HH:MM"
  team_a_id: '',         // team id
  team_b_id: '',         // team id
  toss_winner_id: '',    // team id (team_a_id or team_b_id)
  toss_decision: '',     // toss decision, see TOSS_DECISIONS in AddMatchPage
  result: '',            // free text, e.g. "India won by 6 wickets"
  referee_1_name: '',    // umpire 1
  referee_2_name: '',    // umpire 2
  match_referee_name: '', // match referee
}

// Derives a displayable status from the backend response.
//
// MatchResponse DOES include a `status` string plus `current_innings_number`.
// The spec types `status` as an unconstrained string, so the exact casing the
// server uses isn't guaranteed; every consumer in this app compares against
// PascalCase literals ("Live", "Completed", ...). Normalise here once so a
// lowercase or snake_case value from the server still renders the right badge
// and keeps the live/result branches working.
const STATUS_FALLBACKS = {
  upcoming: "Upcoming",
  scheduled: "Scheduled",
  live: "Live",
  in_progress: "Live",
  inprogress: "Live",
  running: "Live",
  completed: "Completed",
  complete: "Completed",
  finished: "Completed",
  abandoned: "Abandoned",
  cancelled: "Abandoned",
  canceled: "Abandoned",
  no_result: "Abandoned",
};

function normaliseStatus(raw) {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!key) return null;
  return STATUS_FALLBACKS[key] ?? null;
}

export function getMatchStatus(match) {
  const fromServer = normaliseStatus(match?.status);
  if (fromServer) return fromServer;

  // Fall back to what we can infer. A recorded result means the match is done.
  if (match?.result) return "Completed";
  return "Scheduled";
}