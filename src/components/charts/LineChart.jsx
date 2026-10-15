import { useElementWidth } from "../../hooks/useElementWidth";
import { SERIES_PALETTE, formatCompact, niceMax, toNumber } from "./chartUtils";

const PADDING = { top: 12, right: 14, bottom: 26, left: 38 };

export default function LineChart({
  series = [],
  labels = [],
  height = 220,
  formatY = formatCompact,
  ariaLabel = "Line chart",
  emptyLabel = "No data to chart.",
  showDots = true,
}) {
  const [ref, width] = useElementWidth();

  const activeSeries = (series ?? []).filter(
    (s) => Array.isArray(s.values) && s.values.length > 0,
  );
  const hasData = activeSeries.length > 0;

  if (!hasData) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        {emptyLabel}
      </p>
    );
  }

  const innerW = Math.max(0, width - PADDING.left - PADDING.right);
  const innerH = Math.max(0, height - PADDING.top - PADDING.bottom);

  const flatValues = activeSeries.flatMap((s) => s.values.map((v) => toNumber(v)));
  const peak = niceMax(Math.max(...flatValues, 1));
  const pointCount = Math.max(...activeSeries.map((s) => s.values.length));

  const xAt = (index) =>
    PADDING.left +
    (pointCount <= 1 ? innerW / 2 : (index / (pointCount - 1)) * innerW);
  const yAt = (value) =>
    PADDING.top + innerH - (toNumber(value) / peak) * innerH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const labelStride = Math.max(1, Math.ceil(pointCount / 8));

  return (
    <div className="space-y-3">
      {activeSeries.length > 1 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {activeSeries.map((s, index) => (
            <span
              key={s.key ?? index}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: s.color ?? SERIES_PALETTE[index % SERIES_PALETTE.length] }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}

      <div ref={ref} className="w-full">
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            className="overflow-visible"
          >
            {gridLines.map((ratio) => {
              const y = PADDING.top + innerH - ratio * innerH;
              return (
                <g key={ratio}>
                  <line
                    x1={PADDING.left}
                    x2={PADDING.left + innerW}
                    y1={y}
                    y2={y}
                    stroke="var(--color-line)"
                    strokeWidth={1}
                  />
                  <text
                    x={PADDING.left - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-ink-faint"
                    style={{ fontSize: 10 }}
                  >
                    {formatY(Math.round(peak * ratio))}
                  </text>
                </g>
              );
            })}

            {activeSeries.map((s, sIndex) => {
              const color =
                s.color ?? SERIES_PALETTE[sIndex % SERIES_PALETTE.length];
              const points = s.values.map((value, i) => ({
                x: xAt(i),
                y: yAt(value),
                value,
              }));
              const path = points
                .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
                .join(" ");
              return (
                <g key={s.key ?? sIndex}>
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {showDots &&
                    points.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={2.5}
                        fill="var(--color-surface)"
                        stroke={color}
                        strokeWidth={1.5}
                      >
                        <title>
                          {labels[i] != null ? `${labels[i]} · ` : ""}
                          {formatY(p.value)}
                        </title>
                      </circle>
                    ))}
                </g>
              );
            })}

            {labels.map((label, i) => {
              if (i % labelStride !== 0 && i !== pointCount - 1) return null;
              return (
                <text
                  key={i}
                  x={xAt(i)}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-ink-faint"
                  style={{ fontSize: 10 }}
                >
                  {label}
                </text>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
