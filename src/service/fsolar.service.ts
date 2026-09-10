import dayjs from 'dayjs';
import { apiClient } from './api-client';

const DB_BASE_URL = '/api/fsolar/db';

// ==================== TYPES (mirror backend entities under /api/fsolar/db) ====================

/** Row of fsolar_devices. Decimal columns may arrive as "12.5" or 12.5 depending on backend version. */
export interface FsolarDbDevice {
  id: string;
  deviceSn: string;
  stationCode: string;
  name: string | null;
  deviceType?: string | null;
  status?: string | null;
  model: string | null;
  ratedPower: number | string | null;
  capacity: number | string | null;
  firmwareVersion: string | null;
  installationDate: string | null;
  manufacturer: string | null;
  commModuleSn: string | null;
  location: string | null;
  /** { list: vendor device-list item, basic: vendor basic-info } as stored by the sync job. */
  metadata: { list?: Record<string, any>; basic?: Record<string, any> } | null;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Row of fsolar_device_energy (5-minute point). Power columns are kW; rawData is the vendor point verbatim (W, strings). */
export interface FsolarDbDeviceEnergy {
  id?: string;
  deviceSn: string;
  stationCode: string;
  timestamp: string;
  activePower: number | string | null;
  reactivePower?: number | string | null;
  apparentPower?: number | string | null;
  powerFactor?: number | string | null;
  todayEnergy: number | string | null;
  totalEnergy: number | string | null;
  gridVoltage: number | string | null;
  gridCurrent: number | string | null;
  gridFrequency: number | string | null;
  feedInPower?: number | string | null;
  purchasePower: number | string | null;
  batteryVoltage: number | string | null;
  batteryCurrent: number | string | null;
  batteryPower: number | string | null;
  batterySoc: number | string | null;
  batterySoh?: number | string | null;
  pv1Voltage: number | string | null;
  pv1Current: number | string | null;
  pv1Power: number | string | null;
  pv2Voltage: number | string | null;
  pv2Current: number | string | null;
  pv2Power: number | string | null;
  totalPvPower: number | string | null;
  loadPower: number | string | null;
  runningStatus: number | string | null;
  temperature: number | string | null;
  rawData: Record<string, any> | null;
}

export interface FsolarDbPagination {
  page: number | string;
  limit: number | string;
  total: number | string;
  totalPages: number | string;
}

export interface FsolarDbListResponse<T> {
  success: boolean;
  data: T[];
  pagination?: FsolarDbPagination;
  count?: number;
  /** Newest row timestamp for the returned range (ISO), added by the energy endpoint. */
  dataAsOf?: string | null;
}

/**
 * Vendor-shaped point the Fsolar pages render (all values strings, power in W).
 * Built from rawData when present, otherwise from the entity columns.
 */
export interface FsolarVendorPoint {
  deviceSn: string;
  dataTimeStr: string;
  deviceDataTime: string;
  timeZone: string;
  [key: string]: any;
}

const DEFAULT_TIME_ZONE = 'UTC+05:00';

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const str = (v: number | null, digits = 1): string => (v === null ? '0' : v.toFixed(digits));
const kwToW = (v: unknown): string => str(num(v) === null ? null : num(v)! * 1000, 0);

/**
 * Map a stored energy row to the vendor point shape the pages already render.
 * rawData wins (it is the vendor point verbatim); entity columns only fill the gaps.
 */
export function energyRowToVendorPoint(row: FsolarDbDeviceEnergy): FsolarVendorPoint {
  const raw = (row.rawData || {}) as Record<string, any>;
  // Fallback for rows synced before rawData was stored: derive the vendor keys from the kW columns.
  const fromColumns: Record<string, string> = {
    pvPower: kwToW(row.pv1Power),
    pv2Power: kwToW(row.pv2Power),
    pvTotalPower: kwToW(row.totalPvPower),
    acTotalOutActPower: kwToW(row.activePower ?? row.loadPower),
    acTtlInpower: kwToW(row.purchasePower),
    meterPower: kwToW(row.purchasePower),
    emsPower: kwToW(row.batteryPower),
    emsSoc: str(num(row.batterySoc), 0),
    emsVoltage: str(num(row.batteryVoltage)),
    emsCurrent: str(num(row.batteryCurrent)),
    acRInVolt: str(num(row.gridVoltage)),
    acROutVolt: str(num(row.gridVoltage)),
    acRInCurr: str(num(row.gridCurrent)),
    acROutCurr: str(num(row.gridCurrent)),
    acRInFreq: str(num(row.gridFrequency), 2),
    pvVolt: str(num(row.pv1Voltage)),
    pvInCurr: str(num(row.pv1Current)),
    pv2Volt: str(num(row.pv2Voltage)),
    pv2InCurr: str(num(row.pv2Current)),
    tempMax: str(num(row.temperature)),
    devTempMax: str(num(row.temperature)),
    ePvToday: str(num(row.todayEnergy), 2),
    totalEnergy: str(num(row.totalEnergy), 2),
    workMode: row.runningStatus === null || row.runningStatus === undefined ? '' : String(row.runningStatus),
  };
  const dataTimeStr = raw.dataTimeStr || dayjs(row.timestamp).format('YYYY-MM-DD HH:mm:ss');
  return {
    ...fromColumns,
    ...raw,
    deviceSn: row.deviceSn,
    dataTimeStr,
    deviceDataTime: raw.deviceDataTime || dataTimeStr,
    timeZone: raw.timeZone || DEFAULT_TIME_ZONE,
  };
}

class FSolarService {
  // ==================== DEVICE MANAGEMENT ====================

  /**
   * Get all devices with pagination
   * @param params - page, limit
   * Returns { success, data: FsolarDbDevice[], pagination }. Kept as any: a caller outside this
   * module reads it loosely.
   */
  async getDbDevices(params?: { page?: number; limit?: number }): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/devices`, { params });
    return response.data;
  }

  /**
   * Get single device by device SN
   * @param deviceSn - Device serial number
   */
  async getDbDevice(deviceSn: string): Promise<{ success: boolean; data?: FsolarDbDevice; message?: string }> {
    const response = await apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}`);
    return response.data;
  }

  // ==================== ENERGY MONITORING ====================

  /**
   * Get device energy points (5-minute rows).
   * With `date` (YYYY-MM-DD, site local day) rows come back ASC for that day; with from/to (ISO) for that range;
   * otherwise newest-first limited by `limit`.
   */
  async getDbDeviceEnergy(
    deviceSn: string,
    params?: { limit?: number; date?: string; from?: string; to?: string }
  ): Promise<FsolarDbListResponse<FsolarDbDeviceEnergy>> {
    const response = await apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/energy`, { params });
    return response.data;
  }

  /**
   * Get latest energy reading for a device
   * @param deviceSn - Device serial number
   */
  async getDbDeviceEnergyLatest(deviceSn: string): Promise<{ success: boolean; data: FsolarDbDeviceEnergy | null }> {
    const response = await apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/energy/latest`);
    return response.data;
  }

  /**
   * Get all energy data with pagination
   * @param params - page, limit, deviceSn (filter)
   */
  async getDbEnergy(params?: { page?: number; limit?: number; deviceSn?: string }): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/energy`, { params });
    return response.data;
  }

  // ==================== HISTORICAL DATA ====================

  /**
   * Get device historical data (daily/monthly/yearly aggregates, not the 5-minute points)
   * @param deviceSn - Device serial number
   * @param params - granularity (daily/monthly/yearly), limit
   */
  async getDbDeviceHistory(
    deviceSn: string,
    params?: { granularity?: 'daily' | 'monthly' | 'yearly'; limit?: number }
  ): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/history`, { params });
    return response.data;
  }

  /**
   * Get all historical data with pagination
   * @param params - page, limit, deviceSn, granularity
   */
  async getDbHistory(params?: {
    page?: number;
    limit?: number;
    deviceSn?: string;
    granularity?: 'daily' | 'monthly' | 'yearly';
  }): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/history`, { params });
    return response.data;
  }

  // ==================== EVENTS & ALARMS ====================

  /**
   * Get device events
   * @param deviceSn - Device serial number
   * @param params - limit
   */
  async getDbDeviceEvents(deviceSn: string, params?: { limit?: number }): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/events`, { params });
    return response.data;
  }

  /**
   * Get all events with pagination
   * @param params - page, limit, deviceSn, status
   */
  async getDbEvents(params?: {
    page?: number;
    limit?: number;
    deviceSn?: string;
    status?: 'active' | 'cleared' | 'acknowledged';
  }): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/events`, { params });
    return response.data;
  }

  /**
   * Get active events only
   * @param params - limit
   */
  async getDbActiveEvents(params?: { limit?: number }): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/events/active`, { params });
    return response.data;
  }

  // ==================== SYNC OPERATIONS ====================

  /**
   * Trigger manual sync
   * @param data - types array, optional date
   */
  async triggerDbSync(data: {
    types: ('devices' | 'energy' | 'history_daily' | 'events' | 'full')[];
    date?: string;
  }): Promise<any> {
    const response = await apiClient.post(`${DB_BASE_URL}/sync/trigger`, data);
    return response.data;
  }

  /**
   * Get sync status
   */
  async getDbSyncStatus(): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/sync/status`);
    return response.data;
  }

  /**
   * Get sync history logs
   * @param params - page, limit, type (filter)
   */
  async getDbSyncHistory(params?: { page?: number; limit?: number; type?: string }): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/sync/history`, { params });
    return response.data;
  }

  /**
   * Get database statistics
   */
  async getDbStats(): Promise<any> {
    const response = await apiClient.get(`${DB_BASE_URL}/stats`);
    return response.data;
  }
}

export default new FSolarService();
