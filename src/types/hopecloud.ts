// HopeCloud API Types
export interface HopeCloudStation {
  id: string;
  name: string;
  longitude: string;
  latitude: string;
  province: string;
  city: string;
  district: string;
  address: string;
  powerPlantType: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  companyId: string;
  companyName: string;
  plantContactPhone?: string;
  kwp: number;
  nowKw: number;
  todayKwh: number;
  monKwh: number;
  yearKwh: number;
  sumKwh: number;
  plantImg?: string;
  status: number;
  updateTime: string;
  networkType: string;
  networkTime?: string;
  serviceProviderName?: string;
  serviceProviderPhone?: string;
  plantContact?: string;
  subassemblyNumber?: number;
  paymentType?: string;
  orientationAngle: number;
  dipAngle: number;
  remark?: string;
  todayEarnings?: number;
  yearEarnings?: number;
}

export interface HopeCloudDevice {
  id: string;
  equipmentSn: string;
  equipmentName: string;
  equipmentModel: string;
  ratedPower: number;
  nowKw: number;
  status: number;
  deviceType?: string;
  stationId?: string;
  manufacturer?: string;
  installationDate?: string;
  firmwareVersion?: string;
  lastUpdateTime?: string;
}

export interface HopeCloudAlarm {
  alarmId: string;
  plantId: string;
  deviceId: string;
  deviceSn?: string;
  alarmType: string;
  severity: string;
  alarmCode?: string;
  faultType?: string;
  alarmGrade?: string;
  message: string;
  description?: string;
  occurredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  reportedTime?: string;
  restoreTime?: string;
  equipmentSn?: string;
  equipmentPn?: string;
  alarmStatus?: string;
  alarmContent?: string;
  plantName?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  plantAddress?: string;
  causesAnalysis?: string;
  diagnosticAdvice?: string;
}

export interface HopeCloudRealtimeData {
  nowKw: number;
  todayKwh: number;
  totalKwh: number;
  updateTime: string;
}

export interface HopeCloudStatistics {
  collectTime: string;
  dayKwh?: number;
  monKwh?: number;
  yearKwh?: number;
  income: number;
  dayKw?: number;
  radiantQuantity?: number;
  // Additional fields for synced site history
  measuredAt?: string;
  dailyYieldKwh?: number | string;
  monthlyYieldKwh?: number | string;
  yearlyYieldKwh?: number | string;
  currentPowerKw?: number | string;
}

export interface HopeCloudHealthStatus {
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  details: {
    authentication: {
      configured: boolean;
      valid: boolean;
    };
    circuitBreaker: {
      state: string;
      failureCount: number;
    };
    rateLimiting: {
      statistics: Record<string, any>;
    };
    cache: {
      size: number;
      types: Record<string, number>;
    };
  };
}

export interface HopeCloudBatchStatus {
  realtimeProcessing: boolean;
  dailyProcessing: boolean;
  monthlyProcessing: boolean;
  hopeCloudHealth: HopeCloudHealthStatus;
}

export interface HopeCloudSyncResult {
  batchType: string;
  status: 'started' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  startTime: string;
  endTime: string;
  details: any;
  message?: string;
}

export interface HopeCloudOwner {
  userId: string;
  userName: string;
  nickName: string;
  email: string;
  phone: string;
  remark?: string | null;
  // Legacy field names for backward compatibility
  ownerId?: string;
  ownerName?: string;
  createdTime?: string;
}

export interface HopeCloudChannelProvider {
  channelId: string;
  channelName: string;
  providerName: string;
  contactInfo: string;
  status: string;
}

export interface HopeCloudChannelTree {
  childCompanyList: HopeCloudChannelTreeNode[];
  email: string;
  nickName: string;
  phone: string;
  remark: string;
  userId: string;
  userName: string;
}

export interface HopeCloudChannelTreeNode {
  childCompanyList: HopeCloudChannelTreeNode[];
  email: string;
  nickName: string;
  phone: string;
  remark: string;
  userId: string;
  userName: string;
}

export interface HopeCloudEquipmentDetails {
  sn: string;
  deviceName: string;
  deviceType: string;
  model: string;
  capacity: number;
  status: string;
  lastUpdateTime: string;
  firmwareVersion: string;
}

export interface HopeCloudEquipmentRealtimeData {
  sn: string;
  timestamp: string;
  activePower: number;
  voltage: number;
  current: number;
  frequency: number;
  temperature: number;
  efficiency: number;
}

export interface HopeCloudCommunicationModule {
  id: number;
  siteId: number;
  equipmentPn: string;
  divertorName: string;
  deviceType: string;
  rssi: number;
  status: string; // "online" or "offline"
  loadedNumber: number;
  iccid?: string;
  latitude?: string;
  longitude?: string;
  operatorType?: string;
  powerPlantId?: string;
  powerPlantName?: string;
  startTime?: string;
  stopTime?: string;
  updateTime?: string;
  userId?: string;
  userName?: string;
  // Nested site information
  site?: {
    id: number;
    name: string;
    location?: string;
  };
}

// Request/Response wrapper types
export interface HopeCloudApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  count?: number;
}

export interface HopeCloudPagedResponse<T> {
  status: 'success' | 'error';
  data: {
    page?: {
      total: number;
      pageIndex: number;
      pageSize: number;
    };
    statistics?: {
      sumNumber: number;
      alarmNumber: number;
      onlineNumber: number;
      offlineNumber: number;
    };
    records: T[];
  };
}

export interface HopeCloudWebhookPayload {
  plantId: string;
  eventType: 'realtime_data' | 'alarm' | 'device_status' | 'device_added';
  timestamp: string;
  deviceId?: string;
  alarmId?: string;
  data: any;
}

// Discovery and sync related types
export interface HopeCloudDiscoveryResult {
  discovered: number;
  updated: number;
  skipped: number;
  details: HopeCloudDiscoveryDetail[];
}

export interface HopeCloudDiscoveryDetail {
  action: 'created' | 'updated' | 'skipped';
  deviceId: string;
  deviceName: string;
  reason: string;
  hopeCloudDeviceId?: string;
}

export interface HopeCloudDiscoveryStatus {
  lastRun: string;
  nextScheduledRun: string;
  schedule: string;
  enabled: boolean;
  lastRunStats: {
    discovered: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}

// Filter and query parameters
export interface HopeCloudStationFilters {
  pageIndex?: number;
  pageSize?: number;
}

export interface HopeCloudDeviceFilters {
  pageIndex?: number;
  pageSize?: number;
}

export interface HopeCloudAlarmFilters {
  pageIndex: number;
  pageSize: number;
  faultCode?: string;
  faultLevel?: string;
  faultType?: string;
  plantId?: string;
  pn?: string;
  sn?: string;
  status?: string;
  userId?: string;
  startTime?: string;
  endTime?: string;
}

export interface HopeCloudStatisticsFilters {
  startTime: string;
  endTime: string;
}

export interface HopeCloudEquipmentFilters {
  sn?: string;
  id?: string;
  pn?: string;
  alarmGrade?: string;
  faultType?: string;
  alarmCode?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  time?: string;
}

// Sync and batch operation types
export interface HopeCloudSyncOptions {
  date?: string; // For daily sync in YYYY-MM-DD format
}

export interface HopeCloudBatchRequest {
  deviceList?: string[];
  snList?: string[];
  queryTime?: string;
  faultType?: string;
  alarmStatus?: string;
  alarmGrade?: string;
  alarmCode?: string;
}

// Station creation types
export interface CreateHopeCloudStationDto {
  snList: string[];
  plantName: string;
  powerPlantType: string;
  networkType: string;
  pnList?: string[];
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  longitude?: string;
  latitude?: string;
  kwp?: string;
  networkTime?: string;
  subassemblyNumber?: number;
  orientationAngle?: string;
  dipAngle?: string;
  paymentType?: string;
  organizationId?: string;
  ownerId?: string;
  remark?: string;
  plantImg?: string;
}

export interface BindDevicesDto {
  snList?: string[];
  pnList?: string[];
}

// Configuration types
export interface HopeCloudConfigTypes {
  powerPlantTypes: Record<string, string>;
  networkTypes: Record<string, string>;
  paymentTypes: Record<string, string>;
}

// Alarm detail query
export interface AlarmDetailQueryDto {
  alarmId: string;
  sn?: string;
}

// Communication module query DTOs
export interface DivertorListQueryDto {
  pageIndex: number;
  pageSize: number;
  plantId: string;
}

export interface DivertorDetailQueryDto {
  id?: string;
  pn?: string;
}

// Equipment statistics query DTOs
export interface EquipmentDayStatsQueryDto {
  startTime: string; // "yyyy MM dd"
  endTime: string;   // "yyyy MM dd"
  type?: 'id' | 'sn';
}

export interface EquipmentMonthStatsQueryDto {
  startTime: string; // "yyyy MM"
  endTime: string;   // "yyyy MM"
  type?: 'id' | 'sn';
}

export interface EquipmentYearStatsQueryDto {
  startTime: string; // "yyyy"
  endTime: string;   // "yyyy"
  type?: 'id' | 'sn';
}

// HopeCloud Metrics Interface
export interface HopeCloudMetrics {
  circuitBreaker: {
    state: string;
    failureCount: number;
  };
  rateLimiting: Record<string, {
    count: number;
    resetTime: number;
  }>;
  cache: {
    size: number;
    types: Record<string, number>;
  };
  uptime: number;
}

// Auth Validation Response
export interface HopeCloudAuthValidation {
  validation: {
    valid: boolean;
    errors: string[];
  };
  health: {
    configured: boolean;
    privateKeyPresent: boolean;
  };
}

// Historical Data Types
export interface HopeCloudStationHistoricalPower {
  time: string;
  nowKw: number;
  powerUnit: string;
}

// Legacy interface for backward compatibility (if needed)
export interface HopeCloudStationHistoricalPowerLegacy {
  time: string;
  activePower: number;
  generationPower: number;
  hourlyGeneration: number;
  dailyGeneration: number;
  totalGeneration: number;
}

export interface HopeCloudStationHistoricalResponse {
  status: string;
  data: HopeCloudStationHistoricalPower[];
}

export interface HopeCloudEquipmentParameter {
  name: string;
  key: string;
  unit: string;
  value: number;
}

export interface HopeCloudEquipmentHistoricalData {
  time: string;
  paramList: HopeCloudEquipmentParameter[];
}

export interface HopeCloudEquipmentHistoricalResponse {
  status: string;
  data: HopeCloudEquipmentHistoricalData[];
  count: number;
}

export interface HopeCloudHistoricalOptions {
  sn?: string;
  id?: string;
}