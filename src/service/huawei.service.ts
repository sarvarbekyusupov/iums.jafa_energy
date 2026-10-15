import { apiClient } from './api-client';

export type HuaweiStateKind =
  | 'standby'
  | 'starting'
  | 'on-grid'
  | 'shutdown'
  | 'scheduling'
  | 'testing'
  | 'comm-lost'
  | 'unknown';

/** Newest stored sample of an inverter. Temperature and efficiency are null outside 512-514. */
export interface HuaweiInverterLatest {
  readAt: string;
  activePower: number | null;
  temperature: number | null;
  efficiency: number | null;
  dayKwh: number | null;
  inverterState: number | null;
  /** The reference's wording (Table 5-1), English. */
  stateLabel: string | null;
  stateKind: HuaweiStateKind;
}

/** Newest stored sample of a power sensor (devTypeId 47). */
export interface HuaweiMeterLatest {
  readAt: string;
  /** W, not kW. */
  activePowerW: number | null;
  positiveKwh: number | null;
  negativeKwh: number | null;
  meterStatus: number | null;
}

export interface HuaweiDeviceRow {
  id: string;
  plantCode: string;
  sn: string | null;
  name: string | null;
  devTypeId: number;
  model: string | null;
  softwareVersion: string | null;
  latest: HuaweiInverterLatest | HuaweiMeterLatest | null;
}

export interface HuaweiSyncRun {
  id: number;
  job: string;
  startedAt: string;
  /** "success", "skipped" or "failed". */
  status: string;
  rows: number;
  error: string | null;
}

export interface HuaweiAlarmRow {
  id: number;
  sn: string | null;
  devName: string | null;
  alarmName: string;
  cause: string | null;
  repairSuggestion: string | null;
  /** 1 critical, 2 major, 3 minor, 4 warning. */
  level: number;
  raiseTime: string;
}

export interface HuaweiStationRow {
  plantCode: string;
  name: string;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  capacityKwp: string | null;
  gridConnectionDate: string | null;
  healthState: number | null;
  dayKwh: string | null;
  monthKwh: string | null;
  yearKwh: string | null;
  totalKwh: string | null;
  kpiAt: string | null;
  lastSyncedAt: string | null;
  /** Sum of the inverters' samples under 30 minutes old; null when there is none. */
  nowKw: number | null;
  /** Inverters' rated kW from the model name, for plants whose capacity is 0. */
  ratedKw: number | null;
  devices: HuaweiDeviceRow[];
  activeAlarms?: HuaweiAlarmRow[];
}

/** Huawei FusionSolar plants as our own sync stores them (admin only). */
class HuaweiService {
  async getStations(): Promise<HuaweiStationRow[]> {
    const response = await apiClient.get<{ data: HuaweiStationRow[] }>('/api/huawei/stations');
    return response.data.data;
  }

  async getSyncStatus(): Promise<{ enabled: boolean; recent: HuaweiSyncRun[] }> {
    const response = await apiClient.get<{ data: { enabled: boolean; recent: HuaweiSyncRun[] } }>(
      '/api/huawei/sync/status',
    );
    return response.data.data;
  }
}

export const huaweiService = new HuaweiService();
