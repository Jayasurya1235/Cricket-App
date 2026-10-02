import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const VARIANTS = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-muted active:bg-surface-sunken",
  subtle:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200 disabled:text-brand-400",
  ghost:
    "bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink active:bg-surface-sunken",
  danger:
    "bg-danger text-white shadow-sm hover:bg-danger/90 active:bg-danger disabled:bg-danger-line",
  dangerGhost: "bg-transparent text-danger hover:bg-danger-bg",
};

const SIZES = {
  sm: "h-10 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-control",
  lg: "h-12 px-5 text-[15px] gap-2 rounded-control",
  icon: "h-11 w-11 rounded-control",
  iconSm: "h-10 w-10 rounded-lg",
};

const Button = forwardRef(function Button(
  {
    as: Tag = "button",
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  const isNativeButton = Tag === "button";
  return (
    <Tag
      ref={ref}
      type={isNativeButton ? (type ?? "button") : undefined}
      disabled={isNativeButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      aria-disabled={
        !isNativeButton && (disabled || loading) ? true : undefined
      }
      className={cn(
        "inline-flex items-center justify-center font-semibold whitespace-nowrap",
        "transition-[background-color,border-color,color,box-shadow,transform] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
        "disabled:pointer-events-none disabled:opacity-60",
        !isNativeButton && (disabled || loading) && "pointer-events-none opacity-60",
        "active:scale-[0.985] motion-reduce:active:scale-100",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && (
        <Loader2
          className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      {children}
    </Tag>
  );
});

export { Button };
export default Button;