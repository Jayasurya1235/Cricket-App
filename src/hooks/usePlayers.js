import { useQuery } from "@tanstack/react-query";
import { playersApi } from "../api/players";

const PAGE_SIZE = 50;
const MAX_INDEX = 10000;

// The backend can return 500 when a row in the players table is corrupt.
// Only treat server 500s as "skip this record"; real failures should surface.
function isCorruptServerError(error) {
  return !!(error?.response && error.response.status === 500);
}

async function fetchAllPlayers() {
  const players = new Map();
  let skip = 0;

  while (skip < MAX_INDEX) {
    let records;
    try {
      records = await playersApi.list(skip, PAGE_SIZE);
    } catch (err) {
      if (!isCorruptServerError(err)) throw err;

      // This page spans a corrupt record that crashes the server request.
      // Probe the page slot-by-slot so valid records around it are kept.
      let reachedEnd = false;
      for (let i = 0; i < PAGE_SIZE && skip + i < MAX_INDEX; i++) {
        try {
          const one = await playersApi.list(skip + i, 1);
          if (!Array.isArray(one) || one.length === 0) {
            reachedEnd = true;
            break;
          }
          players.set(one[0].id, one[0]);
        } catch (probeErr) {
          if (!isCorruptServerError(probeErr)) throw probeErr;
          // corrupt record occupying this slot - skip it
        }
      }

      if (reachedEnd) break;
      skip += PAGE_SIZE;
      continue;
    }

    if (!Array.isArray(records)) break;
    for (const player of records) {
      players.set(player.id, player);
    }
    if (records.length < PAGE_SIZE) break;
    skip += records.length;
  }

  return [...players.values()];
}

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: fetchAllPlayers,
  });
}