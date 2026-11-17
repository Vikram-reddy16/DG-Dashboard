"use client";

// Reusable table used across the dashboard. It has a fixed height; the header is
// sticky and the rows scroll inside it, so the page never grows with the data. Pass a `columns` spec and `rows`; each column renders a cell.
//
// column = {
//   key,                      // unique string
//   header,                   // node shown in the header
//   cell: (row) => node,      // cell contents
//   align: "left"|"center"|"right",
//   width,                    // optional fixed column width (px or css)
//   className,                // applied to BOTH <th> and <td> (e.g. "hidden xl:table-cell")
//   thClassName, tdClassName, // header-only / cell-only extras
// }

// Headers must look identical: drop any text-size/colour/weight utilities that a
// column passes for its cells, keeping only layout ones (e.g. "hidden xl:table-cell").
const headClass = (cls = "") =>
  cls.split(/\s+/).filter((t) => t && !/(^|:)(text-|font-|tabular|whitespace-|truncate)/.test(t)).join(" ");

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

export default function DataTable({
  columns,
  rows,
  rowKey,
  onRowClick,
  rowClassName,
  loading = false,
  loadingLabel = "Loading…",
  empty = null,
  minWidth = 820,
  height = "calc(100vh - 400px)",
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-auto" style={{ height, minHeight: 320 }}>
        <table className="w-full text-left border-collapse" style={{ minWidth }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width, fontSize: "0.72rem", fontWeight: 600, color: "var(--faint)", whiteSpace: "nowrap", boxShadow: "inset 0 -1px 0 var(--border)" }}
                  className={`t-head sticky top-0 z-10 bg-card px-3 first:pl-5 last:pr-5 py-3 font-semibold ${alignClass[c.align] || "text-left"} ${headClass(c.className)} ${c.thClassName || ""}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-14 text-center text-[0.84rem] text-faint">
                  {loadingLabel}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">{empty}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-border last:border-0 row-hover ${onRowClick ? "cursor-pointer" : ""} ${rowClassName ? rowClassName(row) : ""}`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 first:pl-5 last:pr-5 py-3.5 ${alignClass[c.align] || "text-left"} ${c.className || ""} ${c.tdClassName || ""}`}
                    >
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
