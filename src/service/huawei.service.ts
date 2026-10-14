import { apiClient } from './api-client';

export interface HuaweiDeviceRow {
  id: string;
  plantCode: string;
  sn: string | null;
  name: string | null;
  devTypeId: number;
  model: string | null;
  softwareVersion: string | null;
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
  devices: HuaweiDeviceRow[];
}

/** Huawei FusionSolar plants as our own sync stores them (admin only). */
class HuaweiService {
  async getStations(): Promise<HuaweiStationRow[]> {
    const response = await apiClient.get<{ data: HuaweiStationRow[] }>('/api/huawei/stations');
    return response.data.data;
  }
}

export const huaweiService = new HuaweiService();
