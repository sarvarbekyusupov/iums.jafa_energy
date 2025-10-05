export class ApiUrls {
  private static readonly BASE_URL = "/api";

  // AUTH ENDPOINTS
  public static readonly AUTH = {
    LOGIN: `${this.BASE_URL}/users/login`,
    LOGOUT: `${this.BASE_URL}/users/logout`,
    REFRESH: `${this.BASE_URL}/users/refresh`,
    REGISTER: `${this.BASE_URL}/users`,
    ACTIVATE: `${this.BASE_URL}/users/activate`,
    FORGOT_PASSWORD: `${this.BASE_URL}/users/forgot-password`,
    RESET_PASSWORD: `${this.BASE_URL}/users/reset-password`,
  };

  // USER ENDPOINTS
  public static readonly USERS = {
    BASE: `${this.BASE_URL}/users`,
    GET_ALL: `${this.BASE_URL}/users`,
    GET_BY_ID: (id: number) => `${this.BASE_URL}/users/${id}`,
    UPDATE: (id: number) => `${this.BASE_URL}/users/${id}`,
    DELETE: (id: number) => `${this.BASE_URL}/users/${id}`,
    CHANGE_PASSWORD: (id: number) => `${this.BASE_URL}/users/${id}/change-password`,
    TOGGLE_STATUS: (id: number) => `${this.BASE_URL}/users/${id}/toggle-status`,
    VERIFY_EMAIL: (id: number) => `${this.BASE_URL}/users/${id}/verify-email`,
    RESEND_ACTIVATION: (id: number) => `${this.BASE_URL}/users/${id}/resend-activation`,
  };

  // SITES ENDPOINTS
  public static readonly SITES = {
    BASE: `${this.BASE_URL}/sites`,
    GET_ALL: `${this.BASE_URL}/sites`,
    GET_BY_ID: (id: number) => `${this.BASE_URL}/sites/${id}`,
    CREATE: `${this.BASE_URL}/sites`,
    UPDATE: (id: number) => `${this.BASE_URL}/sites/${id}`,
    DELETE: (id: number) => `${this.BASE_URL}/sites/${id}`,
  };

  // DEVICES ENDPOINTS
  public static readonly DEVICES = {
    BASE: `${this.BASE_URL}/devices`,
    GET_ALL: `${this.BASE_URL}/devices`,
    GET_BY_ID: (id: number) => `${this.BASE_URL}/devices/${id}`,
    CREATE: `${this.BASE_URL}/devices`,
    UPDATE: (id: number) => `${this.BASE_URL}/devices/${id}`,
    DELETE: (id: number) => `${this.BASE_URL}/devices/${id}`,
    GET_ALL_TIMEZONE_AWARE: `${this.BASE_URL}/devices/timezone-aware/all`,
    GET_BY_ID_TIMEZONE_AWARE: (id: number) => `${this.BASE_URL}/devices/timezone-aware/${id}`,
  };

  // REPORTS ENDPOINTS
  public static readonly REPORTS = {
    BASE: `${this.BASE_URL}/reports`,
    GET_ALL: `${this.BASE_URL}/reports`,
    GET_BY_ID: (id: number) => `${this.BASE_URL}/reports/${id}`,
    CREATE: `${this.BASE_URL}/reports`,
    UPDATE: (id: number) => `${this.BASE_URL}/reports/${id}`,
    DELETE: (id: number) => `${this.BASE_URL}/reports/${id}`,
    GENERATE: (id: number) => `${this.BASE_URL}/reports/${id}/generate`,
    GET_BY_USER: (userId: number) => `${this.BASE_URL}/reports/user/${userId}`,
    GET_TYPES: `${this.BASE_URL}/reports/types`,
    CLEANUP_OLD: `${this.BASE_URL}/reports/cleanup/old`,
  };

  // HOPECLOUD ENDPOINTS
  public static readonly HOPECLOUD = {
    BASE: `${this.BASE_URL}/hopecloud`,
    
    // Health & Status
    HEALTH: `${this.BASE_URL}/hopecloud/health`,
    STATUS: `${this.BASE_URL}/hopecloud/status`,
    METRICS: `${this.BASE_URL}/hopecloud/metrics`,
    VALIDATE_AUTH: `${this.BASE_URL}/hopecloud/auth/validate`,
    
    // Stations
    STATIONS: `${this.BASE_URL}/hopecloud/stations`,
    STATION_BY_ID: (stationId: string) => `${this.BASE_URL}/hopecloud/stations/${stationId}`,
    STATION_DEVICES: (plantId: string) => `${this.BASE_URL}/hopecloud/stations/${plantId}/devices`,
    STATION_REALTIME: (plantId: string) => `${this.BASE_URL}/hopecloud/stations/${plantId}/realtime-data`,
    STATION_DAILY_STATS: (plantId: string) => `${this.BASE_URL}/hopecloud/stations/${plantId}/daily-stats`,
    STATION_MONTHLY_STATS: (plantId: string) => `${this.BASE_URL}/hopecloud/stations/${plantId}/monthly-stats`,
    STATION_YEARLY_STATS: (plantId: string) => `${this.BASE_URL}/hopecloud/stations/${plantId}/yearly-stats`,
    STATION_HISTORICAL_POWER: (plantId: string) => `${this.BASE_URL}/hopecloud/stations/${plantId}/historical-power`,
    STATIONS_CONFIG_TYPES: `${this.BASE_URL}/hopecloud/stations-config/types`,
    CREATE_STATION: `${this.BASE_URL}/hopecloud/stations/create`,
    BIND_DEVICES: (plantId: string) => `${this.BASE_URL}/hopecloud/stations/${plantId}/bind-devices`,
    
    // Equipment
    EQUIPMENT_DETAILS: (deviceSn: string) => `${this.BASE_URL}/hopecloud/equipment/${deviceSn}/details`,
    EQUIPMENT_REALTIME: (deviceSn: string) => `${this.BASE_URL}/hopecloud/equipment/${deviceSn}/realtime-data`,
    EQUIPMENT_HISTORICAL: (deviceSn: string) => `${this.BASE_URL}/hopecloud/equipment/${deviceSn}/historical`,
    EQUIPMENT_ALARMS: (deviceSn: string) => `${this.BASE_URL}/hopecloud/equipment/${deviceSn}/alarms`,
    EQUIPMENT_DAILY_STATS: (identifier: string) => `${this.BASE_URL}/hopecloud/equipment/${identifier}/daily-stats`,
    EQUIPMENT_MONTHLY_STATS: (identifier: string) => `${this.BASE_URL}/hopecloud/equipment/${identifier}/monthly-stats`,
    EQUIPMENT_YEARLY_STATS: (identifier: string) => `${this.BASE_URL}/hopecloud/equipment/${identifier}/yearly-stats`,
    
    // Alarms
    ALARMS: `${this.BASE_URL}/hopecloud/alarms`,
    ALARM_DETAILS: `${this.BASE_URL}/hopecloud/alarms/details`,
    
    // Sync & Batch Processing
    SYNC_REALTIME: `${this.BASE_URL}/hopecloud/sync/realtime`,
    SYNC_DAILY: `${this.BASE_URL}/hopecloud/sync/daily`,
    SYNC_MONTHLY: `${this.BASE_URL}/hopecloud/sync/monthly`,
    SYNC_YEARLY: `${this.BASE_URL}/hopecloud/sync/yearly`,
    SYNC_ALARMS: `${this.BASE_URL}/hopecloud/sync/alarms`,
    SYNC_HISTORICAL: `${this.BASE_URL}/hopecloud/sync/historical`,
    SYNC_EQUIPMENT: `${this.BASE_URL}/hopecloud/sync/equipment`,
    SYNC_SITES: `${this.BASE_URL}/hopecloud/sync/sites`,
    SYNC_DEVICES: `${this.BASE_URL}/hopecloud/sync/devices`,

    // Station Resync
    STATIONS_DAILY_RESYNC: `${this.BASE_URL}/hopecloud/stations/daily-resync`,
    STATIONS_MONTHLY_RESYNC: `${this.BASE_URL}/hopecloud/stations/monthly-resync`,
    STATIONS_YEARLY_RESYNC: `${this.BASE_URL}/hopecloud/stations/yearly-resync`,
    STATIONS_RESYNC: `${this.BASE_URL}/hopecloud/stations/resync`,
    STATIONS_COMPARE: `${this.BASE_URL}/hopecloud/stations/compare`,

    // Device Resync
    DEVICES_RESYNC: `${this.BASE_URL}/hopecloud/devices/resync`,
    DEVICES_COMPARE: `${this.BASE_URL}/hopecloud/devices/compare`,

    // Communication Modules
    COMMUNICATION_MODULES: `${this.BASE_URL}/communication-modules`,
    COMMUNICATION_MODULE_BY_ID: (id: number) => `${this.BASE_URL}/communication-modules/${id}`,
    COMMUNICATION_MODULES_SYNC: `${this.BASE_URL}/hopecloud/communication-modules/sync`,

    // Device Discovery
    DISCOVERY_SCAN: `${this.BASE_URL}/hopecloud/discovery/scan`,
    DISCOVERY_SITE_SYNC: (siteId: number) => `${this.BASE_URL}/hopecloud/discovery/sites/${siteId}/sync`,
    DISCOVERY_CLEANUP: `${this.BASE_URL}/hopecloud/discovery/cleanup`,
    DISCOVERY_STATUS: `${this.BASE_URL}/hopecloud/discovery/status`,
    
    // User Management
    SUB_OWNERS: `${this.BASE_URL}/hopecloud/users/sub-owners`,
    CHANNEL_PROVIDERS: `${this.BASE_URL}/hopecloud/users/channel-providers`,
    CHANNEL_TREE: `${this.BASE_URL}/hopecloud/users/channel-tree`,
    
    // Communication Modules
    COMMUNICATION_MODULES: `${this.BASE_URL}/hopecloud/communication-modules`,
    COMMUNICATION_MODULE_DETAILS: `${this.BASE_URL}/hopecloud/communication-modules/details`,
  };

  // LEGACY ENDPOINTS (keeping for backward compatibility)
  public static GROUPS: string = "/group";
  public static STUDENTS: string = "/student";
  public static COURSES: string = "/courses";
  public static BRANCHES: string = "/branches";
}