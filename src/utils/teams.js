// The match payload embeds team_a / team_b / toss_winner as MatchTeamInfo —
// { id, name, short_name } only (see src/api/matchSchema.js) — while
// GET /teams and GET /teams/{id} return the full record that carries `logo`.
// Views built from a match therefore have to join the two, otherwise the crest
// uploaded through POST /teams/{id}/upload-logo never shows on match screens.
import { resolveAssetUrl } from "./assetUrl";

// Overlays `embedded` on top of `full`, skipping keys the embedded copy does
// not carry so `logo` and the other detail-only fields survive.
export function mergeTeam(embedded, full) {
  if (!full) return embedded ?? null;
  if (!embedded) return full;
  const merged = { ...full };
  for (const [key, value] of Object.entries(embedded)) {
    if (value !== undefined) merged[key] = value;
  }
  return merged;
}

// match: the MatchResponse, embedded: match.team_a | match.team_b |
// match.toss_winner, teams: the GET /teams list, idKeys: every id field the
// payload might carry the team under (older payloads used team1_id/team2_id).
export function resolveMatchTeam(match, embedded, teams, ...idKeys) {
  const id =
    embedded?.id ??
    idKeys.map((key) => match?.[key]).find((value) => value != null);
  const full =
    id == null
      ? null
      : (teams?.find((team) => String(team.id) === String(id)) ?? null);
  return mergeTeam(embedded, full);
}

// Single place that decides what counts as a team logo, so a cleared (null)
// or empty logo falls back to the initials badge everywhere. The value is
// resolved the same way as any other upload, because the backend stores it as
// a root-relative path (see TeamLogoResponse).
export function teamLogo(team) {
  return resolveAssetUrl(team?.logo || team?.logo_url || null);
}
