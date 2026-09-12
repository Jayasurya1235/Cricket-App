// import { apiClient } from "./client";

// ============================================================
// SCORING API SERVICE
// ============================================================
// This service abstracts the backend score engine.
//
// When the backend scoring endpoints are ready:
//   1. Replace mock functions with real API calls below
//   2. Remove the MOCK section entirely
//   3. The hooks and components will work without changes
//
// Expected backend endpoints (to be confirmed with backend team):
//   GET  /matches/{id}/scoring/state       -> MatchState
//   POST /matches/{id}/scoring/delivery     -> MatchState
//   POST /matches/{id}/scoring/wicket       -> MatchState
//   POST /matches/{id}/scoring/swap-striker -> MatchState
//   POST /matches/{id}/scoring/undo         -> MatchState
//   POST /matches/{id}/scoring/end-over     -> MatchState
// ============================================================

// ============================================================
// MOCK DATA — Isolated here for easy removal when backend is ready
// ============================================================

function createInitialMockState(matchId) {
  return {
    match_id: Number(matchId) || 1,
    match_type: "T20",
    venue: "",
    match_date: "",
    status: "live",
    innings_number: 1,
    total_innings: 2,
    batting_team: {
      id: 0,
      name: "Batting Team",
      short_name: "BAT",
      logo_url: null,
    },
    bowling_team: {
      id: 0,
      name: "Bowling Team",
      short_name: "BOWL",
      logo_url: null,
    },
    score: { runs: 0, wickets: 0, balls: 0, extras: 0 },
    target: null,
    overs: { total: 20, current: 0, balls: 0 },
    run_rate: "0.00",
    required_run_rate: null,
    required_runs: null,
    balls_remaining: 120,
    match_context: "innings",
    batsmen: [],
    current_bowler: null,
    current_over: [],
    completed_overs: [],
    extras: { wides: 0, no_balls: 0, byes: 0, leg_byes: 0, penalty: 0 },
    fall_of_wickets: [],
    last_action_result: null,
    can_undo: false,
    history: [],
    innings_started: false,
  };
}

let mockState = null;

function deriveMatchState(state) {
  const legalBalls = state.current_over.filter(
    (b) => b.type !== "wide" && b.type !== "no_ball"
  ).length;

  const totalBallsInMatch = state.overs.current * 6 + legalBalls;
  const maxBalls = state.overs.total * 6;
  const ballsRemaining = maxBalls - totalBallsInMatch;

  const currentOverNumber = state.overs.current + 1;

  let derived = { ...state };

  if (state.match_context === "chase" && state.target) {
    derived.required_runs = state.target - state.score.runs;
    derived.balls_remaining = ballsRemaining;
    derived.required_run_rate =
      ballsRemaining > 0
        ? ((derived.required_runs / ballsRemaining) * 6).toFixed(2)
        : "999.99";
    derived.match_completed = derived.required_runs <= 0;
    derived.match_result =
      derived.required_runs <= 0
        ? `${state.batting_team.short_name} won!`
        : null;
  } else {
    derived.run_rate =
      totalBallsInMatch > 0
        ? ((state.score.runs / totalBallsInMatch) * 6).toFixed(2)
        : "0.00";
    derived.match_completed = ballsRemaining <= 0;
  }

  derived.current_over_number = currentOverNumber;
  derived.legal_balls_in_over = legalBalls;
  derived.total_balls_in_match = totalBallsInMatch;
  derived.balls_remaining = ballsRemaining;

  derived.innings_summary = {
    batting_team: state.batting_team,
    bowling_team: state.bowling_team,
    score: { ...state.score },
    run_rate: derived.run_rate || derived.required_run_rate,
    extras: { ...state.extras },
    fall_of_wickets: [...state.fall_of_wickets],
    top_batsman: [...state.batsmen].sort((a, b) => b.runs - a.runs)[0],
    top_bowler: state.current_bowler,
  };

  return derived;
}

// ============================================================
// MOCK API FUNCTIONS
// ============================================================

async function mockGetMatchState(matchId) {
  if (!mockState || mockState.match_id !== Number(matchId)) {
    mockState = createInitialMockState(matchId);
  }
  return deriveMatchState(mockState);
}

async function mockRecordDelivery(matchId, data) {
  if (!mockState || mockState.match_id !== Number(matchId)) {
    mockState = createInitialMockState(matchId);
  }

  if (mockState.batsmen.length < 2 || !mockState.current_bowler) {
    return deriveMatchState(mockState);
  }

  const prev = JSON.parse(JSON.stringify(mockState));
  mockState.history.push(prev);

  const striker = mockState.batsmen.find((b) => b.is_on_strike);
  const nonStriker = mockState.batsmen.find((b) => !b.is_on_strike);
  const bowler = mockState.current_bowler;

  const isExtra = data.extras_type === "wide" || data.extras_type === "no_ball";

  if (data.extras_type === "wide") {
    mockState.score.runs += 1 + (data.extra_runs || 0);
    mockState.score.extras += 1 + (data.extra_runs || 0);
    mockState.extras.wides += 1 + (data.extra_runs || 0);
    bowler.runs += 1 + (data.extra_runs || 0);
    mockState.current_over.push({
      ball: mockState.current_over.length + 1,
      runs: data.extra_runs || 0,
      type: "wide",
      extra_runs: 1 + (data.extra_runs || 0),
    });
  } else if (data.extras_type === "no_ball") {
    mockState.score.runs += 1 + (data.runs || 0);
    mockState.score.extras += 1 + (data.runs || 0);
    mockState.extras.no_balls += 1 + (data.runs || 0);
    bowler.runs += 1 + (data.runs || 0);
    if (data.runs) {
      striker.runs += data.runs;
      striker.balls += 0;
      if (data.runs === 4) striker.fours += 1;
      if (data.runs === 6) striker.sixes += 1;
    }
    mockState.current_over.push({
      ball: mockState.current_over.length + 1,
      runs: data.runs || 0,
      type: "no_ball",
      extra_runs: 1,
    });
  } else if (data.extras_type === "bye") {
    mockState.score.runs += data.runs;
    mockState.score.extras += data.runs;
    mockState.extras.byes += data.runs;
    bowler.runs += data.runs;
    striker.balls += 1;
    mockState.current_over.push({
      ball: mockState.current_over.length + 1,
      runs: data.runs,
      type: "bye",
    });
  } else if (data.extras_type === "leg_bye") {
    mockState.score.runs += data.runs;
    mockState.score.extras += data.runs;
    mockState.extras.leg_byes += data.runs;
    bowler.runs += data.runs;
    striker.balls += 1;
    mockState.current_over.push({
      ball: mockState.current_over.length + 1,
      runs: data.runs,
      type: "leg_bye",
    });
  } else {
    mockState.score.runs += data.runs;
    striker.runs += data.runs;
    striker.balls += 1;
    if (data.runs === 4) striker.fours += 1;
    if (data.runs === 6) striker.sixes += 1;
    bowler.runs += data.runs;
    mockState.current_over.push({
      ball: mockState.current_over.length + 1,
      runs: data.runs,
      type: "normal",
    });
  }

  if (!isExtra) {
    bowler.overs =
      Math.floor(bowler.balls / 6) + ((bowler.balls % 6) + 1 > 6 ? 1 : 0);
  }

  if (!isExtra && data.runs % 2 !== 0 && data.runs !== 0) {
    striker.is_on_strike = false;
    nonStriker.is_on_strike = true;
  }

  bowler.economy =
    bowler.overs > 0
      ? (bowler.runs / (Math.floor(bowler.overs) + (bowler.overs % 1) * 10 / 6)).toFixed(2)
      : "0.00";

  striker.strike_rate =
    striker.balls > 0
      ? ((striker.runs / striker.balls) * 100).toFixed(2)
      : "0.00";
  nonStriker.strike_rate =
    nonStriker.balls > 0
      ? ((nonStriker.runs / nonStriker.balls) * 100).toFixed(2)
      : "0.00";

  mockState.score.balls = mockState.score.balls + (isExtra ? 0 : 1);

  if (!isExtra) {
    bowler.balls = (bowler.balls || 0) + 1;
    const legalInOver = mockState.current_over.filter(
      (b) => b.type !== "wide" && b.type !== "no_ball"
    ).length;
    if (legalInOver >= 6) {
      mockState.completed_overs.push([...mockState.current_over]);
      mockState.current_over = [];
      mockState.overs.current += 1;
      mockState.overs.balls = 0;
      striker.is_on_strike = false;
      nonStriker.is_on_strike = true;
    } else {
      mockState.overs.balls = legalInOver;
    }
  }

  mockState.can_undo = true;
  mockState.last_action_result = {
    success: true,
    message: `${data.runs || 0} runs recorded`,
  };

  return deriveMatchState(mockState);
}

async function mockRecordWicket(matchId, data) {
  if (!mockState || mockState.match_id !== Number(matchId)) {
    mockState = createInitialMockState(matchId);
  }

  if (mockState.batsmen.length < 1 || !mockState.current_bowler) {
    return deriveMatchState(mockState);
  }

  const prev = JSON.parse(JSON.stringify(mockState));
  mockState.history.push(prev);

  const striker = mockState.batsmen.find((b) => b.is_on_strike);
  const bowler = mockState.current_bowler;

  mockState.score.wickets += 1;
  bowler.wickets += 1;

  mockState.fall_of_wickets.push({
    wicket: mockState.score.wickets,
    runs: mockState.score.runs,
    batsman: striker.name,
    over:
      mockState.overs.current +
      mockState.current_over.filter(
        (b) => b.type !== "wide" && b.type !== "no_ball"
      ).length /
        10,
  });

  mockState.current_over.push({
    ball: mockState.current_over.length + 1,
    runs: 0,
    type: "wicket",
    wicket_type: data.wicket_type || "bowled",
    is_wicket: true,
  });

  bowler.balls = (bowler.balls || 0) + 1;
  striker.balls += 1;

  const legalInOver = mockState.current_over.filter(
    (b) => b.type !== "wide" && b.type !== "no_ball"
  ).length;
  if (legalInOver >= 6) {
    mockState.completed_overs.push([...mockState.current_over]);
    mockState.current_over = [];
    mockState.overs.current += 1;
    mockState.overs.balls = 0;
  } else {
    mockState.overs.balls = legalInOver;
  }

  if (data.new_batsman_name) {
    const newBatsman = {
      player_id: data.new_batsman_id || 900 + Math.floor(Math.random() * 100),
      name: data.new_batsman_name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strike_rate: 0,
      is_on_strike: true,
      is_not_out: true,
    };
    mockState.batsmen = mockState.batsmen.map((b) => ({
      ...b,
      is_on_strike: false,
      is_not_out: b.is_on_strike ? false : b.is_not_out,
    }));
    mockState.batsmen.push(newBatsman);
  } else {
    striker.is_on_strike = false;
    striker.is_not_out = false;
    const nextBatsman = mockState.batsmen.find(
      (b) => b.is_not_out && !b.is_on_strike
    );
    if (nextBatsman) nextBatsman.is_on_strike = true;
  }

  bowler.economy =
    bowler.overs > 0
      ? (bowler.runs / (Math.floor(bowler.overs) + (bowler.overs % 1) * 10 / 6)).toFixed(2)
      : "0.00";

  mockState.score.balls = mockState.score.balls + 1;

  mockState.last_action_result = {
    success: true,
    message: `WICKET! ${striker.name} out (${data.wicket_type || "bowled"})`,
  };

  return deriveMatchState(mockState);
}

async function mockSwapStriker(matchId) {
  if (!mockState || mockState.match_id !== Number(matchId)) {
    mockState = createInitialMockState(matchId);
  }

  mockState.batsmen = mockState.batsmen.map((b) => ({
    ...b,
    is_on_strike: !b.is_on_strike,
  }));

  return deriveMatchState(mockState);
}

async function mockUndo(matchId) {
  if (!mockState || mockState.match_id !== Number(matchId)) {
    mockState = createInitialMockState(matchId);
  }

  if (mockState.history.length > 0) {
    mockState = mockState.history.pop();
    mockState.last_action_result = {
      success: true,
      message: "Last action undone",
    };
    mockState.can_undo = mockState.history.length > 0;
  } else {
    mockState.last_action_result = {
      success: false,
      message: "Nothing to undo",
    };
  }

  return deriveMatchState(mockState);
}

async function mockEndOver(matchId) {
  if (!mockState || mockState.match_id !== Number(matchId)) {
    mockState = createInitialMockState(matchId);
  }

  const prev = JSON.parse(JSON.stringify(mockState));
  mockState.history.push(prev);

  if (mockState.current_over.length > 0) {
    mockState.completed_overs.push([...mockState.current_over]);
    mockState.current_over = [];
    mockState.overs.current += 1;
    mockState.overs.balls = 0;

    mockState.batsmen = mockState.batsmen.map((b) => ({
      ...b,
      is_on_strike: !b.is_on_strike,
    }));

    mockState.last_action_result = {
      success: true,
      message: `Over ${mockState.overs.current} completed`,
    };
  }

  return deriveMatchState(mockState);
}

async function mockInitializeMatch(matchId) {
  mockState = createInitialMockState(matchId);
  return deriveMatchState(mockState);
}

// ============================================================
// PUBLIC API — Replace mock calls with real API calls below
// ============================================================

export const scoringApi = {
  getMatchState: async (matchId) => {
    // TODO: Replace with real API call
    // const res = await apiClient.get(`/matches/${matchId}/scoring/state`);
    // return res.data;
    return mockGetMatchState(matchId);
  },

  recordDelivery: async (matchId, data) => {
    // TODO: Replace with real API call
    // const res = await apiClient.post(`/matches/${matchId}/scoring/delivery`, data);
    // return res.data;
    return mockRecordDelivery(matchId, data);
  },

  recordWicket: async (matchId, data) => {
    // TODO: Replace with real API call
    // const res = await apiClient.post(`/matches/${matchId}/scoring/wicket`, data);
    // return res.data;
    return mockRecordWicket(matchId, data);
  },

  swapStriker: async (matchId) => {
    // TODO: Replace with real API call
    // const res = await apiClient.post(`/matches/${matchId}/scoring/swap-striker`);
    // return res.data;
    return mockSwapStriker(matchId);
  },

  undo: async (matchId) => {
    // TODO: Replace with real API call
    // const res = await apiClient.post(`/matches/${matchId}/scoring/undo`);
    // return res.data;
    return mockUndo(matchId);
  },

  endOver: async (matchId) => {
    // TODO: Replace with real API call
    // const res = await apiClient.post(`/matches/${matchId}/scoring/end-over`);
    // return res.data;
    return mockEndOver(matchId);
  },

  initializeMatch: async (matchId) => {
    // TODO: Replace with real API call
    // const res = await apiClient.post(`/matches/${matchId}/scoring/initialize`);
    // return res.data;
    return mockInitializeMatch(matchId);
  },
};
