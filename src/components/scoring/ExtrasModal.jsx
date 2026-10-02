import { useState } from "react";
import { Plus } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";

const TYPE_CONFIG = {
  wide: {
    label: "Wide",
    description: "1 run for the wide plus any runs taken",
    style: "wd",
    badge: "Wd",
    idle: "border-line bg-surface-muted hover:border-line-strong hover:bg-surface-sunken",
    active: "border-rose-500 bg-rose-50 shadow-sm",
    summary: "bg-rose-50 border-rose-100",
    value: "text-rose-700",
    button: "bg-rose-600 hover:bg-rose-700",
  },
  no_ball: {
    label: "No Ball",
    description: "1 run for the no ball plus batsman runs",
    style: "nb",
    badge: "Nb",
    idle: "border-line bg-surface-muted hover:border-line-strong hover:bg-surface-sunken",
    active: "border-orange-500 bg-orange-50 shadow-sm",
    summary: "bg-orange-50 border-orange-100",
    value: "text-orange-700",
    button: "bg-orange-600 hover:bg-orange-700",
  },
  bye: {
    label: "Bye",
    description: "Runs that don't count to the batsman",
    style: "b",
    badge: "B",
    idle: "border-line bg-surface-muted hover:border-line-strong hover:bg-surface-sunken",
    active: "border-sky-500 bg-sky-50 shadow-sm",
    summary: "bg-sky-50 border-sky-100",
    value: "text-sky-700",
    button: "bg-sky-600 hover:bg-sky-700",
  },
  leg_bye: {
    label: "Leg Bye",
    description: "Runs off the batsman's body / pads",
    style: "lb",
    badge: "LB",
    idle: "border-line bg-surface-muted hover:border-line-strong hover:bg-surface-sunken",
    active: "border-teal-500 bg-teal-50 shadow-sm",
    summary: "bg-teal-50 border-teal-100",
    value: "text-teal-700",
    button: "bg-teal-600 hover:bg-teal-700",
  },
};

const isDeadBall = (type) => type === "wide" || type === "no_ball";

export default function ExtrasModal({
  open,
  extrasType,
  onConfirm,
  onClose,
  isProcessing,
}) {
  const [extraRuns, setExtraRuns] = useState(1);

  const config = TYPE_CONFIG[extrasType] || TYPE_CONFIG.wide;
  const label = isDeadBall(extrasType) ? "Runs on the ball" : "How many runs?";
  const RUNS = isDeadBall(extrasType) ? [0, 1, 2, 3, 4] : [1, 2, 3, 4];

  // wide:   runs_extras = 1 + additional runs
  // no_ball: runs_extras = 1, runs_batsman = additional runs
  // bye / leg_bye: runs_extras = runs
  const noBallRuns = extrasType === "no_ball" ? extraRuns : 0;
  const totalRuns =
    extrasType === "wide"
      ? 1 + extraRuns
      : extrasType === "no_ball"
        ? 1 + extraRuns
        : extraRuns;

  // Recent-balls notation. The number is the total runs on the delivery, so a
  // bare wide reads "W+1" and a bare no ball reads "N+1".
  const ballLabel =
    extrasType === "wide"
      ? `W+${totalRuns}`
      : extrasType === "no_ball"
        ? `N+${totalRuns}`
        : config.badge;

  function handleSubmit() {
    onConfirm({
      extra_type: extrasType,
      runs_batsman: noBallRuns,
      runs_extras:
        extrasType === "wide"
          ? 1 + extraRuns
          : extrasType === "no_ball"
            ? 1
            : extraRuns,
      total: totalRuns,
      label: ballLabel,
      style: config.style,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={config.label}
      description={config.description}
      size="sm"
      footer={
        <Button
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={isProcessing}
          loading={isProcessing}
          className={config.button}
        >
          {!isProcessing && <Plus className="size-4" aria-hidden="true" />}
          Record {config.label}
        </Button>
      }
    >
      <div className="space-y-4">
        <div role="radiogroup" aria-label={label}>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
            {label}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {RUNS.map((r) => {
              const isActive = extraRuns === r;
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => setExtraRuns(r)}
                  className={cn(
                    "h-12 rounded-control border-2 text-sm font-bold transition-all duration-150",
                    "active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2",
                    "focus-visible:outline-brand-600",
                    isActive
                      ? cn(config.active, config.value)
                      : cn(config.idle, "text-ink-muted"),
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={cn("rounded-card border p-3 text-center", config.summary)}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Total {config.label} Runs
          </p>
          <p className={cn("mt-0.5 text-2xl font-black", config.value)}>
            {totalRuns}
          </p>
          <p className="mt-1 text-[10px] font-bold tabular-nums text-ink-muted">
            Recent balls: {ballLabel}
          </p>
          {isDeadBall(extrasType) && (
            <p className="mt-1 text-[10px] font-semibold text-ink-muted">
              Not a legal ball — does not count towards the over
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}