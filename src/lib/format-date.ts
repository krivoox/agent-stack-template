/**
 * Formato de fecha para tablas y listados: `DD/MM/YYYY`.
 * Acepta `DateOnly` (`YYYY-MM-DD`) o `Date` y siempre lee en UTC, porque las
 * fechas contables se guardan como día calendario (`@db.Date`).
 */
export function formatDateOnly(value: Date | string): string {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getUTCFullYear()}`;
}
