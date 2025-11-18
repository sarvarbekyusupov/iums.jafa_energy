import { hopeCloudService } from './hopecloud.service';
import { solisCloudService } from './soliscloud.service';
import fsolarService from './fsolar.service';

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
   * Fetch data from HopeCloud API
   */
  private async fetchHopeCloudData(): Promise<UnifiedSolarData> {
    try {
      // Fetch stations without pagination parameters (HopeCloud API works better without them)
      const stationsResponse = await hopeCloudService.getStations();
      const stations = stationsResponse.data?.records || [];

      // Calculate statistics
      const totalStations = stations.length;
      const onlineStations = stations.filter(s => s.status === 1).length;
      const totalEnergyToday = stations.reduce((sum, s) => sum + (s.todayKwh || 0), 0);
      const totalEnergyMonth = stations.reduce((sum, s) => sum + (s.monKwh || 0), 0);
      const totalEnergyYear = stations.reduce((sum, s) => sum + (s.yearKwh || 0), 0);
      const totalEnergyLifetime = stations.reduce((sum, s) => sum + (s.sumKwh || 0), 0);
      const currentPower = stations.reduce((sum, s) => sum + (s.nowKw || 0), 0);

      // Try to fetch alarms (without pagination - HopeCloud API handles this internally)
      let activeAlarms = 0;
      let criticalAlarms = 0;
      let warningAlarms = 0;
      try {
        const alarmsResponse = await hopeCloudService.getActiveAlarms({ pageIndex: 1, pageSize: 10 });
        const alarms = alarmsResponse.data || [];
        activeAlarms = alarms.filter(a => a.status === 'active').length;
        criticalAlarms = alarms.filter(a => a.severity === 'critical' && a.status === 'active').length;
        warningAlarms = alarms.filter(a => a.severity === 'warning' && a.status === 'active').length;
      } catch (error) {
        console.warn('Failed to fetch HopeCloud alarms:', error);
      }

      return {
        provider: 'HopeCloud',
        stations: {
          total: totalStations,
          online: onlineStations,
          offline: totalStations - onlineStations,
        },
        energy: {
          today: totalEnergyToday,
          thisMonth: totalEnergyMonth,
          thisYear: totalEnergyYear,
          total: totalEnergyLifetime,
        },
        power: {
          current: currentPower,
          peak: Math.max(...stations.map(s => s.nowKw || 0), 0),
        },
        devices: {
          total: 0, // Will be calculated from devices if needed
          online: 0,
          offline: 0,
          warning: 0,
        },
        alarms: {
          active: activeAlarms,
          critical: criticalAlarms,
          warning: warningAlarms,
        },
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching HopeCloud data:', error);
      return this.getEmptyProviderData('HopeCloud');
    }
  }

  /**
   * Fetch data from SolisCloud API
   */
  private async fetchSolisCloudData(): Promise<UnifiedSolarData> {
    try {
      // Fetch stations using detail list API (same as working SolisCloud dashboard)
      // Note: Using pageSize of 100 to match the working dashboard (1000 causes 400 error)
      const stationsParams = { pageNo: 1, pageSize: 100 };
      const stationsResponse = await solisCloudService.getStationDetailList(stationsParams);
      const stations = stationsResponse.records || [];

      // Fetch inverters using real-time API
      const invertersParams = { pageNo: 1, pageSize: 100 };
      const invertersResponse = await solisCloudService.getInverterList(invertersParams);
      const inverters = invertersResponse.page?.records || [];

      // Calculate statistics
      const totalStations = stations.length;
      const totalInverters = inverters.length;
      const onlineInverters = inverters.filter((inv: any) => inv.state === 1).length;
      const warningInverters = inverters.filter((inv: any) => inv.state === 3).length;

      const totalEnergyToday = stations.reduce((sum: number, s: any) => sum + (s.eToday || 0), 0);
      const totalEnergyLifetime = stations.reduce((sum: number, s: any) => sum + (s.eTotal || 0), 0);
      const currentPower = stations.reduce((sum: number, s: any) => sum + (s.pac || 0), 0);

      // Try to fetch alarms
      let activeAlarms = 0;
      let criticalAlarms = 0;
      let warningAlarms = 0;
      try {
        const alarmsParams = {
          pageNo: 1,
          pageSize: 100,
        };
        const alarmsResponse = await solisCloudService.getAlarmList(alarmsParams);
        const alarms = alarmsResponse.records || [];
        activeAlarms = alarms.filter((a: any) => a.state === '0').length; // 0 = ongoing
        criticalAlarms = alarms.filter((a: any) => a.alarmLevel === '3' && a.state === '0').length;
        warningAlarms = alarms.filter((a: any) => a.alarmLevel === '1' && a.state === '0').length;
      } catch (error) {
        console.warn('Failed to fetch SolisCloud alarms:', error);
      }

      return {
        provider: 'SolisCloud',
        stations: {
          total: totalStations,
          online: stations.filter((s: any) => s.state === 1).length,
          offline: stations.filter((s: any) => s.state !== 1).length,
        },
        energy: {
          today: totalEnergyToday,
          thisMonth: 0, // Not available in direct API
          thisYear: 0,  // Not available in direct API
          total: totalEnergyLifetime,
        },
        power: {
          current: currentPower,
          peak: Math.max(...stations.map((s: any) => s.pac || 0), 0),
        },
        devices: {
          total: totalInverters,
          online: onlineInverters,
          offline: totalInverters - onlineInverters - warningInverters,
          warning: warningInverters,
        },
        alarms: {
          active: activeAlarms,
          critical: criticalAlarms,
          warning: warningAlarms,
        },
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching SolisCloud data:', error);
      return this.getEmptyProviderData('SolisCloud');
    }
  }

  /**
   * Fetch data from FSolar API
   */
  private async fetchFSolarData(): Promise<UnifiedSolarData> {
    try {
      // Fetch devices using DB API
      const devicesResponse = await fsolarService.getDbDevices({ page: 1, limit: 100 });
      const devices = devicesResponse.data?.data || [];

      const totalDevices = devices.length;
      const onlineDevices = devices.filter((d: any) => d.status === 'online').length;

      // Fetch energy data
      let totalEnergyToday = 0;
      let currentPower = 0;
      try {
        const energyResponse = await fsolarService.getDbEnergy({ limit: 100 });
        const energyData = energyResponse.data?.data || [];

        // Calculate today's energy (assuming the API returns recent data)
        const today = new Date().toISOString().split('T')[0];
        const todayEnergy = energyData.filter((e: any) =>
          e.timestamp && e.timestamp.startsWith(today)
        );
        totalEnergyToday = todayEnergy.reduce((sum: number, e: any) => sum + (e.production || 0), 0);
      } catch (error) {
        console.warn('Failed to fetch FSolar energy data:', error);
      }

      // Try to fetch events/alarms
      let activeAlarms = 0;
      let criticalAlarms = 0;
      let warningAlarms = 0;
      try {
        const eventsResponse = await fsolarService.getDbEvents({ status: 'active', limit: 100 });
        const events = eventsResponse.data?.data || [];
        activeAlarms = events.length;
        criticalAlarms = events.filter((e: any) => e.alarmLevel === 1).length;
        warningAlarms = events.filter((e: any) => e.alarmLevel === 4).length;
      } catch (error) {
        console.warn('Failed to fetch FSolar events:', error);
      }

      return {
        provider: 'FSolar',
        stations: {
          total: 0, // FSolar doesn't have stations concept
          online: 0,
          offline: 0,
        },
        energy: {
          today: totalEnergyToday,
          thisMonth: 0, // Would need to calculate from historical data
          thisYear: 0,  // Would need to calculate from historical data
          total: 0,     // Would need to calculate from historical data
        },
        power: {
          current: currentPower,
          peak: 0,
        },
        devices: {
          total: totalDevices,
          online: onlineDevices,
          offline: totalDevices - onlineDevices,
          warning: 0,
        },
        alarms: {
          active: activeAlarms,
          critical: criticalAlarms,
          warning: warningAlarms,
        },
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching FSolar data:', error);
      return this.getEmptyProviderData('FSolar');
    }
  }

  /**
   * Get empty provider data template
   */
  private getEmptyProviderData(provider: 'HopeCloud' | 'SolisCloud' | 'FSolar'): UnifiedSolarData {
    return {
      provider,
      stations: { total: 0, online: 0, offline: 0 },
      energy: { today: 0, thisMonth: 0, thisYear: 0, total: 0 },
      power: { current: 0, peak: 0 },
      devices: { total: 0, online: 0, offline: 0, warning: 0 },
      alarms: { active: 0, critical: 0, warning: 0 },
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Fetch unified data from all solar providers
   */
  async getUnifiedSolarData(): Promise<UnifiedSolarSummary> {
    try {
      // Fetch data from all providers in parallel
      const [hopeCloudData, solisCloudData, fsolarData] = await Promise.all([
        this.fetchHopeCloudData(),
        this.fetchSolisCloudData(),
        this.fetchFSolarData(),
      ]);

      const providers = [hopeCloudData, solisCloudData, fsolarData];

      // Calculate totals
      const totalStations = providers.reduce((sum, p) => sum + p.stations.total, 0);
      const totalDevices = providers.reduce((sum, p) => sum + p.devices.total, 0);
      const totalEnergyToday = providers.reduce((sum, p) => sum + p.energy.today, 0);
      const totalEnergyMonth = providers.reduce((sum, p) => sum + p.energy.thisMonth, 0);
      const totalEnergyYear = providers.reduce((sum, p) => sum + p.energy.thisYear, 0);
      const totalEnergyLifetime = providers.reduce((sum, p) => sum + p.energy.total, 0);
      const totalCurrentPower = providers.reduce((sum, p) => sum + p.power.current, 0);
      const totalActiveAlarms = providers.reduce((sum, p) => sum + p.alarms.active, 0);

      return {
        totalStations,
        totalDevices,
        totalEnergyToday,
        totalEnergyMonth,
        totalEnergyYear,
        totalEnergyLifetime,
        totalCurrentPower,
        totalActiveAlarms,
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
