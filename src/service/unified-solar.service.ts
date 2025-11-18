import { apiCall } from '../helpers';
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

// Backend API response type
interface BackendUnifiedSolarResponse {
  hopecloud: {
    stations: any[];
    summary: {
      totalStations: number;
      onlineStations: number;
      totalEnergyToday: number;
      totalEnergyMonth: number;
      totalEnergyYear: number;
      totalEnergyLifetime: number;
      currentPower: number;
      peakPower: number;
    };
    alarms: {
      active: number;
      critical: number;
      warning: number;
    };
  };
  soliscloud: {
    stations: any[];
    inverters: any[];
    summary: {
      totalStations: number;
      onlineStations: number;
      totalInverters: number;
      onlineInverters: number;
      warningInverters: number;
      totalEnergyToday: number;
      totalEnergyLifetime: number;
      currentPower: number;
      peakPower: number;
    };
    alarms: {
      active: number;
      critical: number;
      warning: number;
    };
  };
  fsolar: {
    devices: any[];
    summary: {
      totalDevices: number;
      onlineDevices: number;
      totalEnergyToday: number;
      currentPower: number;
    };
    alarms: {
      active: number;
      critical: number;
      warning: number;
    };
  };
  summary: {
    totalStations: number;
    totalDevices: number;
    totalEnergyToday: number;
    totalEnergyMonth: number;
    totalEnergyYear: number;
    totalEnergyLifetime: number;
    totalCurrentPower: number;
    totalActiveAlarms: number;
  };
}

class UnifiedSolarService {
  /**
   * Fetch unified data from backend API
   * The backend automatically filters data based on user role and assignments
   */
  async getUnifiedSolarData(): Promise<UnifiedSolarSummary> {
    try {
      // Call the new unified backend endpoint
      const response = await apiCall<{ data: BackendUnifiedSolarResponse }>({
        url: ApiUrls.UNIFIED_SOLAR.DATA,
        method: 'GET',
      });

      const backendData = response.data;

      // Transform HopeCloud data
      const hopeCloudData: UnifiedSolarData = {
        provider: 'HopeCloud',
        stations: {
          total: backendData.hopecloud.summary.totalStations,
          online: backendData.hopecloud.summary.onlineStations,
          offline: backendData.hopecloud.summary.totalStations - backendData.hopecloud.summary.onlineStations,
        },
        energy: {
          today: backendData.hopecloud.summary.totalEnergyToday,
          thisMonth: backendData.hopecloud.summary.totalEnergyMonth,
          thisYear: backendData.hopecloud.summary.totalEnergyYear,
          total: backendData.hopecloud.summary.totalEnergyLifetime,
        },
        power: {
          current: backendData.hopecloud.summary.currentPower,
          peak: backendData.hopecloud.summary.peakPower,
        },
        devices: {
          total: 0,
          online: 0,
          offline: 0,
          warning: 0,
        },
        alarms: {
          active: backendData.hopecloud.alarms.active,
          critical: backendData.hopecloud.alarms.critical,
          warning: backendData.hopecloud.alarms.warning,
        },
        lastUpdate: new Date().toISOString(),
      };

      // Transform SolisCloud data
      const solisCloudData: UnifiedSolarData = {
        provider: 'SolisCloud',
        stations: {
          total: backendData.soliscloud.summary.totalStations,
          online: backendData.soliscloud.summary.onlineStations,
          offline: backendData.soliscloud.summary.totalStations - backendData.soliscloud.summary.onlineStations,
        },
        energy: {
          today: backendData.soliscloud.summary.totalEnergyToday,
          thisMonth: 0, // Not available from SolisCloud
          thisYear: 0,  // Not available from SolisCloud
          total: backendData.soliscloud.summary.totalEnergyLifetime,
        },
        power: {
          current: backendData.soliscloud.summary.currentPower,
          peak: backendData.soliscloud.summary.peakPower,
        },
        devices: {
          total: backendData.soliscloud.summary.totalInverters,
          online: backendData.soliscloud.summary.onlineInverters,
          offline: backendData.soliscloud.summary.totalInverters - backendData.soliscloud.summary.onlineInverters - backendData.soliscloud.summary.warningInverters,
          warning: backendData.soliscloud.summary.warningInverters,
        },
        alarms: {
          active: backendData.soliscloud.alarms.active,
          critical: backendData.soliscloud.alarms.critical,
          warning: backendData.soliscloud.alarms.warning,
        },
        lastUpdate: new Date().toISOString(),
      };

      // Transform FSolar data
      const fsolarData: UnifiedSolarData = {
        provider: 'FSolar',
        stations: {
          total: 0, // FSolar doesn't have stations concept
          online: 0,
          offline: 0,
        },
        energy: {
          today: backendData.fsolar.summary.totalEnergyToday,
          thisMonth: 0, // Not available from FSolar
          thisYear: 0,  // Not available from FSolar
          total: 0,     // Not available from FSolar
        },
        power: {
          current: backendData.fsolar.summary.currentPower,
          peak: 0,
        },
        devices: {
          total: backendData.fsolar.summary.totalDevices,
          online: backendData.fsolar.summary.onlineDevices,
          offline: backendData.fsolar.summary.totalDevices - backendData.fsolar.summary.onlineDevices,
          warning: 0,
        },
        alarms: {
          active: backendData.fsolar.alarms.active,
          critical: backendData.fsolar.alarms.critical,
          warning: backendData.fsolar.alarms.warning,
        },
        lastUpdate: new Date().toISOString(),
      };

      const providers = [hopeCloudData, solisCloudData, fsolarData];

      return {
        totalStations: backendData.summary.totalStations,
        totalDevices: backendData.summary.totalDevices,
        totalEnergyToday: backendData.summary.totalEnergyToday,
        totalEnergyMonth: backendData.summary.totalEnergyMonth,
        totalEnergyYear: backendData.summary.totalEnergyYear,
        totalEnergyLifetime: backendData.summary.totalEnergyLifetime,
        totalCurrentPower: backendData.summary.totalCurrentPower,
        totalActiveAlarms: backendData.summary.totalActiveAlarms,
        providers,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching unified solar data from backend:', error);
      throw error;
    }
  }

  /**
   * Get comparison data for charts and analytics
   */
  async getProviderComparison() {
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

export const unifiedSolarService = new UnifiedSolarService();
