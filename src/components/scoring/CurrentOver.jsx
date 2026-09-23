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

export default function CurrentOver({ balls = [], oversBowled = "0.0" }) {
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
        {balls.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">
            Balls bowled this session will appear here
          </p>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {balls.map((ball, i) => {
              const style = BALL_STYLES[ball.style] || BALL_STYLES["0"];
              const label = BALL_LABELS[ball.style] ?? ball.label ?? ball.style;
              return (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${style}`}
                  title={
                    {
                      W: "Wicket",
                      wd: "Wide",
                      nb: "No Ball",
                      b: "Bye",
                      lb: "Leg Bye",
                    }[ball.style] || `${ball.runs} runs`
                  }
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}