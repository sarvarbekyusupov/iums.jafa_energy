// Additional API types for comprehensive coverage
export interface Site {
  id: number;
  name: string;
  location: string;
  latitude: string;
  longitude: string;
  capacityKw: string;
  installationDate: string;
  status: 'active' | 'inactive' | 'maintenance';
  fusionSolarPlantId?: string;
  hopeCloudPlantId?: string;
  description?: string;
  siteType: 'ground_mount' | 'rooftop' | 'floating' | 'agri_pv';
  inverterCount: number;
  panelCount: number;
  siteManagerId?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteDto {
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  capacityKw?: number;
  installationDate?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  fusionSolarPlantId?: string;
  description?: string;
  siteType?: 'ground_mount' | 'rooftop' | 'floating' | 'agri_pv';
  inverterCount?: number;
  panelCount?: number;
  siteManagerId?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface UpdateSiteDto {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  capacityKw?: number;
  installationDate?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  fusionSolarPlantId?: string;
  description?: string;
  siteType?: 'ground_mount' | 'rooftop' | 'floating' | 'agri_pv';
  inverterCount?: number;
  panelCount?: number;
  siteManagerId?: number;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface Station {
  id: number;
  siteId: number;
  name: string;
  stationCode?: string;
  capacityKw: string;
  status: 'active' | 'inactive' | 'maintenance';
  fusionSolarStationId?: string;
  hopeCloudStationId?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStationDto {
  siteId: number;
  name: string;
  stationCode?: string;
  capacityKw?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  fusionSolarStationId?: string;
  hopeCloudStationId?: string;
  description?: string;
}

export interface UpdateStationDto {
  siteId?: number;
  name?: string;
  stationCode?: string;
  capacityKw?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  fusionSolarStationId?: string;
  hopeCloudStationId?: string;
  description?: string;
}

export interface Device {
  id: number;
  stationId: number;
  name: string;
  deviceType: string;
  deviceModel?: string;
  serialNumber?: string;
  capacityKw: string;
  status: 'active' | 'inactive' | 'fault' | 'maintenance';
  fusionSolarDeviceId?: string;
  hopeCloudDeviceId?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  warrantyExpiryDate?: string;
  manufacturer?: string;
  firmwareVersion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceDto {
  stationId: number;
  name: string;
  deviceType: string;
  deviceModel?: string;
  serialNumber?: string;
  capacityKw?: number;
  status?: 'active' | 'inactive' | 'fault' | 'maintenance';
  fusionSolarDeviceId?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  warrantyExpiryDate?: string;
  manufacturer?: string;
  firmwareVersion?: string;
}

export interface UpdateDeviceDto {
  stationId?: number;
  name?: string;
  deviceType?: string;
  deviceModel?: string;
  serialNumber?: string;
  capacityKw?: number;
  status?: 'active' | 'inactive' | 'fault' | 'maintenance';
  fusionSolarDeviceId?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  warrantyExpiryDate?: string;
  manufacturer?: string;
  firmwareVersion?: string;
}

export interface DeviceAlarm {
  id: number;
  deviceId: number;
  alarmType: string;
  alarmCode?: string;
  externalId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  occurredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: number;
  resolvedBy?: number;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceAlarmDto {
  deviceId: number;
  alarmType: string;
  alarmCode?: string;
  externalId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  status?: 'active' | 'acknowledged' | 'resolved';
  occurredAt: string;
  acknowledgedBy?: number;
  resolvedBy?: number;
  resolutionNotes?: string;
}

export interface UpdateDeviceAlarmDto {
  deviceId?: number;
  alarmType?: string;
  alarmCode?: string;
  externalId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  title?: string;
  description?: string;
  status?: 'active' | 'acknowledged' | 'resolved';
  occurredAt?: string;
  acknowledgedBy?: number;
  resolvedBy?: number;
  resolutionNotes?: string;
}

export interface AcknowledgeAlarmDto {
  acknowledgedBy: number;
  notes?: string;
}

export interface ResolveAlarmDto {
  resolvedBy: number;
  resolutionNotes: string;
}

export interface UserSite {
  id: number;
  userId: number;
  siteId: number;
  role: 'manager' | 'technician' | 'observer' | 'maintainer';
  accessLevel: 'read_only' | 'read_write' | 'full_access' | 'admin';
  isActive: boolean;
  assignedAt: string;
  assignedBy: number;
  deactivatedAt?: string;
  deactivatedBy?: number;
  permissions: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserSiteDto {
  userId: number;
  siteId: number;
  role?: 'manager' | 'technician' | 'observer' | 'maintainer';
  accessLevel?: 'read_only' | 'read_write' | 'full_access' | 'admin';
  isActive?: boolean;
  assignedBy?: number;
  permissions?: string[];
  notes?: string;
}

export interface UpdateUserSiteDto {
  userId?: number;
  siteId?: number;
  role?: 'manager' | 'technician' | 'observer' | 'maintainer';
  accessLevel?: 'read_only' | 'read_write' | 'full_access' | 'admin';
  isActive?: boolean;
  assignedBy?: number;
  permissions?: string[];
  notes?: string;
}

export interface DeactivateUserSiteDto {
  deactivatedBy: number;
}

export interface SiteKpi {
  id: number;
  siteId: number;
  measuredAt: string;
  dailyYieldKwh?: string;
  monthlyYieldKwh?: string;
  yearlyYieldKwh?: string;
  totalYieldKwh?: string;
  currentPowerKw?: string;
  peakPowerKw?: string;
  performanceRatio?: string;
  capacityFactor?: string;
  irradianceWm2?: string;
  temperatureCelsius?: string;
  windSpeedMs?: string;
  humidityPercentage?: string;
  dailyRevenue?: string;
  monthlyRevenue?: string;
  yearlyRevenue?: string;
  electricityPricePerKwh?: string;
  availabilityPercentage?: string;
  gridFrequencyHz?: string;
  powerFactor?: string;
  createdAt: string;
}

export interface CreateSiteKpiDto {
  siteId: number;
  measuredAt: string;
  dailyYieldKwh?: number;
  monthlyYieldKwh?: number;
  yearlyYieldKwh?: number;
  totalYieldKwh?: number;
  currentPowerKw?: number;
  peakPowerKw?: number;
  performanceRatio?: number;
  capacityFactor?: number;
  irradianceWm2?: number;
  temperatureCelsius?: number;
  windSpeedMs?: number;
  humidityPercentage?: number;
  dailyRevenue?: number;
  monthlyRevenue?: number;
  yearlyRevenue?: number;
  electricityPricePerKwh?: number;
  availabilityPercentage?: number;
  gridFrequencyHz?: number;
  powerFactor?: number;
}

export interface UpdateSiteKpiDto {
  siteId?: number;
  measuredAt?: string;
  dailyYieldKwh?: number;
  monthlyYieldKwh?: number;
  yearlyYieldKwh?: number;
  totalYieldKwh?: number;
  currentPowerKw?: number;
  peakPowerKw?: number;
  performanceRatio?: number;
  capacityFactor?: number;
  irradianceWm2?: number;
  temperatureCelsius?: number;
  windSpeedMs?: number;
  humidityPercentage?: number;
  dailyRevenue?: number;
  monthlyRevenue?: number;
  yearlyRevenue?: number;
  electricityPricePerKwh?: number;
  availabilityPercentage?: number;
  gridFrequencyHz?: number;
  powerFactor?: number;
}

export interface Report {
  id: number;
  name: string;
  description?: string;
  reportType: string;
  createdBy: number;
  parameters: any;
  schedule: any;
  isPublic: boolean;
  lastGenerated?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDto {
  name: string;
  description?: string;
  reportType: string;
  createdBy: number;
  parameters: any;
  schedule?: any;
  isPublic?: boolean;
  lastGenerated?: string;
}

export interface UpdateReportDto {
  name?: string;
  description?: string;
  reportType?: string;
  createdBy?: number;
  parameters?: any;
  schedule?: any;
  isPublic?: boolean;
  lastGenerated?: string;
}

export interface VisitLog {
  id: number;
  siteId: number;
  userId: number;
  visitType: 'maintenance' | 'inspection' | 'repair' | 'installation' | 'commissioning' | 'monitoring' | 'other';
  visitStatus: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  purpose: string;
  description?: string;
  findings?: string;
  actionsTaken?: string;
  recommendations?: string;
  priority?: number;
  latitude?: string;
  longitude?: string;
  weatherConditions?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitLogDto {
  siteId: number;
  userId: number;
  visitType: 'maintenance' | 'inspection' | 'repair' | 'installation' | 'commissioning' | 'monitoring' | 'other';
  visitStatus?: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  purpose: string;
  description?: string;
  findings?: string;
  actionsTaken?: string;
  recommendations?: string;
  priority?: number;
  latitude?: number;
  longitude?: number;
  weatherConditions?: string;
  attachments?: string[];
}

export interface UpdateVisitLogDto {
  siteId?: number;
  userId?: number;
  visitType?: 'maintenance' | 'inspection' | 'repair' | 'installation' | 'commissioning' | 'monitoring' | 'other';
  visitStatus?: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  plannedStartTime?: string;
  plannedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  purpose?: string;
  description?: string;
  findings?: string;
  actionsTaken?: string;
  recommendations?: string;
  priority?: number;
  latitude?: number;
  longitude?: number;
  weatherConditions?: string;
  attachments?: string[];
}

export interface UpdateVisitStatusDto {
  visitStatus: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  actualStartTime?: string;
  actualEndTime?: string;
}

// Common response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SystemApiError {
  statusCode: number;
  message: string;
  error: string;
}

// Filter types
export interface SiteFilters {
  status?: 'active' | 'inactive' | 'maintenance';
  siteType?: 'ground_mount' | 'rooftop' | 'floating' | 'agri_pv';
}

export interface StationFilters {
  siteId?: number;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface DeviceFilters {
  stationId?: number;
  deviceType?: string;
  status?: 'active' | 'inactive' | 'fault' | 'maintenance';
}

export interface DeviceAlarmFilters {
  deviceId?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'active' | 'acknowledged' | 'resolved';
  alarmType?: string;
}

export interface UserSiteFilters {
  userId?: number;
  siteId?: number;
  role?: 'manager' | 'technician' | 'observer' | 'maintainer';
  accessLevel?: 'read_only' | 'read_write' | 'full_access' | 'admin';
  isActive?: boolean;
}

export interface SiteKpiFilters {
  siteId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ReportFilters {
  createdBy?: number;
  reportType?: string;
  isPublic?: boolean;
}

export interface VisitLogFilters {
  siteId?: number;
  userId?: number;
  visitType?: 'maintenance' | 'inspection' | 'repair' | 'installation' | 'commissioning' | 'monitoring' | 'other';
  visitStatus?: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  startDate?: string;
  endDate?: string;
}

// Communication Modules
export const CommunicationModuleStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  FAULT: 'fault'
} as const;

export type CommunicationModuleStatus = typeof CommunicationModuleStatus[keyof typeof CommunicationModuleStatus];

export interface CommunicationModule {
  id: number;
  siteId: number;
  hopeCloudId: string;
  equipmentPn?: string;
  divertorName?: string;
  deviceType?: string;
  iccid?: string;
  operatorType?: string;
  rssi?: number;
  longitude?: number;
  latitude?: number;
  status: CommunicationModuleStatus;
  startTime?: string;
  stopTime?: string;
  loadedNumber?: number;
  lastUpdate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunicationModuleDto {
  siteId: number;
  hopeCloudId: string;
  equipmentPn?: string;
  divertorName?: string;
  deviceType?: string;
  iccid?: string;
  operatorType?: string;
  rssi?: number;
  longitude?: number;
  latitude?: number;
  status?: CommunicationModuleStatus;
  startTime?: string;
  stopTime?: string;
  loadedNumber?: number;
  lastUpdate?: string;
}

export interface UpdateCommunicationModuleDto {
  siteId?: number;
  equipmentPn?: string;
  divertorName?: string;
  deviceType?: string;
  iccid?: string;
  operatorType?: string;
  rssi?: number;
  longitude?: number;
  latitude?: number;
  status?: CommunicationModuleStatus;
  startTime?: string;
  stopTime?: string;
  loadedNumber?: number;
  lastUpdate?: string;
}

export interface CommunicationModuleFilters {
  siteId?: number;
  status?: CommunicationModuleStatus;
}