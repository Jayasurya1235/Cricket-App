import { cn } from "../../utils/cn";
import { toNumber } from "./chartUtils";

const TONES = {
  brand: "bg-brand-400",
  brandSoft: "bg-brand-200",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-line-strong",
};

export default function BarChart({
  data = [],
  height = 128,
  max,
  formatValue = (value) => String(value),
  tone = "brand",
  ariaLabel = "Bar chart",
  emptyLabel = "No data to chart.",
  columnWidth = 26,
  showValues = true,
}) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        {emptyLabel}
      </p>
    );
  }

  const peak = Math.max(1, toNumber(max) || 0, ...data.map((d) => toNumber(d.value)));

  return (
    <div
      className="flex items-end gap-1 overflow-x-auto pb-1"
      style={{ height }}
      role="img"
      aria-label={ariaLabel}
    >
      {data.map((item, index) => {
        const value = toNumber(item.value);
        const pct = Math.max(3, Math.round((value / peak) * 100));
        return (
          <div
            key={item.key ?? index}
            className="flex shrink-0 flex-col items-center justify-end gap-1"
            style={{ width: columnWidth }}
            title={item.title ?? `${item.label}: ${formatValue(value)}`}
          >
            {showValues && (
              <span className="text-[10px] font-semibold tabular-nums text-ink-subtle">
                {formatValue(value)}
              </span>
            )}
            {item.marker != null && (
              <span className="rounded-full bg-danger-bg px-1 text-[9px] font-bold leading-4 text-danger">
                {item.marker}
              </span>
            )}
            <div
              className={cn("w-full rounded-t-sm", TONES[item.tone] ?? TONES[tone])}
              style={{ height: `${pct}%` }}
            />
            <span className="w-full truncate text-center text-[9px] tabular-nums text-ink-faint">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
