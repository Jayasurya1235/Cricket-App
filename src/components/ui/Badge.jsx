import { cn } from "../../utils/cn";

const TONES = {
  neutral: "bg-surface-muted text-ink-muted border-line",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  success: "bg-success-bg text-success border-success-line",
  warning: "bg-warning-bg text-warning border-warning-line",
  danger: "bg-danger-bg text-danger border-danger-line",
  info: "bg-info-bg text-info border-info-line",
  live: "bg-danger-bg text-live border-danger-line",
};

const SIZES = {
  sm: "h-5 px-2 text-[11px] gap-1",
  md: "h-6 px-2.5 text-xs gap-1.5",
};

function Badge({
  tone = "neutral",
  size = "md",
  dot = false,
  pulse = false,
  icon,
  className,
  children,
  ...rest
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold whitespace-nowrap",
        TONES[tone],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {dot && (
        <span className="relative flex size-1.5 shrink-0" aria-hidden="true">
          {pulse && (
            <span className="absolute inline-flex size-full animate-ping-soft rounded-full bg-current opacity-70" />
          )}
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {icon && (
        <span className="flex size-3.5 items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

export { Badge };
export default Badge;