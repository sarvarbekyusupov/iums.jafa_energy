/**
 * Fsolar API Integration
 *
 * Complete integration of all 29 Fsolar API endpoints
 * Base URL: http://localhost:3000/api/fsolar
 *
 * Services:
 * - Authentication (5 endpoints)
 * - Device Management (10 endpoints)
 * - Economic Strategy Templates (5 endpoints)
 * - Economic Mode Tasks (6 endpoints)
 * - Task Runtime Monitoring (1 endpoint)
 * - Task Run Records (2 endpoints)
 */

// Services
export { fsolarAuthService } from './auth.service';
export { fsolarDeviceService } from './device.service';
export { fsolarTemplateService } from './template.service';
export { fsolarTaskService } from './task.service';
export { fsolarMonitorService, TaskMonitor } from './monitor.service';
export { fsolarRecordService } from './record.service';

// Utilities
export * from './utils';

// Re-export types for convenience
export type {
  // Common
  FsolarResponse,
  FsolarErrorResponse,
  PaginationParams,
  PaginatedResponse,

  // Auth
  AuthTokens,
  AuthStatus,
  RefreshTokenResponse,
  EncryptPasswordRequest,
  EncryptPasswordResponse,

  // Device
  Device,
  DeviceListParams,
  DeviceEnergyParams,
  DeviceEnergyData,
  DeviceBasicInfo,
  DeviceHistoryParams,
  DeviceHistoricalData,
  BatchDeviceHistoryParams,
  BatchDeviceHistoryData,
  DeviceEventsParams,
  DeviceEvent,
  AddDeviceRequest,
  AddDeviceResponse,
  DeleteDeviceRequest,
  DeleteDeviceResponse,
  DeviceSetting,
  DeviceSettings,
  SetDeviceSettingRequest,
  SetDeviceSettingResponse,

  // Template
  StrategyTimeSlot,
  EconomicStrategyTemplate,
  ListTemplatesRequest,
  AddTemplateRequest,
  AddTemplateResponse,
  UpdateTemplateRequest,
  UpdateTemplateResponse,

  // Task
  EconomicTask,
  ListEconomicTasksRequest,
  AddEconomicTaskRequest,
  AddEconomicTaskResponse,
  UpdateEconomicTaskRequest,
  UpdateEconomicTaskResponse,
  RunTaskRequest,
  RunTaskResponse,
  TaskDetailRequest,
  TaskDeviceDetail,

  // Monitor
  TaskRuntimeDetailRequest,
  DeviceCommandStatus,
  TaskRuntimeDetail,

  // Record
  ListRunRecordsRequest,
  TaskRunRecord,
  RunRecordDetailRequest,
  RunRecordDetail,
} from '../../types/fsolar';
