function escapeCell(value) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(columns, rows) {
  const header = columns.map((column) => escapeCell(column.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCell(row[column.key])).join(","),
  );
  return [header, ...lines].join("\r\n");
}
