import { CATEGORY_COLORS, toNumber } from "./chartUtils";

export default function DonutChart({
  segments = [],
  size = 180,
  thickness = 22,
  centerLabel,
  centerValue,
  formatValue = (value) => String(value),
  emptyLabel = "No data to chart.",
}) {
  const active = (segments ?? []).filter((s) => toNumber(s.value) > 0);
  const total = active.reduce((sum, s) => sum + toNumber(s.value), 0);

  if (active.length === 0 || total <= 0) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        {emptyLabel}
      </p>
    );
  }

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = active.length > 1 ? 2 : 0;

  const arcs = active.map((segment) => {
    const value = toNumber(segment.value);
    return { value, arc: (value / total) * circumference };
  });
  const offsets = arcs.reduce((acc, _entry, index) => {
    acc.push(index === 0 ? 0 : acc[index - 1] + arcs[index - 1].arc);
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} role="img" aria-label={centerLabel || "Donut chart"}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface-muted)"
            strokeWidth={thickness}
          />
          {active.map((segment, index) => {
            const value = arcs[index].value;
            const dash = Math.max(0.5, arcs[index].arc - gap);
            const offset = -offsets[index];
            return (
              <circle
                key={segment.key ?? index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={
                  segment.color ??
                  CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                }
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={offset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              >
                <title>{`${segment.label}: ${formatValue(value)}`}</title>
              </circle>
            );
          })}
        </svg>

        {(centerLabel || centerValue != null) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue != null && (
              <p className="text-2xl font-bold tabular-nums text-ink">
                {formatValue(centerValue)}
              </p>
            )}
            {centerLabel && (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">
                {centerLabel}
              </p>
            )}
          </div>
        )}
      </div>

      <ul className="w-full space-y-2 sm:flex-1">
        {active.map((s, index) => {
          const value = toNumber(s.value);
          const pct = ((value / total) * 100).toFixed(1);
          return (
            <li
              key={s.key ?? index}
              className="flex items-center justify-between gap-3 text-[13px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      s.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                  }}
                />
                <span className="truncate text-ink-muted">{s.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-ink">
                <span className="font-bold">{formatValue(value)}</span>{" "}
                <span className="text-ink-faint">{pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
