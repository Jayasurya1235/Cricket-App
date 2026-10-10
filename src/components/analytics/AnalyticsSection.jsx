import { cn } from "../../utils/cn";
import { Card } from "../ui";

// A titled card used across the analytics views. Mirrors the visual language of
// the existing SectionCard in MatchSummaryPage but lives here so player, team
// and head-to-head screens stay consistent.
export function AnalyticsSection({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold leading-tight text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] leading-snug text-ink-subtle">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export default AnalyticsSection;
