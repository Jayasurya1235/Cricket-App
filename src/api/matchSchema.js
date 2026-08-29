// Reference shape for a Match object (plain JS has no enforced types,
// this is just documentation so we stay consistent across files)

export const emptyMatchForm = {
  match_type: '',       // "Test" | "ODI" | "T20"
  venue: '',
  match_date: '',        // "YYYY-MM-DD"
  match_time: '',        // "HH:MM"
  team1_id: '',
  team2_id: '',
  toss_won_by: '',       // team_id
  toss_decision: '',     // "Bat" | "Bowl"
  toss_time: '',         // "HH:MM"
  referee: '',
  status: 'Upcoming',    // "Upcoming" | "Live" | "Completed"
  result: '',            // free text, e.g. "India won by 6 wickets"
  team1_playing_xi: [],  // array of player_id
  team2_playing_xi: [],  // array of player_id
}
