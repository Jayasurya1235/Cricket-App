import { cn } from "../../utils/cn";

const TONES = {
  default: "text-ink",
  brand: "text-brand-700",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  muted: "text-ink-subtle",
};

const COLUMNS = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

// A single metric. Renders dt/dd inside a div so it can sit directly under a
// <dl> (StatGrid) while still allowing arbitrary grid placement.
export function StatTile({ label, value, hint, tone = "default", className }) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface-muted/40 p-4",
        className,
      )}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-xl font-bold tabular-nums",
          TONES[tone] ?? TONES.default,
        )}
      >
        {value ?? "—"}
      </dd>
      {hint ? <p className="mt-0.5 text-[11px] text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function StatGrid({ children, columns = 3, className }) {
  return (
    <dl className={cn("grid gap-3", COLUMNS[columns] ?? COLUMNS[3], className)}>
      {children}
    </dl>
  );
}

export default StatGrid;
