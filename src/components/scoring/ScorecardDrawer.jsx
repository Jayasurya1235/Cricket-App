import Modal from "../ui/Modal";
import { displayName } from "../../utils/scoring";
import { cn } from "../../utils/cn";

const HEAD_CELL =
  "text-[10px] font-bold uppercase tracking-wider text-ink-faint pb-2 px-2 first:pl-0 first:pr-3 last:pr-0";
const HEAD_CELL_LEFT = cn(HEAD_CELL, "text-left");
const HEAD_CELL_RIGHT = cn(HEAD_CELL, "text-right");
const NUM_CELL = "py-2 px-2 text-xs tabular-nums text-ink-muted text-right last:pr-0";
const ROW_HEAD = "py-2 pr-3 text-xs font-bold text-ink";

function ScorecardTable({ caption, head, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">{head}</tr>
        </thead>
        <tbody className="divide-y divide-line/60">{children}</tbody>
      </table>
    </div>
  );
}

export default function ScorecardDrawer({ scorecard, nameMap, isOpen, onClose }) {
  if (!isOpen || !scorecard) return null;

  const batsmen = scorecard.batsmen || [];
  const bowlers = scorecard.bowlers || [];
  const isChase = scorecard.innings_number > 1;
  const requiredRuns =
    scorecard.target != null ? scorecard.target - scorecard.total : null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      variant="drawer"
      size="lg"
      title="Scorecard"
      description={`Innings ${scorecard.innings_number}${
        scorecard.completed ? ` · ${scorecard.end_reason || "Complete"}` : ""
      }`}
    >
      <div className="space-y-6">
        <div className="rounded-card bg-surface-muted p-4 text-center">
          <p className="text-lg font-black tabular-nums text-ink">
            {scorecard.total} / {scorecard.wickets}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-ink-muted">
            {scorecard.overs_bowled_str} Overs · Extras {scorecard.extras ?? 0}
          </p>
          <p className="mt-1 text-[10px] font-semibold text-ink-faint">
            CRR {Number(scorecard.current_run_rate || 0).toFixed(2)}
          </p>
          {isChase && scorecard.target != null && (
            <p className="mt-2 text-[11px] font-bold text-warning">
              Target {scorecard.target} · Need {Math.max(0, requiredRuns)} to win
            </p>
          )}
        </div>

        <section aria-labelledby="scorecard-batting">
          <h3
            id="scorecard-batting"
            className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-faint"
          >
            Batting
          </h3>
          {batsmen.length === 0 ? (
            <p className="rounded-card bg-surface-muted py-3 text-center text-xs text-ink-faint">
              No batsmen recorded yet
            </p>
          ) : (
            <ScorecardTable
              caption="Batting scorecard"
              head={
                <>
                  <th scope="col" className={HEAD_CELL_LEFT}>
                    Batsman
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    R
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    B
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    4s
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    6s
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    SR
                  </th>
                </>
              }
            >
              {batsmen.map((b) => {
                const active = b.player_id === scorecard.striker_id;
                return (
                  <tr key={b.player_id} className={active ? "bg-brand-50" : ""}>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ink">
                          {displayName(nameMap, b.player_id)}
                        </span>
                        {active && (
                          <span className="rounded bg-brand-100 px-1 py-0.5 text-[8px] font-bold text-brand-700">
                            {b.did_not_bat ? "" : "*"}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-ink-faint">
                        {b.out
                          ? `out (${b.dismissal || "unknown"})`
                          : b.did_not_bat
                            ? "did not bat"
                            : "not out"}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-xs font-bold tabular-nums text-ink">
                      {b.runs}
                    </td>
                    <td className={NUM_CELL}>{b.balls_faced}</td>
                    <td className={NUM_CELL}>{b.fours}</td>
                    <td className={NUM_CELL}>{b.sixes}</td>
                    <td className={NUM_CELL}>{b.strike_rate}</td>
                  </tr>
                );
              })}
            </ScorecardTable>
          )}
        </section>

        <section aria-labelledby="scorecard-bowling">
          <h3
            id="scorecard-bowling"
            className="mb-3 text-[10px] font-bold uppercase tracking-widest text-ink-faint"
          >
            Bowling
          </h3>
          {bowlers.length === 0 ? (
            <p className="rounded-card bg-surface-muted py-3 text-center text-xs text-ink-faint">
              No balls bowled yet
            </p>
          ) : (
            <ScorecardTable
              caption="Bowling figures"
              head={
                <>
                  <th scope="col" className={HEAD_CELL_LEFT}>
                    Bowler
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    O
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    M
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    R
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    W
                  </th>
                  <th scope="col" className={HEAD_CELL_RIGHT}>
                    Econ
                  </th>
                </>
              }
            >
              {bowlers.map((bw) => (
                <tr key={bw.player_id}>
                  <th scope="row" className={ROW_HEAD}>
                    {displayName(nameMap, bw.player_id)}
                  </th>
                  <td className={NUM_CELL}>{bw.overs_str}</td>
                  <td className={NUM_CELL}>{bw.maidens}</td>
                  <td className={NUM_CELL}>{bw.runs_conceded}</td>
                  <td className={NUM_CELL}>{bw.wickets}</td>
                  <td className={NUM_CELL}>{bw.economy}</td>
                </tr>
              ))}
            </ScorecardTable>
          )}
        </section>
      </div>
    </Modal>
  );
}