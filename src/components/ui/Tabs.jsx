import { cn } from "../../utils/cn";

// Accessible, horizontally scrollable tab strip. Panels are rendered by the
// consumer via TabPanel so inactive sections stay unmounted (their data hooks
// only run once the tab is opened).
export function Tabs({ tabs, activeId, onChange, className, label = "Sections" }) {
  if (!tabs || tabs.length === 0) return null;

  function handleKeyDown(event, index) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + delta + tabs.length) % tabs.length;
    onChange(tabs[next].id);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex gap-1 overflow-x-auto rounded-card border border-line bg-surface-muted/60 p-1.5",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const active = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-control px-3.5 py-2 text-[13px] font-semibold transition-colors duration-150",
              active
                ? "border border-line bg-surface text-ink shadow-card"
                : "text-ink-muted hover:bg-surface/60 hover:text-ink",
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ id, activeId, labelledBy, children, className }) {
  if (id !== activeId) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={labelledBy ? `tab-${labelledBy}` : `tab-${id}`}
      className={cn("animate-fade-in", className)}
    >
      {children}
    </div>
  );
}

export default Tabs;
