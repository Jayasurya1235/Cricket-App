import { useId, useState } from "react";
import { UserMinus } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";
import { displayName } from "../../utils/scoring";

const WICKET_TYPES = [
  { value: "bowled", label: "Bowled", icon: "\u{1F3B3}" },
  { value: "caught", label: "Caught", icon: "\u{1F932}" },
  { value: "lbw", label: "LBW", icon: "\u{1F9B5}" },
  { value: "run_out", label: "Run Out", icon: "\u{1F3C3}" },
  { value: "stumped", label: "Stumped", icon: "\u{1F9E4}" },
  { value: "hit_wicket", label: "Hit Wicket", icon: "\u{1F4A5}" },
];

function PickerGroup({ label, children }) {
  const labelId = useId();
  return (
    <div role="radiogroup" aria-labelledby={labelId}>
      <p
        id={labelId}
        className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle"
      >
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

const PICKER_BASE =
  "rounded-card border-2 p-3 text-left transition-all duration-150 active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";
const PICKER_IDLE = "border-line bg-surface-muted hover:border-line-strong hover:bg-surface-sunken";
const PICKER_ACTIVE = "border-brand-500 bg-brand-50 shadow-sm";

export default function WicketModal({
  open,
  scorecard,
  nameMap,
  onConfirm,
  onClose,
  isProcessing,
}) {
  const [wicketType, setWicketType] = useState("");
  const [dismissedId, setDismissedId] = useState(scorecard?.striker_id ?? "");

  if (!scorecard) return null;

  const striker = scorecard.batsmen?.find(
    (b) => b.player_id === scorecard.striker_id,
  );
  const nonStriker = scorecard.batsmen?.find(
    (b) => b.player_id === scorecard.non_striker_id,
  );
  const atCrease = [striker, nonStriker].filter(Boolean);

  function handleSubmit() {
    if (!wicketType || !dismissedId) return;
    onConfirm({
      wicket_type: wicketType,
      dismissed_player_id: Number(dismissedId),
    });
  }

  const submitDisabled = !wicketType || !dismissedId || isProcessing;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Wicket"
      description="Who is out and how?"
      size="sm"
      footer={
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={submitDisabled}
          loading={isProcessing}
        >
          {!isProcessing && <UserMinus className="size-4" aria-hidden="true" />}
          Record Wicket
        </Button>
      }
    >
      <div className="space-y-5">
        <PickerGroup label="Dismissed Player">
          {atCrease.map((b) => {
            const isActive = dismissedId === b.player_id;
            return (
              <button
                key={b.player_id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setDismissedId(b.player_id)}
                className={cn(PICKER_BASE, isActive ? PICKER_ACTIVE : PICKER_IDLE)}
              >
                <p className="text-[10px] font-bold uppercase text-ink-faint">
                  {b.player_id === scorecard.striker_id ? "On Strike" : "Non-Striker"}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-ink">
                  {displayName(nameMap, b.player_id)}
                </p>
                <p className="text-[11px] tabular-nums text-ink-muted">
                  {b.runs} ({b.balls_faced})
                </p>
              </button>
            );
          })}
        </PickerGroup>

        <PickerGroup label="How was the batsman dismissed?">
          {WICKET_TYPES.map((wt) => {
            const isActive = wicketType === wt.value;
            return (
              <button
                key={wt.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setWicketType(wt.value)}
                className={cn(PICKER_BASE, isActive ? PICKER_ACTIVE : PICKER_IDLE)}
              >
                <span className="text-lg" aria-hidden="true">
                  {wt.icon}
                </span>
                <p
                  className={cn(
                    "mt-1 text-xs font-bold",
                    isActive ? "text-brand-700" : "text-ink-muted",
                  )}
                >
                  {wt.label}
                </p>
              </button>
            );
          })}
        </PickerGroup>
      </div>
    </Modal>
  );
}