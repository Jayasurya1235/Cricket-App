import { cn } from "../utils/cn";

export function AuthShell({ children, className }) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:py-14",
        "bg-canvas",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60rem 30rem at 50% -10%, rgb(16 185 129 / 0.10), transparent 60%)",
        }}
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

export function AuthBrand({ subtitle = "Pro League Admin" }) {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-600 shadow-raised">
        <svg
          viewBox="0 0 24 24"
          className="size-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 0 0 18" />
          <path d="M12 3a9 9 0 0 1 0 18" />
          <path d="M3.5 9h17M3.5 15h17" />
        </svg>
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-ink">cricket</p>
      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
        {subtitle}
      </p>
    </div>
  );
}

export function AuthCard({ children, className }) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface p-6 shadow-raised sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthCardHeading({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-subtle">
          {description}
        </p>
      )}
    </div>
  );
}

export function AuthDivider({ children = "or continue with email" }) {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
        {children}
      </span>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
  );
}

export function AuthFooter({ children }) {
  return (
    <p className="mt-6 text-center text-sm text-ink-muted">{children}</p>
  );
}

export function AlertBanner({ tone = "danger", children }) {
  const palette = {
    danger: "bg-danger-bg border-danger-line text-danger",
    success: "bg-success-bg border-success-line text-success",
    warning: "bg-warning-bg border-warning-line text-warning",
    info: "bg-info-bg border-info-line text-info",
  }[tone];

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-[13px] leading-snug",
        palette,
      )}
    >
      {children}
    </div>
  );
}