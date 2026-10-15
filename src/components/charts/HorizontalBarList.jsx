import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { toNumber } from "./chartUtils";

const FILLS = {
  brand: "bg-brand-500",
  brandSoft: "bg-brand-300",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export default function HorizontalBarList({
  items = [],
  formatValue = (value) => String(value),
  max,
  barTone = "brand",
  rank = false,
  emptyLabel = "No data to chart.",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        {emptyLabel}
      </p>
    );
  }

  const peak = Math.max(1, toNumber(max) || 0, ...items.map((i) => toNumber(i.value)));

  return (
    <ul className="space-y-3">
      {items.map((item, index) => {
        const value = toNumber(item.value);
        const pct = Math.max(2, Math.round((value / peak) * 100));
        const body = (
          <>
            <div className="flex min-w-0 items-center gap-2">
              {rank && (
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[10px] font-bold text-ink-subtle">
                  {item.rank ?? index + 1}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">
                  {item.label}
                </span>
                {item.sublabel && (
                  <span className="block truncate text-[11px] text-ink-subtle">
                    {item.sublabel}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-ink">
                {formatValue(value)}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-sunken">
              <div
                className={cn("h-full rounded-full", FILLS[item.tone] ?? FILLS[barTone])}
                style={{ width: `${pct}%` }}
              />
            </div>
          </>
        );

        return (
          <li key={item.key ?? index}>
            {item.href ? (
              <Link
                to={item.href}
                className="block rounded-control px-2 py-1.5 transition-colors hover:bg-surface-muted"
              >
                {body}
              </Link>
            ) : (
              <div className="px-2 py-1.5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
