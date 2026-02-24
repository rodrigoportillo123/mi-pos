export type Preset = "today" | "last7" | "thisMonth" | "custom";

export function startOfDayLocal(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
export function startOfMonthLocal(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

// ISO sin timezone “Z” puede confundir; usamos ISO normal (UTC) para Postgres.
// Está bien para reportes (para full precisión por zona, lo refinamos luego).
export function toISO(d: Date) {
  return d.toISOString();
}

export function formatDayKey(d: Date) {
  // YYYY-MM-DD en local
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}