// Pure helpers for the scoring UI.
//
// IMPORTANT — why this file exists at all:
// The backend exposes NO ball-by-ball history. ScorecardResponse has no
// `deliveries` array and there is no GET endpoint for deliveries, so the only
// server state available is the cumulative ScorecardResponse. The "Recent
// Balls" strip is therefore a *presentation log* assembled from the deliveries
// this client actually submitted, annotated with whether the SERVER counted
// each one as a legal ball.
//
// Nothing here recomputes score, wickets, overs or extras. Every number shown
// in the score header comes straight from the server. This module only answers
// two presentational questions:
//   1. Did the server count this delivery as legal?  (legality came from the
//      server's own over notation, never from a client-side re-implementation)
//   2. Which over does this delivery belong to, for grouping/separators?

export const BALLS_PER_OVER = 6;

// Extras that are NOT legal deliveries. A wide or a no-ball does not count
// towards the six legal balls of an over.
export const NON_LEGAL_EXTRAS = new Set(["wide", "no_ball"]);

export const EXTRA_STYLES = {
  wide: "wd",
  no_ball: "nb",
  bye: "b",
  leg_bye: "lb",
};

/**
 * Parse cricket over notation into completed overs and balls in the current
 * over. Tolerates "1.4", "1.4 ov", "12.3", or a raw number (1.4 / 12).
 * Returns null when the value carries no usable information.
 */
export function parseOvers(value) {
  if (value == null) return null;

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    const completed = Math.floor(value + 1e-9);
    let balls = Math.round((value - completed) * 10);
    if (balls >= BALLS_PER_OVER) return { overs: completed + 1, balls: 0 };
    return { overs: completed, balls };
  }

  const match = String(value).match(/(\d+)\s*(?:\.(\d+))?/);
  if (!match) return null;

  const overs = Number(match[1]) || 0;
  const rawBalls = match[2] == null ? 0 : Number(match[2]);
  if (!Number.isFinite(rawBalls)) return { overs, balls: 0 };

  // A normalised backend never reports 6 balls, but guard anyway so a
  // "1.6" style value can never produce an impossible 7-ball over.
  if (rawBalls >= BALLS_PER_OVER) return { overs: overs + 1, balls: 0 };
  return { overs, balls: rawBalls };
}

/**
 * Completed overs and balls bowled in the in-progress over, derived from the
 * server's own notation.
 */
export function overState(scorecard) {
  const parsed = parseOvers(scorecard?.overs_bowled_str ?? scorecard?.overs_bowled);
  const overs = parsed ? parsed.overs : 0;
  const balls = parsed ? parsed.balls : 0;
  return { completedOvers: overs, ballsInOver: balls };
}

/**
 * Total legal deliveries bowled in the innings. Monotonic, so the difference
 * between two scorecards tells us whether a delivery was legal.
 */
export function totalLegalBalls(scorecard) {
  if (!scorecard) return 0;

  const parsed = parseOvers(scorecard.overs_bowled_str);
  if (parsed) return parsed.overs * BALLS_PER_OVER + parsed.balls;

  if (Number.isFinite(Number(scorecard.overs_bowled))) {
    const { completedOvers, ballsInOver } = overState(scorecard);
    return completedOvers * BALLS_PER_OVER + ballsInOver;
  }

  return Number(scorecard.legal_balls) || 0;
}

/**
 * Did the server count the delivery we just submitted as a legal ball?
 *
 * Primary signal is the movement of the server's own over notation, which is
 * monotonic and therefore safe even when `legal_balls` happens to be scoped to
 * the current over. We corroborate with the bowler's own legal-ball tally and
 * only fall back to the submitted extra type as a last resort.
 */
export function deliveryWasLegal(prev, next, { bowlerId, extraType } = {}) {
  const before = totalLegalBalls(prev);
  const after = totalLegalBalls(next);
  if (after !== before) return after > before;

  if (bowlerId != null) {
    const prevBalls =
      prev?.bowlers?.find((b) => b.player_id === bowlerId)?.balls_bowled ?? 0;
    const nextBalls =
      next?.bowlers?.find((b) => b.player_id === bowlerId)?.balls_bowled ?? 0;
    if (nextBalls !== prevBalls) return nextBalls > prevBalls;
  }

  if (extraType != null) return !NON_LEGAL_EXTRAS.has(extraType);
  return true;
}

/**
 * True when the previous over is complete and a new bowler must be chosen.
 * Derived from the server: once at least one ball has been bowled and the
 * in-progress over has zero balls on it, the next delivery opens a new over.
 */
export function needsNewBowler(scorecard) {
  if (!scorecard) return false;
  if (Number(scorecard.overs_bowled ?? 0) <= 0) return false;
  return overState(scorecard).ballsInOver === 0;
}

/** The bowler who bowled the previous over — may not bowl the next one. */
export function ineligibleBowlerId(scorecard) {
  if (!needsNewBowler(scorecard)) return null;
  return scorecard.last_over_bowler_id ?? null;
}

/**
 * Build the display descriptor for one delivery from the payload we submitted,
 * annotated with the server's own legality decision.
 */
export function describeDelivery(payload = {}, { isLegal, bowlerId, strikerId, id } = {}) {
  const extraType = payload.extra_type || "none";
  const runsBatsman = Number(payload.runs_batsman) || 0;
  const runsExtras = Number(payload.runs_extras) || 0;
  const totalRuns = runsBatsman + runsExtras;
  const isWicket = Boolean(payload.wicket_type);

  let label;
  let style;

  if (isWicket) {
    label = "W";
    style = "W";
  } else if (extraType === "wide") {
    // Wide + N total runs -> "W+N" (a bare wide is 1 run -> "W+1")
    label = `W+${totalRuns}`;
    style = EXTRA_STYLES.wide;
  } else if (extraType === "no_ball") {
    // No ball + N total runs (1 penalty + runs off the bat) -> "N+N"
    label = `N+${totalRuns}`;
    style = EXTRA_STYLES.no_ball;
  } else if (extraType === "bye" || extraType === "leg_bye") {
    label = extraType === "bye" ? "B" : "LB";
    style = EXTRA_STYLES[extraType];
  } else {
    label = String(runsBatsman);
    style = String(runsBatsman);
  }

  return {
    id,
    label,
    style,
    isLegal: Boolean(isLegal),
    runs: totalRuns,
    isWicket,
    wicketType: payload.wicket_type || null,
    dismissedPlayerId: payload.dismissed_player_id ?? null,
    extraType,
    bowlerId: bowlerId ?? null,
    strikerId: strikerId ?? null,
  };
}

/**
 * Split the delivery log into over groups for display. A group closes as soon
 * as it holds six legal deliveries, so any following extra correctly belongs to
 * the next over.
 */
export function groupByOver(entries = []) {
  const groups = [];
  let current = null;

  for (const entry of entries) {
    if (!current) {
      current = { overNumber: groups.length + 1, balls: [], legalCount: 0 };
      groups.push(current);
    }
    current.balls.push(entry);
    if (entry.isLegal) current.legalCount += 1;
    if (current.legalCount >= BALLS_PER_OVER) current = null;
  }

  return groups;
}

/** Players eligible to walk in as the next batsman after a wicket. */
export function eligibleNextBatsmen(scorecard, { roster } = {}) {
  if (!scorecard) return [];

  const atCrease = new Set(
    [scorecard.striker_id, scorecard.non_striker_id].filter((id) => id != null),
  );
  const inInnings = new Set();
  const regular = [];

  for (const b of scorecard.batsmen || []) {
    inInnings.add(b.player_id);
    if (b.out || atCrease.has(b.player_id)) continue;
    regular.push({
      playerId: b.player_id,
      position: b.position ?? 999,
      isSubstitute: false,
    });
  }

  regular.sort((a, b) => a.position - b.position || a.playerId - b.playerId);

  // Players on the batting side who are not part of this innings at all can be
  // brought in as substitutes (the batting-order endpoint exists for this).
  // Only label them "substitute" when the innings really does carry the whole
  // batting order — i.e. it still contains players who have not yet batted.
  // Otherwise the server is simply listing the players who have come in so far,
  // and the remaining batters are regular, not substitutes.
  const orderIsComplete = (scorecard.batsmen || []).some((b) => b.did_not_bat);
  const substitutes = (roster || [])
    .filter((p) => !inInnings.has(p.id) && !atCrease.has(p.id))
    .map((p) => ({
      playerId: p.id,
      position: 999,
      isSubstitute: orderIsComplete,
    }));

  const extras = orderIsComplete ? substitutes : substitutes.map((s) => ({ ...s, isSubstitute: false, position: 500 }));
  return [...regular, ...extras];
}

/**
 * The full batting order as display choices, including the players who can no
 * longer be picked. The picker shows every selected batter so the user can see
 * the whole eleven at a glance, but flags the ones the server will reject
 * (dismissed, or already at the crease) and leaves them unselectable.
 */
export function nextBatsmanChoices(scorecard, { roster } = {}) {
  if (!scorecard) return [];

  const atCrease = new Set(
    [scorecard.striker_id, scorecard.non_striker_id].filter((id) => id != null),
  );
  const inInnings = new Set();
  const choices = [];
  // Once the innings is over nobody can come in, whatever the flags say.
  const inningsOver = Boolean(scorecard.completed);

  for (const b of scorecard.batsmen || []) {
    inInnings.add(b.player_id);
    let status;
    let selectable;
    if (b.out) {
      status = "Out";
      selectable = false;
    } else if (atCrease.has(b.player_id)) {
      status = "At the crease";
      selectable = false;
    } else if (b.did_not_bat) {
      status = "Yet to bat";
      selectable = true;
    } else {
      status = "Not out";
      selectable = true;
    }
    if (inningsOver) {
      status = "Innings over";
      selectable = false;
    }
    choices.push({
      playerId: b.player_id,
      position: b.position ?? 999,
      isSubstitute: false,
      status,
      selectable,
    });
  }

  choices.sort((a, b) => a.position - b.position || a.playerId - b.playerId);

  const orderIsComplete = (scorecard.batsmen || []).some((b) => b.did_not_bat);
  for (const p of roster || []) {
    if (inInnings.has(p.id) || atCrease.has(p.id)) continue;
    choices.push({
      playerId: p.id,
      position: 999,
      isSubstitute: orderIsComplete,
      status: inningsOver
        ? "Innings over"
        : orderIsComplete
          ? "Substitute"
          : "Yet to bat",
      selectable: !inningsOver,
    });
  }

  return choices;
}

/**
 * Is the innings waiting for the scorer to bring in the next batsman?
 *
 * The server marks this explicitly with `awaiting_batsman` (ScorecardResponse).
 * Older payloads may not carry the flag, so fall back to the striker being
 * empty, which is what the server used to signal it previously.
 */
export function isAwaitingBatsman(scorecard) {
  if (!scorecard) return false;
  if (typeof scorecard.awaiting_batsman === "boolean") {
    return scorecard.awaiting_batsman;
  }
  return scorecard.striker_id == null;
}

export function displayName(nameMap, id) {
  const p = nameMap?.[id];
  if (!p) return `Player #${id}`;
  return `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Player #${id}`;
}
