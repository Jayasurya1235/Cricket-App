// Formatting helpers shared by the analytics screens. Every value comes from
// the backend response; these only decide how to render nulls and decimals.

export function formatStat(value, digits = 2) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "—";
    return Number.isInteger(value) ? String(value) : value.toFixed(digits);
  }
  return String(value);
}

// Builds a display name from any of the player-shaped payloads the analytics
// endpoints return (PlayerSummary, TeamTopRunScorer, HeadToHeadBattingPerformance).
export function fullName(player) {
  if (!player) return "";
  const parts = `${player.first_name ?? ""} ${player.last_name ?? ""}`.trim();
  if (parts) return parts;
  if (player.full_name) return player.full_name;
  if (player.name) return player.name;
  if (player.player_id != null) return `Player #${player.player_id}`;
  return "";
}

export function formatOvers(oversStr, overs) {
  if (oversStr) return `${oversStr} ov`;
  if (overs != null) return `${overs} ov`;
  return "—";
}

export default formatStat;
