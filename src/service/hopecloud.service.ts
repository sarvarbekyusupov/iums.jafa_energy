import type {
  HopeCloudStation,
  HopeCloudDevice,
  HopeCloudAlarm,
  HopeCloudRealtimeData,
  HopeCloudStatistics,
  HopeCloudHealthStatus,
  HopeCloudBatchStatus,
  HopeCloudSyncResult,
  HopeCloudOwner,
  HopeCloudChannelProvider,
  HopeCloudChannelTree,
  HopeCloudEquipmentDetails,
  HopeCloudEquipmentRealtimeData,
  HopeCloudCommunicationModule,
  HopeCloudApiResponse,
  HopeCloudPagedResponse,
  HopeCloudDiscoveryResult,
  HopeCloudDiscoveryStatus,
  HopeCloudStationFilters,
  HopeCloudDeviceFilters,
  HopeCloudAlarmFilters,
  HopeCloudStatisticsFilters,
  HopeCloudEquipmentFilters,
  HopeCloudSyncOptions,
  HopeCloudBatchRequest,
  CreateHopeCloudStationDto,
  BindDevicesDto,
  HopeCloudConfigTypes,
  AlarmDetailQueryDto,
  DivertorListQueryDto,
  DivertorDetailQueryDto,
  HopeCloudMetrics,
  HopeCloudAuthValidation,
  HopeCloudStationHistoricalResponse,
  HopeCloudEquipmentHistoricalResponse,
  HopeCloudHistoricalOptions
} from '../types/hopecloud';
import { apiClient } from './api-client';
import { ApiUrls } from '../api/api-urls';

class HopeCloudService {
  // Health and Status endpoints
  async getHealth(): Promise<HopeCloudHealthStatus> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.HEALTH);
    return response.data.data;
  }

  async getBatchStatus(): Promise<HopeCloudBatchStatus> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.STATUS);
    return response.data.data;
  }

  async getMetrics(): Promise<HopeCloudMetrics> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.METRICS);
    return response.data.data;
  }

  async validateAuth(): Promise<HopeCloudAuthValidation> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.VALIDATE_AUTH);
    return response.data.data;
  }

  // Station management endpoints
  async getStations(filters?: HopeCloudStationFilters): Promise<HopeCloudPagedResponse<HopeCloudStation>> {
    const params = new URLSearchParams();
    if (filters?.pageIndex) params.append('pageIndex', filters.pageIndex.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.STATIONS}?${params.toString()}`);
    return response.data;
  }

  async getStationDetails(stationId: string): Promise<HopeCloudApiResponse<HopeCloudStation>> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.STATION_BY_ID(stationId));
    return response.data;
  }

  async getStationConfigTypes(): Promise<HopeCloudApiResponse<HopeCloudConfigTypes>> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.STATIONS_CONFIG_TYPES);
    return response.data;
  }

  async getStationDevices(plantId: string, filters?: HopeCloudDeviceFilters): Promise<HopeCloudApiResponse<HopeCloudDevice[]>> {
    const params = new URLSearchParams();
    if (filters?.pageIndex) params.append('pageIndex', filters.pageIndex.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.STATION_DEVICES(plantId)}?${params.toString()}`);
    return response.data;
  }

  // Real-time data and statistics
  async getStationRealtimeData(plantId: string): Promise<HopeCloudApiResponse<HopeCloudRealtimeData>> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.STATION_REALTIME(plantId));
    return response.data;
  }

  async getStationDailyStats(plantId: string, filters: HopeCloudStatisticsFilters): Promise<HopeCloudApiResponse<HopeCloudStatistics[]>> {
    const params = new URLSearchParams();
    params.append('startTime', filters.startTime);
    params.append('endTime', filters.endTime);
    
    const url = `${ApiUrls.HOPECLOUD.STATION_DAILY_STATS(plantId)}?${params.toString()}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }

  async getStationMonthlyStats(plantId: string, filters: HopeCloudStatisticsFilters): Promise<HopeCloudApiResponse<HopeCloudStatistics[]>> {
    const params = new URLSearchParams();
    params.append('startTime', filters.startTime);
    params.append('endTime', filters.endTime);
    
    const url = `${ApiUrls.HOPECLOUD.STATION_MONTHLY_STATS(plantId)}?${params.toString()}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }

  async getStationYearlyStats(plantId: string, filters: HopeCloudStatisticsFilters): Promise<HopeCloudApiResponse<HopeCloudStatistics[]>> {
    const params = new URLSearchParams();
    params.append('startTime', filters.startTime);
    params.append('endTime', filters.endTime);
    
    const url = `${ApiUrls.HOPECLOUD.STATION_YEARLY_STATS(plantId)}?${params.toString()}`;
    
    const response = await apiClient.get(url);
    return response.data;
  }


  // Alarm management
  async getActiveAlarms(filters: HopeCloudAlarmFilters): Promise<HopeCloudApiResponse<HopeCloudAlarm[]>> {
    const params = new URLSearchParams();
    params.append('pageIndex', filters.pageIndex.toString());
    params.append('pageSize', filters.pageSize.toString());
    
    if (filters.faultCode) params.append('faultCode', filters.faultCode);
    if (filters.faultLevel) params.append('faultLevel', filters.faultLevel);
    if (filters.faultType) params.append('faultType', filters.faultType);
    if (filters.plantId) params.append('plantId', filters.plantId);
    if (filters.pn) params.append('pn', filters.pn);
    if (filters.sn) params.append('sn', filters.sn);
    if (filters.status) params.append('status', filters.status);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startTime) params.append('startTime', filters.startTime);
    if (filters.endTime) params.append('endTime', filters.endTime);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.ALARMS}?${params.toString()}`);
    return response.data;
  }

  async getAlarmDetails(request: AlarmDetailQueryDto): Promise<HopeCloudApiResponse<HopeCloudAlarm>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.ALARM_DETAILS, request);
    return response.data;
  }

  async getBatchAlarmData(request: HopeCloudBatchRequest): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(`${ApiUrls.HOPECLOUD.BASE}/equipment/alarms/batch`, request);
    return response.data;
  }

  // Synchronization endpoints
  async triggerRealtimeSync(): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_REALTIME);
    return response.data;
  }

  async triggerDailySync(options?: HopeCloudSyncOptions): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const params = new URLSearchParams();
    if (options?.date) params.append('date', options.date);
    
    const response = await apiClient.post(`${ApiUrls.HOPECLOUD.SYNC_DAILY}?${params.toString()}`);
    return response.data;
  }

  async triggerMonthlySync(): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_MONTHLY);
    return response.data;
  }

  async triggerSiteSync(): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_SITES);
    return response.data;
  }

  async triggerDeviceSync(): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_DEVICES);
    return response.data;
  }

  async triggerYearlySync(): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_YEARLY);
    return response.data;
  }

  async triggerAlarmSync(): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_ALARMS);
    return response.data;
  }

  async triggerHistoricalSync(config: {
    startDate: string;
    endDate: string;
    siteIds?: number[];
    dataTypes?: string[];
    maxDaysPerBatch?: number;
  }): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_HISTORICAL, config);
    return response.data;
  }

  async triggerEquipmentSync(): Promise<HopeCloudApiResponse<HopeCloudSyncResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.SYNC_EQUIPMENT);
    return response.data;
  }

  // Station Resync endpoints
  async resyncStations(options?: { stationIds?: number[] }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.STATIONS_RESYNC, options || {});
    return response.data;
  }

  async resyncStationsDailyStats(options?: { stationIds?: number[] }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.STATIONS_DAILY_RESYNC, options || {});
    return response.data;
  }

  async resyncStationsMonthlyStats(options?: { stationIds?: number[] }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.STATIONS_MONTHLY_RESYNC, options || {});
    return response.data;
  }

  async resyncStationsYearlyStats(options?: { stationIds?: number[] }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.STATIONS_YEARLY_RESYNC, options || {});
    return response.data;
  }

  async compareStationData(options?: { stationIds?: number[]; intervals?: string[] }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.STATIONS_COMPARE, options || {});
    return response.data;
  }

  // Device Resync endpoints
  async resyncDevices(options?: { deviceIds?: number[]; siteIds?: number[]; skipReadings?: boolean }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.DEVICES_RESYNC, options || {});
    return response.data;
  }

  async compareDeviceData(options?: { deviceIds?: number[]; siteIds?: number[]; intervals?: string[] }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.DEVICES_COMPARE, options || {});
    return response.data;
  }

  // Communication Modules Sync
  async syncCommunicationModules(options?: { siteIds?: number[] }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.COMMUNICATION_MODULES_SYNC, options || {});
    return response.data;
  }

  // Alarms Resync
  async resyncAlarms(options?: {
    deviceIds?: number[];
    siteIds?: number[];
    startDate?: string;  // YYYY-MM-DD format
    endDate?: string;    // YYYY-MM-DD format
  }): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.ALARMS_RESYNC, options || {});
    return response.data;
  }

  // User and account management
  async getSubOwners(filters?: { pageIndex?: number; pageSize?: number; userId?: string }): Promise<HopeCloudApiResponse<HopeCloudOwner[]>> {
    const params = new URLSearchParams();
    if (filters?.pageIndex) params.append('pageIndex', filters.pageIndex.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.userId) params.append('userId', filters.userId);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.SUB_OWNERS}?${params.toString()}`);
    return response.data;
  }

  async getChannelProviders(filters?: { pageIndex?: number; pageSize?: number; userId?: string }): Promise<HopeCloudApiResponse<HopeCloudChannelProvider[]>> {
    const params = new URLSearchParams();
    if (filters?.pageIndex) params.append('pageIndex', filters.pageIndex.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters?.userId) params.append('userId', filters.userId);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.CHANNEL_PROVIDERS}?${params.toString()}`);
    return response.data;
  }

  async getChannelTree(userId?: string): Promise<HopeCloudApiResponse<HopeCloudChannelTree[]>> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.CHANNEL_TREE}?${params.toString()}`);
    return response.data;
  }

  // Equipment management
  async bindDevicesToPlant(plantId: string, data: BindDevicesDto): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.BIND_DEVICES(plantId), data);
    return response.data;
  }

  async getEquipmentDetails(deviceSn: string, filters?: HopeCloudEquipmentFilters): Promise<HopeCloudApiResponse<HopeCloudEquipmentDetails>> {
    const params = new URLSearchParams();
    if (filters?.sn) params.append('sn', filters.sn);
    if (filters?.id) params.append('id', filters.id);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.EQUIPMENT_DETAILS(deviceSn)}?${params.toString()}`);
    return response.data;
  }

  async getEquipmentRealtimeData(deviceSn: string, filters?: HopeCloudEquipmentFilters): Promise<HopeCloudApiResponse<HopeCloudEquipmentRealtimeData>> {
    const params = new URLSearchParams();
    if (filters?.sn) params.append('sn', filters.sn);
    if (filters?.id) params.append('id', filters.id);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.EQUIPMENT_REALTIME(deviceSn)}?${params.toString()}`);
    return response.data;
  }

  async getStationHistoricalPower(plantId: string, date: string): Promise<HopeCloudStationHistoricalResponse> {
    const params = new URLSearchParams();
    params.append('time', date);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.STATION_HISTORICAL_POWER(plantId)}?${params.toString()}`);
    return response.data;
  }

  async getEquipmentHistoricalData(deviceSn: string, date: string, options?: HopeCloudHistoricalOptions): Promise<HopeCloudEquipmentHistoricalResponse> {
    const params = new URLSearchParams();
    params.append('time', date);
    if (options?.sn) params.append('sn', options.sn);
    if (options?.id) params.append('id', options.id);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.EQUIPMENT_HISTORICAL(deviceSn)}?${params.toString()}`);
    return response.data;
  }

  async getEquipmentAlarms(deviceSn: string, filters: HopeCloudEquipmentFilters): Promise<HopeCloudApiResponse<HopeCloudAlarm[]>> {
    const params = new URLSearchParams();
    params.append('startTime', filters.startTime!);
    params.append('endTime', filters.endTime!);
    
    if (filters.pn) params.append('pn', filters.pn);
    if (filters.alarmGrade) params.append('alarmGrade', filters.alarmGrade);
    if (filters.faultType) params.append('faultType', filters.faultType);
    if (filters.alarmCode) params.append('alarmCode', filters.alarmCode);
    if (filters.status) params.append('status', filters.status);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.EQUIPMENT_ALARMS(deviceSn)}?${params.toString()}`);
    return response.data;
  }


  async getEquipmentDailyStats(identifier: string, filters: { startTime: string; endTime: string; type?: 'id' | 'sn' }): Promise<HopeCloudApiResponse<HopeCloudStatistics[]>> {
    const params = new URLSearchParams();
    params.append('startTime', filters.startTime);
    params.append('endTime', filters.endTime);
    if (filters.type) params.append('type', filters.type);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.EQUIPMENT_DAILY_STATS(identifier)}?${params.toString()}`);
    return response.data;
  }

  async getEquipmentMonthlyStats(identifier: string, filters: { startTime: string; endTime: string; type?: 'id' | 'sn' }): Promise<HopeCloudApiResponse<HopeCloudStatistics[]>> {
    const params = new URLSearchParams();
    params.append('startTime', filters.startTime);
    params.append('endTime', filters.endTime);
    if (filters.type) params.append('type', filters.type);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.EQUIPMENT_MONTHLY_STATS(identifier)}?${params.toString()}`);
    return response.data;
  }

  async getEquipmentYearlyStats(identifier: string, filters: { startTime: string; endTime: string; type?: 'id' | 'sn' }): Promise<HopeCloudApiResponse<HopeCloudStatistics[]>> {
    const params = new URLSearchParams();
    params.append('startTime', filters.startTime);
    params.append('endTime', filters.endTime);
    if (filters.type) params.append('type', filters.type);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.EQUIPMENT_YEARLY_STATS(identifier)}?${params.toString()}`);
    return response.data;
  }

  // Communication modules
  async getCommunicationModules(query: DivertorListQueryDto): Promise<HopeCloudApiResponse<HopeCloudCommunicationModule[]>> {
    const params = new URLSearchParams();
    params.append('plantId', query.plantId);
    params.append('pageIndex', query.pageIndex.toString());
    params.append('pageSize', query.pageSize.toString());
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.COMMUNICATION_MODULES}?${params.toString()}`);
    return response.data;
  }

  async getCommunicationModuleDetails(query?: DivertorDetailQueryDto): Promise<HopeCloudApiResponse<HopeCloudCommunicationModule>> {
    const params = new URLSearchParams();
    if (query?.id) params.append('id', query.id);
    if (query?.pn) params.append('pn', query.pn);
    
    const response = await apiClient.get(`${ApiUrls.HOPECLOUD.COMMUNICATION_MODULE_DETAILS}?${params.toString()}`);
    return response.data;
  }

  // Device Discovery
  async discoverDevices(): Promise<HopeCloudApiResponse<HopeCloudDiscoveryResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.DISCOVERY_SCAN);
    return response.data;
  }

  async syncSiteDevices(siteId: number): Promise<HopeCloudApiResponse<HopeCloudDiscoveryResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.DISCOVERY_SITE_SYNC(siteId));
    return response.data;
  }

  async cleanupDevices(): Promise<HopeCloudApiResponse<HopeCloudDiscoveryResult>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.DISCOVERY_CLEANUP);
    return response.data;
  }

  async getDiscoveryStatus(): Promise<HopeCloudApiResponse<HopeCloudDiscoveryStatus>> {
    const response = await apiClient.get(ApiUrls.HOPECLOUD.DISCOVERY_STATUS);
    return response.data;
  }

  // Station creation
  async createPowerStation(data: CreateHopeCloudStationDto): Promise<HopeCloudApiResponse<any>> {
    const response = await apiClient.post(ApiUrls.HOPECLOUD.CREATE_STATION, data);
    return response.data;
  }
}

export const hopeCloudService = new HopeCloudService();