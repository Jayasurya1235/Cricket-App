import { BALLS_PER_OVER, groupByOver } from "../../utils/scoring";

const BALL_STYLES = {
  "0": "bg-gray-100 text-gray-600 border-gray-200",
  "1": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "2": "bg-blue-50 text-blue-700 border-blue-200",
  "3": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "4": "bg-amber-50 text-amber-700 border-amber-200",
  "5": "bg-orange-50 text-orange-700 border-orange-200",
  "6": "bg-purple-50 text-purple-700 border-purple-200",
  W: "bg-red-500 text-white border-red-600 shadow-md shadow-red-200",
  wd: "bg-rose-50 text-rose-600 border-rose-200",
  nb: "bg-orange-50 text-orange-600 border-orange-200",
  b: "bg-sky-50 text-sky-600 border-sky-200",
  lb: "bg-teal-50 text-teal-600 border-teal-200",
};

const BALL_LABELS = {
  W: "W",
  wd: "Wd",
  nb: "Nb",
  b: "B",
  lb: "LB",
};

const BALL_TITLES = {
  W: "Wicket",
  wd: "Wide (not a legal delivery)",
  nb: "No ball (not a legal delivery)",
  b: "Bye",
  lb: "Leg Bye",
};

export default function CurrentOver({ balls = [], oversBowled = "0.0" }) {
  // Each completed over is its own group; extras never advance the over
  // counter, so a wide/no-ball stays with the over it was bowled in.
  const groups = groupByOver(balls);

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Recent Balls
        </h3>
        <span className="text-[11px] font-bold text-gray-500 tabular-nums">
          {oversBowled} ov
        </span>
      </div>

      <div className="px-4 py-4">
        {groups.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            Balls bowled this session will appear here
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map((group, gi) => (
              <div key={group.overNumber}>
                {gi > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-px flex-1 bg-cricket-border" />
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                      next over
                    </span>
                    <span className="h-px flex-1 bg-cricket-border" />
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <span
                    className={`shrink-0 mt-0.5 text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 ${
                      group.legalCount >= BALLS_PER_OVER
                        ? "bg-gray-100 text-gray-500"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                    title={
                      group.legalCount >= BALLS_PER_OVER
                        ? "Over complete"
                        : "Over in progress"
                    }
                  >
                    {group.legalCount}/{BALLS_PER_OVER}
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {group.balls.map((ball, i) => {
                      const style =
                        BALL_STYLES[ball.style] || BALL_STYLES["0"];
                      const label =
                        BALL_LABELS[ball.style] ?? ball.label ?? ball.style;
                      const wide = label.length > 2;
                      return (
                        <div
                          key={ball.id ?? `${gi}-${i}`}
                          className={`${
                            wide ? "min-w-9 px-2" : "w-9"
                          } h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            wide ? "text-[10px]" : ""
                          } ${style}`}
                          title={
                            BALL_TITLES[ball.style] ||
                            `${ball.runs ?? 0} run${
                              (ball.runs ?? 0) === 1 ? "" : "s"
                            }${
                              ball.isLegal === false
                                ? " (not a legal delivery)"
                                : ""
                            }`
                          }
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
