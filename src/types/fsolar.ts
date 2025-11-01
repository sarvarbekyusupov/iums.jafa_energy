// Fsolar API Types and Interfaces

// ============================================
// Common Types
// ============================================

export interface FsolarResponse<T> {
  status: 'success';
  data: T;
}

export interface FsolarErrorResponse {
  statusCode: number;
  message: string;
}

export interface PaginationParams {
  pageNum: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  dataList: T[];
  total: string;
  totalPage: string;
  currentPage: string;
  pageSize: string;
}

// ============================================
// Authentication Types
// ============================================

export interface AuthTokens {
  token: string;
  tokenExpireTime: string;
  refreshToken: string;
  refTokenExpireTime: string;
}

export interface AuthStatus {
  authenticated: boolean;
  tokenExpiry: string;
  refreshTokenExpiry: string;
  timeUntilTokenExpiry: string;
  timeUntilRefreshExpiry: string;
}

export interface RefreshTokenResponse {
  token: string;
  tokenExpireTime: string;
}

export interface EncryptPasswordRequest {
  password: string;
}

export interface EncryptPasswordResponse {
  encryptedPassword: string;
}

// ============================================
// Device Types
// ============================================

export interface Device {
  id: string;
  deviceSn: string;
  deviceType: string;
  deviceName: string;
  status: string;
  model?: string;
  manufacturer?: string;
  installDate?: string;
  [key: string]: any;
}

export interface DeviceListParams extends PaginationParams {
  deviceSn?: string;
  deviceType?: string;
}

export interface DeviceEnergyParams {
  deviceSn: string;
  date: string; // YYYYMMDD format
  timeDimension: 1 | 2 | 3; // 1=day, 2=month, 3=year
}

export interface DeviceEnergyData {
  deviceSn: string;
  date: string;
  energyData: {
    timestamp: string;
    production: number;
    consumption: number;
  }[];
}

export interface DeviceBasicInfo {
  deviceSn: string;
  deviceType: string;
  deviceName: string;
  model: string;
  manufacturer: string;
  installDate: string;
  status: string;
  [key: string]: any;
}

export interface DeviceHistoryParams {
  dateStr: string; // YYYYMMDD format
  dataItemIds: string; // comma-separated IDs
}

export interface DeviceHistoricalData {
  deviceSn: string;
  historicalData: {
    dataItemId: number;
    timestamp: string;
    value: number;
  }[];
}

export interface BatchDeviceHistoryParams {
  deviceSnList: string; // comma-separated device SNs
  dateStr: string; // YYYYMMDD format
  dataItemIds: string; // comma-separated data item IDs
  queryType: 1 | 2; // 1=hourly, 2=daily
}

export interface BatchDeviceHistoryData {
  devices: {
    deviceSn: string;
    data: any[];
  }[];
}

export interface DeviceEventsParams extends PaginationParams {
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  alarmLevel?: 1 | 2 | 3 | 4; // 1=critical, 2=major, 3=minor, 4=warning
}

export interface DeviceEvent {
  eventId: string;
  deviceSn: string;
  eventType: string;
  alarmLevel: number;
  message: string;
  timestamp: number;
  status: string;
}

export interface AddDeviceRequest {
  deviceSaveInfoList: {
    deviceSn: string;
    deviceType: string;
    deviceName: string;
  }[];
}

export interface AddDeviceResponse {
  successCount: number;
  failCount: number;
  details: {
    deviceSn: string;
    status: string;
  }[];
}

export interface DeleteDeviceRequest {
  deviceSns: string[];
}

export interface DeleteDeviceResponse {
  successCount: number;
  failCount: number;
}

export interface DeviceSetting {
  settingId: number;
  settingName: string;
  value: string;
  unit: string;
}

export interface DeviceSettings {
  deviceSn: string;
  settings: DeviceSetting[];
}

export interface SetDeviceSettingRequest {
  deviceSn: string;
  content: {
    [key: string]: string | number;
  };
}

export interface SetDeviceSettingResponse {
  id: string;
  deviceSn: string;
}

// ============================================
// Economic Strategy Template Types
// ============================================

export interface StrategyTimeSlot {
  startTime?: string;              // HH:mm format
  stopTime?: string;                // HH:mm format
  startDay?: string;                // mm:dd format
  stopDay?: string;                 // mm:dd format
  daysOfEffectiveWeek?: string[];   // ["MONDAY", "TUESDAY", ...]
  strategy?: number;                // 1=Charge, 2=Discharge
  power?: number;                   // Watts
  soc?: number;                     // Battery SOC %
  backupReserve?: string;           // Reserved capacity %
}

export interface EconomicStrategyTemplate {
  id: string;
  templateName: string;
  strategy1?: StrategyTimeSlot;
  strategy2?: StrategyTimeSlot;
  strategy3?: StrategyTimeSlot;
  strategy4?: StrategyTimeSlot;
  strategy5?: StrategyTimeSlot;
  strategy6?: StrategyTimeSlot;
  strategy7?: StrategyTimeSlot;
  strategy8?: StrategyTimeSlot;
  strategy9?: StrategyTimeSlot;
  strategy10?: StrategyTimeSlot;
  createTime?: number;
  modifyTime?: number;
}

export interface ListTemplatesRequest extends PaginationParams {
  templateName?: string;
}

export interface AddTemplateRequest {
  templateName: string;
  strategy1?: StrategyTimeSlot;
  strategy2?: StrategyTimeSlot;
  strategy3?: StrategyTimeSlot;
  strategy4?: StrategyTimeSlot;
  strategy5?: StrategyTimeSlot;
  strategy6?: StrategyTimeSlot;
  strategy7?: StrategyTimeSlot;
  strategy8?: StrategyTimeSlot;
  strategy9?: StrategyTimeSlot;
  strategy10?: StrategyTimeSlot;
}

export interface AddTemplateResponse {
  id: string;
  templateName: string;
}

export interface UpdateTemplateRequest extends AddTemplateRequest {}

export interface UpdateTemplateResponse {
  id: string;
  templateName: string;
}

// ============================================
// Economic Task Types
// ============================================

export interface EconomicTask {
  id: string;
  taskName: string;
  templateId: string;
  taskType: string;
  createTime: number;
  modifyTime: number;
}

export interface ListEconomicTasksRequest extends PaginationParams {
  taskName?: string;
  taskStatus?: number;
}

export interface TaskTarget {
  deviceId: string;
}

export interface AddEconomicTaskRequest {
  taskName: string;
  templateId: number;
  taskType: string;
  targetList: TaskTarget[];
}

export interface AddEconomicTaskResponse {
  id: string;
  taskName: string;
}

export interface UpdateEconomicTaskRequest extends AddEconomicTaskRequest {}

export interface UpdateEconomicTaskResponse {
  id: string;
  taskName: string;
}

export interface RunTaskRequest {
  taskId: number;
  runType: 0 | 1; // 0=normal, 1=failed resend
  runTaskRecordId?: number; // Required when runType=1
}

export interface RunTaskResponse {
  runTaskRecordId: string;
  taskStatus: number;
  remainTime: number;
  successCount: number;
  failCount: number;
}

export interface TaskDetailRequest {
  taskId: number;
}

export interface TaskDeviceDetail {
  id: string;
  taskId: string;
  deviceId: string;
  deviceSn: string;
}

// ============================================
// Task Runtime Monitoring Types
// ============================================

export interface TaskRuntimeDetailRequest {
  taskId?: number;
  runTaskRecordId: number;
}

export interface DeviceCommandStatus {
  deviceSn: string;
  commandId: number;
  commandStatus: 0 | 1 | 2; // 0=failed/timeout, 1=success, 2=waiting
  alias: string;
}

export interface TaskRuntimeDetail {
  taskStatus: 0 | 1; // 0=running, 1=done
  successCount: number;
  failCount: number;
  remainTime: number;
  detailListVOList: DeviceCommandStatus[];
}

// ============================================
// Task Run Records Types
// ============================================

export interface ListRunRecordsRequest extends PaginationParams {
  taskId?: number;
  taskName?: string;
  taskStatus?: 0 | 1; // 0=running, 1=done
  runType?: 0 | 1; // 0=normal, 1=resend
}

export interface TaskRunRecord {
  id: string;
  taskId: string;
  taskName: string;
  templateId: string;
  taskType: string;
  runType: number;
  taskStatus: number;
  successCount: number;
  failCount: number;
  createTime: number;
  modifyTime: number;
}

export interface RunRecordDetailRequest {
  id: number;
}

export interface RunRecordDetail {
  id: string;
  runTaskRecordId: string;
  taskName: string;
  taskStatus: number;
  successCount: string;
  failCount: string;
  createTime: number;
  detailListVOList: {
    id: string;
    deviceId: string;
    deviceSn: string;
    alias: string;
    commandId: number;
    commandStatus: number;
  }[];
}
