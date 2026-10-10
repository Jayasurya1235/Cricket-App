import { cn } from "../../utils/cn";

// Horizontal meter for a 0–100 value (win percentage, strike share...). The
// numeric label is always shown, so the bar is decoration rather than the only
// carrier of the value.
export function PercentBar({ value, label, className, barClassName }) {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
            {label}
          </span>
          <span className="text-[13px] font-bold tabular-nums text-ink">
            {Number.isFinite(numeric) ? `${numeric.toFixed(1)}%` : "—"}
          </span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
        role="progressbar"
        aria-valuenow={Number.isFinite(numeric) ? Math.round(safe) : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Percentage"}
      >
        <div
          className={cn("h-full rounded-full bg-brand-500", barClassName)}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

export default PercentBar;
