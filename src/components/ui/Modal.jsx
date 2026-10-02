import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

let scrollLockCount = 0;

function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    if (scrollLockCount === 0) {
      body.style.overflow = "hidden";
      if (gutter > 0) body.style.paddingRight = `${gutter}px`;
    }
    scrollLockCount += 1;

    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount === 0) {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPadding;
      }
    };
  }, [active]);
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = "dialog",
  size = "md",
  dismissable = true,
  initialFocusRef,
  className,
  bodyClassName,
}) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;

    previouslyFocused.current = document.activeElement;

    const timer = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ??
        panelRef.current?.querySelector("[data-autofocus]") ??
        panelRef.current?.querySelector(FOCUSABLE) ??
        panelRef.current;
      target?.focus?.();
    }, 20);

    return () => {
      window.clearTimeout(timer);
      const previous = previouslyFocused.current;
      if (previous instanceof HTMLElement && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [open, initialFocusRef]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && dismissable) {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      );
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [dismissable, onClose],
  );

  if (!open) return null;

  const widths = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  const placements = {
    dialog:
      "items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-8",
    sheet: "items-end justify-center",
    drawer: "items-stretch justify-end",
  };

  const panels = {
    dialog: cn(
      "w-full rounded-t-2xl sm:rounded-card",
      "max-h-[92dvh] sm:max-h-[88vh]",
      widths[size],
    ),
    sheet: "w-full rounded-t-2xl max-h-[92dvh]",
    drawer: cn("h-full w-full max-w-md rounded-none", widths[size]),
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex",
        "bg-ink/50 backdrop-blur-[2px] animate-fade-in",
        placements[variant],
      )}
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0"
        onClick={dismissable ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex flex-col bg-surface shadow-modal outline-none",
          "border border-line",
          variant === "drawer"
            ? "border-y-0 border-r-0 animate-slide-in-right"
            : "animate-slide-up sm:animate-scale-in",
          panels[variant],
          className,
        )}
      >
        {(title || dismissable) && (
          <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line shrink-0">
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-base font-semibold text-ink leading-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id={descriptionId}
                  className="mt-1 text-[13px] leading-snug text-ink-subtle"
                >
                  {description}
                </p>
              )}
            </div>
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close${title ? ` ${title}` : ""} dialog`}
                className={cn(
                  "-mr-1.5 -mt-1 flex size-10 shrink-0 items-center justify-center",
                  "rounded-lg text-ink-subtle transition",
                  "hover:bg-surface-muted hover:text-ink",
                )}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            )}
          </header>
        )}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-5 py-5",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-line bg-canvas/60 px-5 py-4 shrink-0 sm:rounded-b-card">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

export { Modal };
export default Modal;