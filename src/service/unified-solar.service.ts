import { apiClient } from './api-client';
import { ApiUrls } from '../api/api-urls';
import type { ProviderSyncHealth, SyncStatus } from './sync-health.service';

export interface UnifiedSolarData {
  provider: 'HopeCloud' | 'SolisCloud' | 'FSolar';
  stations: {
    total: number;
    online: number;
    offline: number;
  };
  energy: {
    today: number;        // kWh
    thisMonth: number;    // kWh
    thisYear: number;     // kWh
    total: number;        // kWh
  };
  power: {
    current: number;      // kW
    peak: number;         // kW
  };
  devices: {
    total: number;
    online: number;
    offline: number;
    warning: number;
  };
  alarms: {
    active: number;
    critical: number;
    warning: number;
  };
  /** Newest data point we hold for this provider (ISO); null when nothing is stored yet */
  lastUpdate: string | null;
  syncStatus: SyncStatus;
  /** True when the vendor sync is behind and the numbers are the last stored values */
  stale: boolean;
}

export interface UnifiedSolarSummary {
  totalStations: number;
  totalDevices: number;
  totalEnergyToday: number;
  totalEnergyMonth: number;
  totalEnergyYear: number;
  totalEnergyLifetime: number;
  totalCurrentPower: number;
  totalActiveAlarms: number;
  providers: UnifiedSolarData[];
  /** Oldest contributing provider's newest data point (ISO); null when nothing is stored yet */
  lastUpdate: string | null;
  /** True when any contributing provider is not fresh */
  stale: boolean;
  providersHealth?: ProviderSyncHealth[];
}

/** Freshness keys added by the backend; older backends omit them, so every field is optional. */
interface ProviderFreshnessBlock {
  dataAsOf?: string | null;
  syncStatus?: SyncStatus;
  stale?: boolean;
}

function freshnessFrom(block: ProviderFreshnessBlock | undefined): Pick<UnifiedSolarData, 'lastUpdate' | 'syncStatus' | 'stale'> {
  return {
    lastUpdate: block?.dataAsOf ?? null,
    syncStatus: block?.syncStatus ?? 'unknown',
    stale: block?.stale ?? false,
  };
}

class UnifiedSolarService {
  /**
   * Fetch unified data from backend API
   * Backend automatically filters data based on user role and assignments
   */
  async getUnifiedSolarData(): Promise<UnifiedSolarSummary> {
    try {
      const response = await apiClient.get(ApiUrls.UNIFIED_SOLAR.GET_DATA);
      // Backend returns { status: "success", data: {...} }
      const backendData = response.data.data || response.data;

      // Transform backend response to match frontend structure
      const providers: UnifiedSolarData[] = [];

      // HopeCloud data - only add if user has stations
      if (backendData.hopecloud && backendData.hopecloud.totalStations > 0) {
        providers.push({
          provider: 'HopeCloud',
          stations: {
            total: backendData.hopecloud.totalStations || 0,
            online: backendData.hopecloud.totalOnline || 0,
            offline: backendData.hopecloud.totalOffline || 0,
          },
          energy: {
            today: backendData.hopecloud.totalEnergyToday || 0,
            thisMonth: backendData.hopecloud.totalEnergyMonth || 0,
            thisYear: backendData.hopecloud.totalEnergyYear || 0,
            total: backendData.hopecloud.totalEnergyLifetime || 0,
          },
          power: {
            current: backendData.hopecloud.totalPower || 0,
            peak: backendData.hopecloud.peakPower || 0,
          },
          devices: {
            total: 0,
            online: 0,
            offline: 0,
            warning: 0,
          },
          alarms: {
            active: backendData.hopecloud.totalAlarms || 0,
            critical: 0,
            warning: 0,
          },
          ...freshnessFrom(backendData.hopecloud),
        });
      }

      // SolisCloud data - only add if user has stations
      if (backendData.soliscloud && backendData.soliscloud.totalStations > 0) {
        providers.push({
          provider: 'SolisCloud',
          stations: {
            total: backendData.soliscloud.totalStations || 0,
            online: backendData.soliscloud.totalOnline || 0,
            offline: backendData.soliscloud.totalOffline || 0,
          },
          energy: {
            today: backendData.soliscloud.totalEnergyToday || 0,
            thisMonth: backendData.soliscloud.totalEnergyMonth || 0,
            thisYear: backendData.soliscloud.totalEnergyYear || 0,
            total: backendData.soliscloud.totalEnergyLifetime || 0,
          },
          power: {
            current: backendData.soliscloud.totalPower || 0,
            peak: backendData.soliscloud.peakPower || 0,
          },
          devices: {
            total: backendData.soliscloud.totalInverters || 0,
            online: backendData.soliscloud.totalOnlineInverters || 0,
            offline: backendData.soliscloud.totalOfflineInverters || 0,
            warning: 0,
          },
          alarms: {
            active: backendData.soliscloud.totalAlarms || 0,
            critical: 0,
            warning: 0,
          },
          ...freshnessFrom(backendData.soliscloud),
        });
      }

      // FSolar data - only add if user has devices
      // Check multiple possible field names from backend
      const fsolarDeviceCount = backendData.fsolar?.totalDevices ||
                                backendData.fsolar?.totalStations ||
                                backendData.fsolar?.deviceCount || 0;

      if (backendData.fsolar && fsolarDeviceCount > 0) {
        providers.push({
          provider: 'FSolar',
          stations: {
            total: fsolarDeviceCount,
            online: backendData.fsolar.totalOnline || backendData.fsolar.onlineCount || 0,
            offline: backendData.fsolar.totalOffline || backendData.fsolar.offlineCount || 0,
          },
          energy: {
            today: backendData.fsolar.totalEnergyToday || 0,
            thisMonth: backendData.fsolar.totalEnergyMonth || 0,
            thisYear: backendData.fsolar.totalEnergyYear || 0,
            total: backendData.fsolar.totalEnergyLifetime || 0,
          },
          power: {
            current: backendData.fsolar.totalPower || 0,
            peak: backendData.fsolar.peakPower || 0,
          },
          devices: {
            total: backendData.fsolar.totalDevices || 0,
            online: backendData.fsolar.totalOnline || 0,
            offline: backendData.fsolar.totalOffline || 0,
            warning: 0,
          },
          alarms: {
            active: backendData.fsolar.totalAlarms || 0,
            critical: 0,
            warning: 0,
          },
          ...freshnessFrom(backendData.fsolar),
        });
      }

      // Return transformed data
      return {
        totalStations: backendData.summary?.totalStations || 0,
        totalDevices: backendData.summary?.totalDevices || 0,
        totalEnergyToday: backendData.summary?.totalEnergyToday || 0,
        totalEnergyMonth: backendData.summary?.totalEnergyMonth || 0,
        totalEnergyYear: backendData.summary?.totalEnergyYear || 0,
        totalEnergyLifetime: backendData.summary?.totalEnergyLifetime || 0,
        totalCurrentPower: backendData.summary?.totalPower || 0,
        totalActiveAlarms: backendData.summary?.totalAlarms || 0,
        providers,
        // Honest timestamp: the backend reports the oldest contributing provider's newest row,
        // never "now". Older backends omit it, so fall back to null / not stale.
        lastUpdate: backendData.summary?.dataAsOf ?? null,
        stale: backendData.summary?.stale ?? false,
        providersHealth: Array.isArray(backendData.summary?.providersHealth)
          ? (backendData.summary.providersHealth as ProviderSyncHealth[])
          : undefined,
      };
    } catch (error) {
      console.error('Error fetching unified solar data:', error);
      throw error;
    }
  }

  /**
   * Get comparison data for charts and analytics
   */
  async getProviderComparison() {
    try {
      const response = await apiClient.get(ApiUrls.UNIFIED_SOLAR.GET_COMPARISON);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider comparison:', error);
      // Fallback: calculate from unified data
      const data = await this.getUnifiedSolarData();
      return {
        energyComparison: data.providers.map(p => ({
          provider: p.provider,
          today: p.energy.today,
          month: p.energy.thisMonth,
          year: p.energy.thisYear,
          total: p.energy.total,
        })),
        powerComparison: data.providers.map(p => ({
          provider: p.provider,
          current: p.power.current,
          peak: p.power.peak,
        })),
        deviceComparison: data.providers.map(p => ({
          provider: p.provider,
          total: p.devices.total,
          online: p.devices.online,
          offline: p.devices.offline,
          warning: p.devices.warning,
        })),
        alarmComparison: data.providers.map(p => ({
          provider: p.provider,
          active: p.alarms.active,
          critical: p.alarms.critical,
          warning: p.alarms.warning,
        })),
      };
    }
  }
}

export const unifiedSolarService = new UnifiedSolarService();
