/**
 * Field helpers for HopeCloud (Hopewind) data, matched to the vendor's Open API document and
 * to what the fleet's inverters actually send.
 */

export interface HopeCloudParamItem {
  key: string;
  name?: string;
  unit?: string;
  value: unknown;
}

/** Equipment status codes (getEquipmentListByPlantId / getEquipmentDetail). */
const INVERTER_STATUS: Record<number, { label: string; badge: 'success' | 'default' | 'warning' | 'error' }> = {
  1: { label: 'Online', badge: 'success' },
  2: { label: 'Shutdown', badge: 'default' },
  3: { label: 'Shutdown alarm', badge: 'warning' },
  5: { label: 'Fault', badge: 'error' },
  6: { label: 'Offline', badge: 'error' },
};

export function inverterStatus(code: unknown): { label: string; badge: 'success' | 'default' | 'warning' | 'error' } {
  return INVERTER_STATUS[Number(code)] ?? { label: code === undefined || code === null ? 'Unknown' : `Status ${code}`, badge: 'default' };
}

/** Datalogger type codes seen in getDivertorListByPlantId (every fleet logger is 707). */
export function moduleTypeLabel(type: unknown): string {
  const t = String(type ?? '');
  if (t === '707') return 'WiFi';
  if (t === '705') return '4G';
  return t || 'Unknown';
}

/** Alarm type: vendor codes 3 / 5, or what device_alarms stores ("shutdown" / "fault"). */
export function alarmTypeLabel(type: unknown): string {
  const t = String(type ?? '').toLowerCase();
  if (t === '3' || t === 'shutdown') return 'Shutdown alarm';
  if (t === '5' || t === 'fault') return 'Fault';
  return t ? String(type) : 'Alarm';
}

export function alarmGradeLabel(grade: unknown): string {
  const g = String(grade ?? '');
  if (g === '2') return 'Severe';
  if (g === '1') return 'General';
  if (g === '0') return 'Prompt';
  return 'Unknown';
}

/**
 * Vendor alarm record (getUserFaultData / getEquipmentFaultData: id, powerPlantName,
 * reportedTime, status "0"/"1") in the shape the page renders, which the stored alarms already
 * have.
 */
export function normalizeHopeCloudAlarm<T extends Record<string, any>>(a: T): T & {
  alarmId: string;
  plantName?: string;
  occurredAt?: string;
  message?: string;
  status: string;
} {
  const status = a.status === '0' || a.status === 0 ? 'active' : a.status === '1' || a.status === 1 ? 'resolved' : a.status;
  return {
    ...a,
    alarmId: a.alarmId ?? a.id,
    plantName: a.plantName ?? a.powerPlantName,
    occurredAt: a.occurredAt ?? a.reportedTime,
    message: a.message ?? a.alarmContent,
    status,
  };
}

/**
 * A HopeCloud time for display. Vendor strings ("2026-10-02 17:56:27") are already plant
 * wall-clock time and are shown as they are (new Date() reads them in the browser's zone, and
 * Safari not at all); ISO strings from our own tables are shown in local time.
 */
export function formatHopeCloudTime(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(text)) return text;
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? text : d.toLocaleString();
}

/** Short place line for a station: city/province when the vendor has them, else the address. */
export function stationPlace(station: { city?: string | null; province?: string | null; address?: string | null } | null | undefined): string {
  if (!station) return '';
  const parts = [station.city, station.province].filter((p) => typeof p === 'string' && p.trim() !== '');
  return parts.length > 0 ? parts.join(', ') : station.address || '';
}

export function paramNumber(list: HopeCloudParamItem[] | undefined | null, key: string): number | undefined {
  const item = list?.find((p) => p.key === key);
  if (!item || item.value === null || item.value === undefined || item.value === '') return undefined;
  const n = typeof item.value === 'number' ? item.value : parseFloat(String(item.value));
  return Number.isFinite(n) ? n : undefined;
}

export function paramText(list: HopeCloudParamItem[] | undefined | null, key: string): string | undefined {
  const item = list?.find((p) => p.key === key);
  if (!item || item.value === null || item.value === undefined) return undefined;
  const text = String(item.value).trim();
  return text || undefined;
}

export function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : undefined;
}
