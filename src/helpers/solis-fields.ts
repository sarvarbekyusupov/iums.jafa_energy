import { toKw } from './solis-units';

/** stationTypeNew, as the SolisCloud API document lists it (Appendix 2). The fleet uses 0, 1, 9 and 10. */
const STATION_TYPES: Record<number, string> = {
  0: 'Grid-tied',
  1: 'Energy storage',
  2: 'AC Couple',
  3: 'EPM (grid + meter)',
  4: 'Built-in meter (grid + meter)',
  5: 'External meter (display meter)',
  6: 'S5 off-grid parallel storage',
  7: 'S5 grid parallel storage',
  8: 'Grid + AC Couple',
  9: 'Off-grid energy storage',
  10: 'S6 grid parallel storage',
  11: 'S6 off-grid parallel storage',
};

export function solisStationType(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  return STATION_TYPES[Number(value)];
}

/**
 * DC input power in kW: the sum of pow1..pow32. The detail has no total (the old `pdc` key never
 * existed); each powN comes with its own powNStr, "W" on every fleet inverter in 2026-10.
 */
export function solisDcPowerKw(detail: Record<string, any> | null | undefined): number | undefined {
  if (!detail) return undefined;
  let sum = 0;
  let seen = false;
  for (let n = 1; n <= 32; n++) {
    const v = detail[`pow${n}`];
    if (v === undefined || v === null || v === '') continue;
    seen = true;
    sum += toKw(v, detail[`pow${n}Str`] ?? 'W');
  }
  return seen ? sum : undefined;
}

/**
 * In a parallel group (parallelNumber > 1) the master, parallelAddr 1, reports the whole group's
 * AC power as its own pac. OOO Spaytch X has four S6 units in one group.
 */
export function isSolisParallelMaster(detail: Record<string, any> | null | undefined): boolean {
  return Number(detail?.parallelNumber) > 1 && Number(detail?.parallelAddr) === 1;
}

export type WarrantyStatus = 'active' | 'expired' | 'unknown';

/**
 * shelfState is 0 (under warranty) or 1 (expired) per the document, but the shelfTime endpoint
 * also returns "--" for an inverter it has no warranty for; that is unknown, not expired. An end
 * date, when there is one, is the better answer.
 */
export function solisWarrantyStatus(shelfState: unknown, endTime?: unknown, now = Date.now()): WarrantyStatus {
  const end = Number(endTime);
  if (Number.isFinite(end) && end > 0) return end > now ? 'active' : 'expired';
  const s = String(shelfState ?? '').trim();
  if (s === '0') return 'active';
  if (s === '1') return 'expired';
  return 'unknown';
}

/**
 * A stationDay record's real instant, the same way the backend sync places it
 * (soliscloud-sync.service.ts toStationInstant). timeStr is the station's wall clock; the epoch
 * `time` is that wall clock re-encoded as if it were UTC+8, so plotting it directly put the Day
 * curve 3 hours early.
 */
export function solisDayInstant(dateYmd: string, r: Record<string, any>, offsetHours = 5): string | undefined {
  const sign = offsetHours >= 0 ? '+' : '-';
  const tz = `${sign}${String(Math.floor(Math.abs(offsetHours))).padStart(2, '0')}:${String(Math.round((Math.abs(offsetHours) % 1) * 60)).padStart(2, '0')}`;
  for (const candidate of [r?.timeStr, r?.dataTimeStr, r?.dataTime, r?.time]) {
    if (typeof candidate !== 'string') continue;
    const m = candidate.trim().match(/^(?:(\d{4}-\d{2}-\d{2})[ T])?(\d{2}:\d{2})(?::(\d{2}))?$/);
    if (!m) continue;
    const d = new Date(`${m[1] ?? dateYmd}T${m[2]}:${m[3] ?? '00'}${tz}`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  for (const candidate of [r?.time, r?.dataTime]) {
    const epoch = Number(candidate);
    if (Number.isFinite(epoch) && epoch > 1_000_000_000_000) {
      return new Date(epoch + (8 - offsetHours) * 3_600_000).toISOString();
    }
  }
  return undefined;
}
