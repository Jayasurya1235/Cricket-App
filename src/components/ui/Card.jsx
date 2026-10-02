import { cn } from "../../utils/cn";

function Card({ as: Tag = "div", className, interactive = false, ...rest }) {
  return (
    <Tag
      className={cn(
        "bg-surface border border-line rounded-card shadow-card",
        interactive &&
          "transition-[box-shadow,border-color,transform] duration-200 hover:shadow-raised hover:border-brand-200",
        className,
      )}
      {...rest}
    />
  );
}

function CardHeader({ title, subtitle, action, icon, className }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-5 py-4 border-b border-line",
        className,
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-ink leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[13px] leading-snug text-ink-subtle">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

function CardBody({ className, ...rest }) {
  return <div className={cn("p-5", className)} {...rest} />;
}

function CardFooter({ className, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 px-5 py-4 border-t border-line bg-canvas/60 rounded-b-card",
        className,
      )}
      {...rest}
    />
  );
}

export { Card, CardHeader, CardBody, CardFooter };
export default Card;