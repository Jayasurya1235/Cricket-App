import { AlertTriangle, Inbox, RefreshCw, SearchX, WifiOff } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";

function Spinner({ className, label = "Loading" }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block size-5 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none",
        className,
      )}
    />
  );
}

function LoadingState({ label = "Loading…", className, compact = false }) {
  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn("flex items-center justify-center gap-3 py-10 text-ink-subtle", className)}
      >
        <Spinner className="size-4 text-brand-600" />
        <span className="text-sm">{label}</span>
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-20 text-center",
        className,
      )}
    >
      <Spinner className="size-7 text-brand-600" />
      <p className="text-sm text-ink-subtle">{label}</p>
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={cn("skeleton rounded-md", className)} aria-hidden="true" />;
}

function CardSkeletonGrid({ count = 6 }) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-card border border-line bg-surface p-5 shadow-card"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
  variant = "error",
}) {
  const isOffline = variant === "offline";
  const Icon = isOffline ? WifiOff : AlertTriangle;
  const palette = isOffline
    ? "bg-info-bg border-info-line text-info"
    : "bg-danger-bg border-danger-line text-danger";

  return (
    <div
      role="alert"
      className={cn(
        "mx-auto max-w-md rounded-card border px-6 py-8 text-center",
        palette,
        className,
      )}
    >
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-white/70">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-[15px] font-semibold text-ink">{title}</h2>
      {message && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{message}</p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-md rounded-card border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-surface-muted text-ink-subtle">
        {icon ?? <Inbox className="size-6" aria-hidden="true" />}
      </span>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

function NoResultsState({ query, className, action }) {
  return (
    <EmptyState
      icon={<SearchX className="size-6" aria-hidden="true" />}
      title="No matches found"
      description={
        query
          ? `Nothing matched “${query}”. Try a different search term.`
          : "Try adjusting your filters."
      }
      action={action}
      className={className}
    />
  );
}

export {
  Spinner,
  LoadingState,
  CardSkeletonGrid,
  ErrorState,
  EmptyState,
  NoResultsState,
  Skeleton,
};