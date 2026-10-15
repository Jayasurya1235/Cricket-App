export const CHART_COLORS = {
  brand: "var(--color-brand-500)",
  brandSoft: "var(--color-brand-300)",
  brandFaint: "var(--color-brand-200)",
  info: "var(--color-info)",
  infoSoft: "#60a5fa",
  warning: "var(--color-warning)",
  warningSoft: "#f59e0b",
  danger: "var(--color-danger)",
  success: "var(--color-success)",
  neutral: "var(--color-line-strong)",
  muted: "var(--color-ink-faint)",
};

export const SERIES_PALETTE = [
  "var(--color-brand-500)",
  "var(--color-info)",
  "var(--color-warning)",
  "#7c3aed",
  "var(--color-danger)",
  "#0891b2",
];

export const CATEGORY_COLORS = [
  "var(--color-brand-600)",
  "var(--color-brand-400)",
  "var(--color-info)",
  "var(--color-warning)",
  "#7c3aed",
  "var(--color-danger)",
  "var(--color-ink-faint)",
];

export function niceMax(value) {
  const v = Math.max(1, Math.ceil(Number(value) || 0));
  const magnitude = Math.pow(10, Math.floor(Math.log10(v)));
  const normalized = v / magnitude;
  let step;
  if (normalized <= 1) step = 1;
  else if (normalized <= 2) step = 2;
  else if (normalized <= 5) step = 5;
  else step = 10;
  return step * magnitude;
}

export function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function formatValue(value, digits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function formatCompact(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
