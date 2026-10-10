// Rebuilds full batting and bowling cards for every innings of a match from
// the delivery log returned by GET /matches/{match_id}/analytics
// (MatchAnalyticsResponse).
//
// Why this exists: the scorecard endpoint (GET /matches/{id}/scorecard) only
// ever returns the CURRENT innings, so on its own it can only ever show one
// side. MatchAnalyticsResponse carries every delivery of every innings with
// the striker/bowler/dismissal ids and the running score, which is enough to
// reconstruct the full cards for BOTH teams — the data shown is still the
// backend's own, this module only aggregates it.

// Dismissals the bowler is credited with; run outs (and retirements) are not.
const BOWLER_CREDIT_WICKETS = new Set([
  "bowled",
  "caught",
  "lbw",
  "stumped",
  "hit_wicket",
  "caught_and_bowled",
  "caught_behind",
]);

// Byes and leg byes are not charged to the bowler, so they are excluded from
// runs conceded (but wides and no-balls are charged).
const BYE_EXTRAS = new Set(["bye", "leg_bye"]);

export function oversFromBalls(balls) {
  const total = Math.max(0, Number(balls) || 0);
  return `${Math.floor(total / 6)}.${total % 6}`;
}

function strikeRate(runs, balls) {
  const b = Number(balls) || 0;
  if (!b) return 0;
  return ((Number(runs) || 0) / b) * 100;
}

function joinName(first, last) {
  return `${first || ""} ${last || ""}`.trim();
}

// One innings -> { batting, bowling, fallOfWickets } derived from deliveries.
export function buildInningsCards(inning) {
  const deliveries = Array.isArray(inning?.deliveries) ? inning.deliveries : [];
  const batters = new Map();
  const bowlers = new Map();
  const fallOfWickets = [];
  let wicketCount = 0;

  for (const d of deliveries) {
    if (d.striker_id != null) {
      let batsman = batters.get(d.striker_id);
      if (!batsman) {
        batsman = {
          player_id: d.striker_id,
          name: d.striker_name || null,
          runs: 0,
          balls_faced: 0,
          fours: 0,
          sixes: 0,
          out: false,
          dismissal: null,
          did_not_bat: false,
        };
        batters.set(d.striker_id, batsman);
      }
      batsman.runs += Number(d.runs_batsman) || 0;
      // A wide is not a ball faced; a no-ball is.
      if (d.extra_type !== "wide") batsman.balls_faced += 1;
      if (d.is_four) batsman.fours += 1;
      if (d.is_six) batsman.sixes += 1;
      if (d.wicket_type && d.dismissed_player_id === d.striker_id) {
        batsman.out = true;
        batsman.dismissal = d.wicket_type;
      }
    }

    if (d.bowler_id != null) {
      let bowler = bowlers.get(d.bowler_id);
      if (!bowler) {
        bowler = {
          player_id: d.bowler_id,
          name: d.bowler_name || null,
          balls_bowled: 0,
          maidens: 0,
          runs_conceded: 0,
          wickets: 0,
          fours: 0,
          sixes: 0,
          wides: 0,
          no_balls: 0,
        };
        bowlers.set(d.bowler_id, bowler);
      }
      if (d.is_legal_ball) bowler.balls_bowled += 1;
      if (!BYE_EXTRAS.has(d.extra_type)) {
        bowler.runs_conceded += Number(d.total_runs) || 0;
      }
      if (
        d.wicket_type &&
        BOWLER_CREDIT_WICKETS.has(d.wicket_type) &&
        d.dismissed_player_id != null
      ) {
        bowler.wickets += 1;
      }
      if (d.is_four) bowler.fours += 1;
      if (d.is_six) bowler.sixes += 1;
      if (d.extra_type === "wide") bowler.wides += 1;
      if (d.extra_type === "no_ball") bowler.no_balls += 1;
    }

    if (d.wicket_type && d.dismissed_player_id != null) {
      wicketCount += 1;
      fallOfWickets.push({
        wicket_number: wicketCount,
        score: Number(d.team_total) || 0,
        player_id: d.dismissed_player_id,
        name: d.dismissed_player_name || null,
        overs_str: `${d.over_number}.${d.ball_number}`,
      });
    }
  }

  // A maiden is a completed (6 legal ball) over that conceded nothing the
  // bowler is charged for.
  const overRuns = new Map();
  const overBowler = new Map();
  const overLegalBalls = new Map();
  for (const d of deliveries) {
    const key = d.over_number;
    if (d.bowler_id != null && !overBowler.has(key)) {
      overBowler.set(key, d.bowler_id);
    }
    const charged = BYE_EXTRAS.has(d.extra_type) ? 0 : Number(d.total_runs) || 0;
    overRuns.set(key, (overRuns.get(key) || 0) + charged);
    if (d.is_legal_ball) {
      overLegalBalls.set(key, (overLegalBalls.get(key) || 0) + 1);
    }
  }
  for (const [key, runs] of overRuns.entries()) {
    if (runs === 0 && (overLegalBalls.get(key) || 0) >= 6) {
      const bowler = bowlers.get(overBowler.get(key));
      if (bowler) bowler.maidens += 1;
    }
  }

  const batting = [...batters.values()].map((b) => ({
    ...b,
    strike_rate: strikeRate(b.runs, b.balls_faced),
  }));

  const bowling = [...bowlers.values()].map((b) => ({
    ...b,
    overs: b.balls_bowled / 6,
    overs_str: oversFromBalls(b.balls_bowled),
    economy: b.balls_bowled ? b.runs_conceded / (b.balls_bowled / 6) : 0,
  }));

  return { batting, bowling, fallOfWickets };
}

// The authoritative ScorecardResponse (current innings) -> the same shape, so
// the latest innings can prefer the server's own card (which also carries the
// "did not bat" batters the delivery log cannot know about).
export function cardsFromScorecard(scorecard) {
  if (!scorecard) return null;

  const batting = (scorecard.batsmen || []).map((b) => ({
    player_id: b.player_id,
    name: joinName(b.first_name, b.last_name) || null,
    position: b.position,
    runs: b.runs,
    balls_faced: b.balls_faced,
    fours: b.fours,
    sixes: b.sixes,
    strike_rate: b.strike_rate,
    out: b.out,
    dismissal: b.dismissal,
    did_not_bat: b.did_not_bat,
  }));

  const bowling = (scorecard.bowlers || []).map((b) => ({
    player_id: b.player_id,
    name: joinName(b.first_name, b.last_name) || null,
    balls_bowled: b.balls_bowled,
    overs: b.overs,
    overs_str: b.overs_str,
    maidens: b.maidens,
    runs_conceded: b.runs_conceded,
    wickets: b.wickets,
    economy: b.economy,
    fours: b.fours,
    sixes: b.sixes,
    wides: b.wides,
    no_balls: b.no_balls,
  }));

  const fallOfWickets = (scorecard.fall_of_wickets || []).map((f) => ({
    wicket_number: f.wicket_number,
    score: f.score,
    player_id: f.player_id,
    name: joinName(f.first_name, f.last_name) || null,
    overs_str: f.overs_str,
  }));

  return { batting, bowling, fallOfWickets };
}

export function extrasTotal(extras) {
  if (extras == null) return 0;
  if (typeof extras === "number") return extras;
  return Number(extras.total) || 0;
}

export function extrasBreakdown(extras) {
  if (extras && typeof extras === "object") return extras;
  return null;
}

// Joins the two innings sources into one ordered list. Analytics supplies both
// innings; the live scorecard overrides whichever innings it currently
// represents so the on-screen card matches the scorer's view exactly.
export function buildInningsModels(analytics, scorecard) {
  const models = (analytics?.innings ?? []).map((inning) => {
    const cards = buildInningsCards(inning);
    const isLiveInnings =
      scorecard != null &&
      Number(scorecard.innings_number) === Number(inning.innings_number);
    const authoritative = isLiveInnings ? cardsFromScorecard(scorecard) : null;
    return { ...inning, ...(authoritative ?? cards) };
  });

  models.sort((a, b) => (a.innings_number ?? 0) - (b.innings_number ?? 0));

  if (models.length === 0 && scorecard) {
    models.push({
      innings_number: scorecard.innings_number,
      batting_team_id: scorecard.batting_team_id,
      bowling_team_id: scorecard.bowling_team_id,
      total: scorecard.total,
      wickets: scorecard.wickets,
      overs_bowled: scorecard.overs_bowled,
      overs_bowled_str: scorecard.overs_bowled_str,
      run_rate: scorecard.current_run_rate,
      target: scorecard.target,
      completed: scorecard.completed,
      is_super_over: scorecard.is_super_over,
      extras: scorecard.extras,
      scoring_pattern: null,
      over_by_over: null,
      run_rate_progression: null,
      ...cardsFromScorecard(scorecard),
    });
  }

  return models;
}

// Per-player match totals across every innings, for the players table.
export function aggregatePlayerStats(inningsModels) {
  const players = new Map();

  function ensure(playerId, name, teamId) {
    let player = players.get(playerId);
    if (!player) {
      player = {
        player_id: playerId,
        name: name || null,
        team_id: teamId ?? null,
        batting: {
          innings: 0,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          outs: 0,
          not_outs: 0,
          highest: 0,
        },
        bowling: {
          innings: 0,
          balls: 0,
          runs: 0,
          wickets: 0,
          maidens: 0,
          best_wickets: 0,
          best_runs: null,
        },
      };
      players.set(playerId, player);
    }
    if (!player.name && name) player.name = name;
    if (player.team_id == null && teamId != null) player.team_id = teamId;
    return player;
  }

  for (const inning of inningsModels) {
    for (const b of inning.batting || []) {
      if (b.did_not_bat) continue;
      const player = ensure(b.player_id, b.name, inning.batting_team_id);
      const runs = Number(b.runs) || 0;
      player.batting.innings += 1;
      player.batting.runs += runs;
      player.batting.balls += Number(b.balls_faced) || 0;
      player.batting.fours += Number(b.fours) || 0;
      player.batting.sixes += Number(b.sixes) || 0;
      if (b.out) player.batting.outs += 1;
      else player.batting.not_outs += 1;
      if (runs > player.batting.highest) player.batting.highest = runs;
    }

    for (const b of inning.bowling || []) {
      const player = ensure(b.player_id, b.name, inning.bowling_team_id);
      const wickets = Number(b.wickets) || 0;
      const conceded = Number(b.runs_conceded) || 0;
      player.bowling.innings += 1;
      player.bowling.balls += Number(b.balls_bowled) || 0;
      player.bowling.runs += conceded;
      player.bowling.wickets += wickets;
      player.bowling.maidens += Number(b.maidens) || 0;
      if (
        wickets > player.bowling.best_wickets ||
        (wickets === player.bowling.best_wickets &&
          (player.bowling.best_runs == null ||
            conceded < player.bowling.best_runs))
      ) {
        player.bowling.best_wickets = wickets;
        player.bowling.best_runs = conceded;
      }
    }
  }

  return [...players.values()].map((player) => {
    const bat = player.batting;
    const bowl = player.bowling;
    const hasBatted = bat.innings > 0;
    const hasBowled = bowl.innings > 0;
    return {
      ...player,
      batting: {
        ...bat,
        strike_rate: bat.balls ? (bat.runs / bat.balls) * 100 : 0,
        average: bat.outs ? bat.runs / bat.outs : null,
      },
      bowling: {
        ...bowl,
        overs: bowl.balls / 6,
        overs_str: oversFromBalls(bowl.balls),
        economy: bowl.balls ? bowl.runs / (bowl.balls / 6) : 0,
        best_display: hasBowled
          ? `${bowl.best_wickets}/${bowl.best_runs ?? 0}`
          : null,
      },
      has_batted: hasBatted,
      has_bowled: hasBowled,
    };
  });
}
