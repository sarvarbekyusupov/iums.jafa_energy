/**
 * SolisCloud sends each figure with its own unit string beside it (eTotal 4.49 with eTotalStr
 * "MWh", pac 0.5 with pacStr "kW"), and the unit changes as the number grows. Reading the number
 * alone showed 4.49 MWh as "4.49 kWh"; these convert to one unit.
 */
const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function toKwh(value: unknown, unit?: string | null): number {
  const v = num(value);
  switch ((unit || 'kWh').trim()) {
    case 'Wh':
      return v / 1000;
    case 'MWh':
      return v * 1000;
    case 'GWh':
      return v * 1_000_000;
    default:
      return v;
  }
}

export function toKw(value: unknown, unit?: string | null): number {
  const v = num(value);
  switch ((unit || 'kW').trim()) {
    case 'W':
      return v / 1000;
    case 'MW':
      return v * 1000;
    default:
      return v;
  }
}

/** Epoch milliseconds (number or digit string) or a date string, as "YYYY-MM-DD HH:mm:ss" local time. */
export function formatSolisTime(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const ms = /^\d+$/.test(String(value)) ? Number(value) : Date.parse(String(value));
  if (!Number.isFinite(ms)) return undefined;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
