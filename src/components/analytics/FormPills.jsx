import { cn } from "../../utils/cn";

// The backend returns result codes such as "W", "L", "D", "T", "NR". Match on
// the first letter so a one- or two-character code both colour correctly.
function toneForCode(code) {
  const c = String(code ?? "").trim().toUpperCase();
  if (c.startsWith("W")) return "success";
  if (c.startsWith("L")) return "danger";
  if (c.startsWith("D") || c.startsWith("T")) return "warning";
  return "neutral";
}

const TONES = {
  success: "bg-success-bg text-success border-success-line",
  danger: "bg-danger-bg text-danger border-danger-line",
  warning: "bg-warning-bg text-warning border-warning-line",
  neutral: "bg-surface-muted text-ink-muted border-line",
};

// Renders a team's recent form as a row of coloured pills. Accepts either the
// compact `formString` ("WWLDL") or the `items` array, preferring the string.
export function FormPills({ formString, items = [], className }) {
  const codes =
    typeof formString === "string" && formString.trim()
      ? formString.replace(/[^A-Za-z]/g, "").toUpperCase().split("")
      : (items ?? []).map((item) => item?.result_code).filter(Boolean);

  if (codes.length === 0) {
    return <span className="text-[13px] text-ink-subtle">No results yet</span>;
  }

  return (
    <ul className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {codes.map((code, index) => (
        <li key={`${code}-${index}`}>
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md border text-[11px] font-bold",
              TONES[toneForCode(code)] ?? TONES.neutral,
            )}
            title={items[index]?.result || code}
          >
            {code}
          </span>
        </li>
      ))}
    </ul>
  );
}

// A single coloured result marker ("W"/"L"/...) with a label, reused by the
// recent-results tables and the pill strip.
export function ResultBadge({ code, text, className }) {
  const label = text || code || "Result";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-bold",
        TONES[toneForCode(code)] ?? TONES.neutral,
        className,
      )}
      title={text}
    >
      <span aria-hidden="true">{String(code ?? "").trim().toUpperCase()}</span>
      <span className="font-medium">{label}</span>
    </span>
  );
}

// Label every pill's meaning without repeating prose for each one.
export function FormLegend({ className }) {
  const entries = [
    ["W", "Win", "success"],
    ["L", "Loss", "danger"],
    ["D", "Draw", "warning"],
  ];
  return (
    <ul className={cn("flex flex-wrap items-center gap-3", className)}>
      {entries.map(([code, label, tone]) => (
        <li key={code} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex size-5 items-center justify-center rounded border text-[10px] font-bold",
              TONES[tone],
            )}
          >
            {code}
          </span>
          <span className="text-[11px] text-ink-subtle">{label}</span>
        </li>
      ))}
    </ul>
  );
}

export default FormPills;
