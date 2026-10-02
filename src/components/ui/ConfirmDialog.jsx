import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

const ConfirmContext = createContext(null);

const TONES = {
  danger: {
    icon: AlertTriangle,
    iconClass: "bg-danger-bg text-danger",
    confirmVariant: "danger",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-warning-bg text-warning",
    confirmVariant: "primary",
  },
  info: {
    icon: HelpCircle,
    iconClass: "bg-info-bg text-info",
    confirmVariant: "primary",
  },
};

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolverRef = useRef(null);

  const settle = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setRequest(null);
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      // A second confirm() while one is still open (double-click on a delete
      // button) would otherwise overwrite the resolver and leave the first
      // caller awaiting forever. Resolve the previous one as "cancelled".
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setRequest({
        title: "Are you sure?",
        confirmLabel: "Confirm",
        cancelLabel: "Cancel",
        tone: "danger",
        ...options,
      });
    });
  }, []);

  // Never leave a caller hanging if the provider unmounts mid-request.
  useEffect(() => {
    return () => {
      resolverRef.current?.(false);
      resolverRef.current = null;
    };
  }, []);

  const value = useMemo(() => confirm, [confirm]);
  const tone = TONES[request?.tone] ?? TONES.info;
  const Icon = tone.icon;

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <Modal
        open={Boolean(request)}
        onClose={() => settle(false)}
        size="sm"
        title={request?.title}
        bodyClassName="pt-4"
        footer={
          <>
            <Button variant="secondary" onClick={() => settle(false)}>
              {request?.cancelLabel}
            </Button>
            <Button
              variant={tone.confirmVariant}
              onClick={() => settle(true)}
              data-autofocus=""
            >
              {request?.confirmLabel}
            </Button>
          </>
        }
      >
        <div className="flex gap-4">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tone.iconClass}`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <p className="pt-1.5 text-sm leading-relaxed text-ink-muted">
            {request?.description}
          </p>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return ctx;
}

export default ConfirmProvider;