import { apiClient } from './api-client';
import { ApiUrls } from '../api/api-urls';

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
  lastUpdate: string;
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
  lastUpdate: string;
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

      console.log('🔍 Backend raw data:', JSON.stringify(backendData, null, 2));

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
          lastUpdate: new Date().toISOString(),
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
          lastUpdate: new Date().toISOString(),
        });
      }

      // FSolar data - only add if user has devices
      if (backendData.fsolar && backendData.fsolar.totalDevices > 0) {
        providers.push({
          provider: 'FSolar',
          stations: {
            total: 0,
            online: 0,
            offline: 0,
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
          lastUpdate: new Date().toISOString(),
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
        lastUpdate: new Date().toISOString(),
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
