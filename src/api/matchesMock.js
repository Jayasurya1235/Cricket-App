// This simulates a backend database using an in-memory array.
// Replace this whole file with a real API layer once /matches exists on the backend.

let matches = [
  {
    id: 1,
    match_type: "T20",
    venue: "M. A. Chidambaram Stadium, Chennai",
    match_date: "2026-09-05",
    match_time: "19:30",
    team1_id: 1,
    team2_id: 9,
    toss_won_by: "",
    toss_decision: "",
    toss_time: "",
    referee: "Javagal Srinath",
    status: "Upcoming",
    result: "",
    team1_playing_xi: [2, 3, 4],
    team2_playing_xi: [5, 6, 7],
  },
  {
    id: 2,
    match_type: "ODI",
    venue: "Wankhede Stadium, Mumbai",
    match_date: "2026-08-28",
    match_time: "13:30",
    team1_id: 9,
    team2_id: 11,
    toss_won_by: 11,
    toss_decision: "Bowl",
    toss_time: "13:00",
    referee: "Kumar Dharmasena",
    status: "Live",
    result: "",
    team1_playing_xi: [5, 6, 7],
    team2_playing_xi: [3, 4, 8],
  },
  {
    id: 3,
    match_type: "T20",
    venue: "M. Chinnaswamy Stadium, Bengaluru",
    match_date: "2026-08-22",
    match_time: "19:00",
    team1_id: 11,
    team2_id: 1,
    toss_won_by: 1,
    toss_decision: "Bat",
    toss_time: "18:30",
    referee: "Richard Illingworth",
    status: "Completed",
    result: "Chennai Super Kings won by 4 wickets",
    team1_playing_xi: [3, 4, 8],
    team2_playing_xi: [2, 3, 9],
  },
];

let nextId = 4;

// Simulates real network latency so loading states actually show up
function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const matchesMockApi = {
  list: async () => {
    await delay();
    return [...matches];
  },

  getById: async (id) => {
    await delay();
    const match = matches.find((m) => m.id === Number(id));
    if (!match) {
      const error = new Error("Match not found");
      error.response = { status: 404, data: { detail: "Match not found" } };
      throw error;
    }
    return match;
  },

  create: async (data) => {
    await delay();
    const newMatch = { id: nextId++, ...data };
    matches.push(newMatch);
    return newMatch;
  },

  update: async (id, data) => {
    await delay();
    const index = matches.findIndex((m) => m.id === Number(id));
    if (index === -1) throw new Error("Match not found");
    matches[index] = { ...matches[index], ...data };
    return matches[index];
  },

  remove: async (id) => {
    await delay();
    matches = matches.filter((m) => m.id !== Number(id));
  },
};
