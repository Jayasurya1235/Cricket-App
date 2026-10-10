import { cn } from "../../utils/cn";

const HEAD =
  "px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ink-faint whitespace-nowrap first:pl-0 last:pr-0";
const CELL =
  "px-3 py-2.5 text-[13px] text-ink-muted first:pl-0 last:pr-0 align-middle";

// Small responsive table for the analytics lists (competition splits,
// head-to-head top performances, recent results). Columns describe their own
// renderer, so every cell is real backend data.
export function DataTable({
  columns,
  rows,
  getRowKey,
  caption,
  empty = "No data recorded.",
  isEmpty,
}) {
  if (!Array.isArray(rows) || rows.length === 0 || isEmpty) {
    return (
      <p className="rounded-card border border-dashed border-line-strong bg-surface-muted/40 px-4 py-6 text-center text-[13px] text-ink-subtle">
        {empty}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  HEAD,
                  column.align === "right" ? "text-right" : "text-left",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {rows.map((row, index) => (
            <tr
              key={getRowKey ? getRowKey(row, index) : index}
              className="transition-colors hover:bg-surface-muted/50"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    CELL,
                    column.align === "right" && "text-right tabular-nums",
                    column.className,
                  )}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
