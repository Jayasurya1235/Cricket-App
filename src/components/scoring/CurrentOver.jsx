const BALL_STYLES = {
  normal: {
    "0": "bg-gray-100 text-gray-600 border-gray-200",
    "1": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "2": "bg-blue-50 text-blue-700 border-blue-200",
    "3": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "4": "bg-amber-50 text-amber-700 border-amber-200",
    "5": "bg-orange-50 text-orange-700 border-orange-200",
    "6": "bg-purple-50 text-purple-700 border-purple-200",
  },
  wide: "bg-rose-50 text-rose-600 border-rose-200",
  no_ball: "bg-orange-50 text-orange-600 border-orange-200",
  bye: "bg-sky-50 text-sky-600 border-sky-200",
  leg_bye: "bg-teal-50 text-teal-600 border-teal-200",
  wicket: "bg-red-500 text-white border-red-600 shadow-md shadow-red-200",
};

function getBallStyle(delivery) {
  if (delivery.is_wicket || delivery.type === "wicket") {
    return BALL_STYLES.wicket;
  }
  if (delivery.type === "wide") return BALL_STYLES.wide;
  if (delivery.type === "no_ball") return BALL_STYLES.no_ball;
  if (delivery.type === "bye") return BALL_STYLES.bye;
  if (delivery.type === "leg_bye") return BALL_STYLES.leg_bye;

  const runs = delivery.runs;
  return BALL_STYLES.normal[String(runs)] || BALL_STYLES.normal["0"];
}

function getBallLabel(delivery) {
  if (delivery.is_wicket || delivery.type === "wicket") return "W";
  if (delivery.type === "wide") return "Wd";
  if (delivery.type === "no_ball") return "Nb";
  if (delivery.type === "bye") return `${delivery.runs}B`;
  if (delivery.type === "leg_bye") return `${delivery.runs}LB`;
  return delivery.runs;
}

export default function CurrentOver({ state }) {
  if (!state) return null;

  const currentOver = state.current_over || [];
  const overNumber = (state.overs?.current || 0) + 1;
  const legalBalls = currentOver.filter(
    (b) => b.type !== "wide" && b.type !== "no_ball"
  ).length;

  return (
    <div className="bg-white border border-cricket-border rounded-2xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-cricket-border/50 flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          This Over
        </h3>
        <span className="text-[11px] font-bold text-gray-500 tabular-nums">
          Over {overNumber} · {legalBalls}/6 balls
        </span>
      </div>

      <div className="px-4 py-4">
        {currentOver.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            No balls bowled this over yet
          </p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {currentOver.map((delivery, i) => (
              <BallBubble key={i} delivery={delivery} index={i} />
            ))}
            {Array.from({ length: Math.max(0, 6 - currentOver.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-9 h-9 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center"
                >
                  <span className="text-[10px] text-gray-300 font-medium">
                    {currentOver.length + i + 1}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {state.completed_overs && state.completed_overs.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Recent Overs
          </p>
          <div className="space-y-1.5 max-h-24 overflow-y-auto">
            {[...state.completed_overs]
              .reverse()
              .slice(0, 3)
              .map((over, oi) => (
                <div key={oi} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 w-5 tabular-nums shrink-0">
                    {state.completed_overs.length - oi}
                  </span>
                  <div className="flex items-center gap-1">
                    {over.map((d, di) => (
                      <span
                        key={di}
                        className={`text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${getBallStyle(d)}`}
                      >
                        {getBallLabel(d)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BallBubble({ delivery, index }) {
  const style = getBallStyle(delivery);
  const label = getBallLabel(delivery);

  return (
    <div
      className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 animate-[scaleIn_0.2s_ease-out] ${style}`}
      style={{ animationDelay: `${index * 50}ms` }}
      title={
        delivery.type === "wide"
          ? "Wide"
          : delivery.type === "no_ball"
            ? "No Ball"
            : delivery.type === "bye"
              ? "Bye"
              : delivery.type === "leg_bye"
                ? "Leg Bye"
                : delivery.is_wicket
                  ? "Wicket"
                  : `${delivery.runs} runs`
      }
    >
      {label}
    </div>
  );
}
