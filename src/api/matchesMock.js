// This simulates a backend database using an in-memory array.
// Replace this whole file with a real API layer once /matches exists on the backend.

let matches = [
  // Example seed data — feel free to delete this once you add real matches
];

let nextId = 1;

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
