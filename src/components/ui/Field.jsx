import {
  createContext,
  forwardRef,
  useContext,
  useId,
} from "react";
import { AlertCircle, Check, ChevronDown, Search } from "lucide-react";
import { cn } from "../../utils/cn";

const FieldContext = createContext(null);

const CONTROL_BASE = cn(
  "w-full rounded-control border bg-input text-sm text-ink",
  "transition-[border-color,box-shadow] duration-150",
  "focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
  "disabled:bg-surface-muted disabled:text-ink-subtle disabled:cursor-not-allowed",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/15",
);

const SIZES = {
  md: "h-11 px-3",
  lg: "h-12 px-3.5",
  otp: "h-14 px-3 text-center text-xl tracking-[0.4em] font-mono",
};

function Field({
  label,
  hint,
  error,
  required = false,
  labelAction,
  className,
  children,
  ...rest
}) {
  const generatedId = useId();
  const id = rest.id ?? generatedId;
  const hintId = hint ? `${id}-hint` : null;
  const errorId = error ? `${id}-error` : null;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const context = { id, describedBy, invalid: Boolean(error), required };

  return (
    <FieldContext.Provider value={context}>
      <div className={cn("space-y-1.5", className)}>
        {(label || labelAction) && (
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor={id}
              className="text-[13px] font-semibold text-ink leading-none"
            >
              {label}
              {required && (
                <>
                  <span className="ml-0.5 text-danger" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </>
              )}
            </label>
            {labelAction}
          </div>
        )}
        {children}
        {error ? (
          <p
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 text-[13px] leading-snug text-danger"
          >
            <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="text-[13px] leading-snug text-ink-subtle">
              {hint}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
}

function useFieldProps(props) {
  const field = useContext(FieldContext);
  const id = props.id ?? field?.id;
  const invalid = props["aria-invalid"] ?? (field?.invalid || undefined);
  return {
    ...props,
    id,
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": invalid || undefined,
    "aria-required": field?.required || undefined,
  };
}

const Input = forwardRef(function Input({ className, size = "md", ...props }, ref) {
  const fieldProps = useFieldProps(props);
  return (
    <input
      ref={ref}
      data-focus-ring-inset=""
      className={cn(CONTROL_BASE, SIZES[size], className)}
      {...fieldProps}
    />
  );
});

const Textarea = forwardRef(function Textarea(
  { className, rows = 3, ...props },
  ref,
) {
  const fieldProps = useFieldProps(props);
  return (
    <textarea
      ref={ref}
      rows={rows}
      data-focus-ring-inset=""
      className={cn(
        CONTROL_BASE,
        "resize-y px-3 py-2.5 leading-relaxed",
        className,
      )}
      {...fieldProps}
    />
  );
});

const Select = forwardRef(function Select(
  { className, size = "md", children, ...props },
  ref,
) {
  const fieldProps = useFieldProps(props);
  return (
    <div className="relative">
      <select
        ref={ref}
        data-focus-ring-inset=""
        className={cn(
          CONTROL_BASE,
          SIZES[size],
          "appearance-none pr-10 cursor-pointer",
          className,
        )}
        {...fieldProps}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
        aria-hidden="true"
      />
    </div>
  );
});

function Checkbox({ className, label, description, id, ...props }) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const descriptionId = description ? `${checkboxId}-description` : undefined;

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="relative flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className="peer size-5 shrink-0 cursor-pointer appearance-none rounded-md border border-line-strong bg-input transition checked:border-brand-600 checked:bg-brand-600 indeterminate:border-brand-600 indeterminate:bg-brand-600 disabled:cursor-not-allowed disabled:bg-surface-muted"
          aria-describedby={descriptionId}
          {...props}
        />
        <Check
          className="pointer-events-none absolute left-0.5 top-0.5 size-4 stroke-[3] text-white opacity-0 transition peer-checked:opacity-100 peer-disabled:opacity-40"
          aria-hidden="true"
        />
      </span>
      {(label || description) && (
        <div className="min-w-0 leading-tight">
          {label && (
            <label
              htmlFor={checkboxId}
              className="cursor-pointer text-sm font-medium text-ink select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p
              id={descriptionId}
              className="mt-1 text-[13px] text-ink-subtle"
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Switch({ checked, onChange, label, description, disabled, id }) {
  const generatedId = useId();
  const switchId = id ?? generatedId;
  const descriptionId = description ? `${switchId}-description` : undefined;

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0 leading-tight">
          {label && (
            <label
              htmlFor={switchId}
              className="text-sm font-medium text-ink select-none"
            >
              {label}
            </label>
          )}
          {description && (
            <p id={descriptionId} className="mt-1 text-[13px] text-ink-subtle">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-brand-600" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function PasswordInput({ visibility = false, ...props }) {
  return <Input type={visibility ? "text" : "password"} {...props} />;
}

const IconInput = forwardRef(function IconInput(
  { icon: Icon, className, size = "md", ...props },
  ref,
) {
  const { trailing, ...rest } = props;
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden="true"
        />
      )}
      <Input
        ref={ref}
        size={size}
        className={cn(
          Icon && "pl-10",
          trailing && "pr-11",
          className,
        )}
        {...rest}
      />
      {trailing && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2">
          {trailing}
        </span>
      )}
    </div>
  );
});

function IconToggleButton({ label, children, ...rest }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-lg text-ink-subtle transition hover:bg-surface-muted hover:text-ink"
      {...rest}
    >
      {children}
    </button>
  );
}

function SearchInput({ className, ...props }) {
  return (
    <IconInput
      type="search"
      icon={Search}
      className={cn(className)}
      {...props}
    />
  );
}

export {
  Field,
  Input,
  Textarea,
  Select,
  Checkbox,
  Switch,
  PasswordInput,
  IconInput,
  IconToggleButton,
  SearchInput,
};
export default Field;