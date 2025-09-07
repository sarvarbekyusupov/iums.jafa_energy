import type {
  Site,
  CreateSiteDto,
  UpdateSiteDto,
  Station,
  CreateStationDto,
  UpdateStationDto,
  Device,
  CreateDeviceDto,
  UpdateDeviceDto,
  DeviceAlarm,
  CreateDeviceAlarmDto,
  UpdateDeviceAlarmDto,
  AcknowledgeAlarmDto,
  ResolveAlarmDto,
  SiteKpi,
  CreateSiteKpiDto,
  UpdateSiteKpiDto,
  VisitLog,
  CreateVisitLogDto,
  UpdateVisitLogDto,
  UpdateVisitStatusDto,
  UserSite,
  CreateUserSiteDto,
  UpdateUserSiteDto,
  DeactivateUserSiteDto,
  Report,
  CreateReportDto,
  UpdateReportDto,
  SiteFilters,
  StationFilters,
  DeviceFilters,
  DeviceAlarmFilters,
  UserSiteFilters,
  SiteKpiFilters,
  ReportFilters,
  VisitLogFilters
} from '../types/api';
import { ApiUrls } from '../api/api-urls';
import { apiClient } from './api-client';

class SitesService {
  private readonly baseUrl = '/api';

  // Sites management
  async getAllSites(filters?: SiteFilters): Promise<Site[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.siteType) params.append('siteType', filters.siteType);

    const response = await apiClient.get(`${ApiUrls.SITES.GET_ALL}?${params.toString()}`);
    return response.data;
  }

  async getSiteById(id: number): Promise<Site> {
    const response = await apiClient.get(ApiUrls.SITES.GET_BY_ID(id));
    return response.data;
  }

  async createSite(data: CreateSiteDto): Promise<Site> {
    const response = await apiClient.post(ApiUrls.SITES.CREATE, data);
    return response.data;
  }

  async updateSite(id: number, data: UpdateSiteDto): Promise<Site> {
    const response = await apiClient.patch(ApiUrls.SITES.UPDATE(id), data);
    return response.data;
  }

  async deleteSite(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(ApiUrls.SITES.DELETE(id));
    return response.data;
  }

  // Stations management
  async getAllStations(filters?: StationFilters): Promise<Station[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.append('siteId', filters.siteId.toString());
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`${this.baseUrl}/stations?${params.toString()}`);
    return response.data;
  }

  async getStationById(id: number): Promise<Station> {
    const response = await apiClient.get(`${this.baseUrl}/stations/${id}`);
    return response.data;
  }

  async createStation(data: CreateStationDto): Promise<Station> {
    const response = await apiClient.post(`${this.baseUrl}/stations`, data);
    return response.data;
  }

  async updateStation(id: number, data: UpdateStationDto): Promise<Station> {
    const response = await apiClient.patch(`${this.baseUrl}/stations/${id}`, data);
    return response.data;
  }

  async deleteStation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/stations/${id}`);
    return response.data;
  }

  // Devices management
  async getAllDevices(filters?: DeviceFilters): Promise<Device[]> {
    const params = new URLSearchParams();
    if (filters?.stationId) params.append('stationId', filters.stationId.toString());
    if (filters?.deviceType) params.append('deviceType', filters.deviceType);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`${ApiUrls.DEVICES.GET_ALL}?${params.toString()}`);
    return response.data;
  }

  async getDeviceById(id: number): Promise<Device> {
    const response = await apiClient.get(ApiUrls.DEVICES.GET_BY_ID(id));
    return response.data;
  }

  async createDevice(data: CreateDeviceDto): Promise<Device> {
    const response = await apiClient.post(ApiUrls.DEVICES.CREATE, data);
    return response.data;
  }

  async updateDevice(id: number, data: UpdateDeviceDto): Promise<Device> {
    const response = await apiClient.patch(ApiUrls.DEVICES.UPDATE(id), data);
    return response.data;
  }

  async deleteDevice(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(ApiUrls.DEVICES.DELETE(id));
    return response.data;
  }

  // Timezone-aware device endpoints
  async getAllDevicesTimezoneAware(filters?: DeviceFilters): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.stationId) params.append('stationId', filters.stationId.toString());
    if (filters?.deviceType) params.append('deviceType', filters.deviceType);
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get(`${ApiUrls.DEVICES.GET_ALL_TIMEZONE_AWARE}?${params.toString()}`);
    return response.data;
  }

  async getDeviceByIdTimezoneAware(id: number): Promise<any> {
    const response = await apiClient.get(ApiUrls.DEVICES.GET_BY_ID_TIMEZONE_AWARE(id));
    return response.data;
  }

  // Device alarms management
  async getAllDeviceAlarms(filters?: DeviceAlarmFilters): Promise<DeviceAlarm[]> {
    const params = new URLSearchParams();
    if (filters?.deviceId) params.append('deviceId', filters.deviceId.toString());
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.alarmType) params.append('alarmType', filters.alarmType);

    const response = await apiClient.get(`${this.baseUrl}/device-alarms?${params.toString()}`);
    return response.data;
  }

  async getDeviceAlarmById(id: number): Promise<DeviceAlarm> {
    const response = await apiClient.get(`${this.baseUrl}/device-alarms/${id}`);
    return response.data;
  }

  async createDeviceAlarm(data: CreateDeviceAlarmDto): Promise<DeviceAlarm> {
    const response = await apiClient.post(`${this.baseUrl}/device-alarms`, data);
    return response.data;
  }

  async updateDeviceAlarm(id: number, data: UpdateDeviceAlarmDto): Promise<DeviceAlarm> {
    const response = await apiClient.patch(`${this.baseUrl}/device-alarms/${id}`, data);
    return response.data;
  }

  async deleteDeviceAlarm(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/device-alarms/${id}`);
    return response.data;
  }

  async acknowledgeAlarm(id: number, data: AcknowledgeAlarmDto): Promise<DeviceAlarm> {
    const response = await apiClient.patch(`${this.baseUrl}/device-alarms/${id}/acknowledge`, data);
    return response.data;
  }

  async resolveAlarm(id: number, data: ResolveAlarmDto): Promise<DeviceAlarm> {
    const response = await apiClient.patch(`${this.baseUrl}/device-alarms/${id}/resolve`, data);
    return response.data;
  }

  // Site KPIs management
  async getAllSiteKpis(filters?: SiteKpiFilters): Promise<SiteKpi[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.append('siteId', filters.siteId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`${this.baseUrl}/site-kpis?${params.toString()}`);
    return response.data;
  }

  async getSiteKpiById(id: number): Promise<SiteKpi> {
    const response = await apiClient.get(`${this.baseUrl}/site-kpis/${id}`);
    return response.data;
  }

  async createSiteKpi(data: CreateSiteKpiDto): Promise<SiteKpi> {
    const response = await apiClient.post(`${this.baseUrl}/site-kpis`, data);
    return response.data;
  }

  async updateSiteKpi(id: number, data: UpdateSiteKpiDto): Promise<SiteKpi> {
    const response = await apiClient.patch(`${this.baseUrl}/site-kpis/${id}`, data);
    return response.data;
  }

  async deleteSiteKpi(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/site-kpis/${id}`);
    return response.data;
  }

  // Visit logs management
  async getAllVisitLogs(filters?: VisitLogFilters): Promise<VisitLog[]> {
    const params = new URLSearchParams();
    if (filters?.siteId) params.append('siteId', filters.siteId.toString());
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.visitType) params.append('visitType', filters.visitType);
    if (filters?.visitStatus) params.append('visitStatus', filters.visitStatus);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`${this.baseUrl}/visit-logs?${params.toString()}`);
    return response.data;
  }

  async getVisitLogById(id: number): Promise<VisitLog> {
    const response = await apiClient.get(`${this.baseUrl}/visit-logs/${id}`);
    return response.data;
  }

  async createVisitLog(data: CreateVisitLogDto): Promise<VisitLog> {
    const response = await apiClient.post(`${this.baseUrl}/visit-logs`, data);
    return response.data;
  }

  async updateVisitLog(id: number, data: UpdateVisitLogDto): Promise<VisitLog> {
    const response = await apiClient.patch(`${this.baseUrl}/visit-logs/${id}`, data);
    return response.data;
  }

  async deleteVisitLog(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/visit-logs/${id}`);
    return response.data;
  }

  async updateVisitStatus(id: number, data: UpdateVisitStatusDto): Promise<VisitLog> {
    const response = await apiClient.patch(`${this.baseUrl}/visit-logs/${id}/status`, data);
    return response.data;
  }

  // User-Site assignments
  async getAllUserSites(filters?: UserSiteFilters): Promise<UserSite[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.siteId) params.append('siteId', filters.siteId.toString());
    if (filters?.role) params.append('role', filters.role);
    if (filters?.accessLevel) params.append('accessLevel', filters.accessLevel);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get(`${this.baseUrl}/user-sites?${params.toString()}`);
    return response.data;
  }

  async getUserSiteById(id: number): Promise<UserSite> {
    const response = await apiClient.get(`${this.baseUrl}/user-sites/${id}`);
    return response.data;
  }

  async createUserSite(data: CreateUserSiteDto): Promise<UserSite> {
    const response = await apiClient.post(`${this.baseUrl}/user-sites`, data);
    return response.data;
  }

  async updateUserSite(id: number, data: UpdateUserSiteDto): Promise<UserSite> {
    const response = await apiClient.patch(`${this.baseUrl}/user-sites/${id}`, data);
    return response.data;
  }

  async deleteUserSite(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/user-sites/${id}`);
    return response.data;
  }

  async deactivateUserSite(id: number, data: DeactivateUserSiteDto): Promise<UserSite> {
    const response = await apiClient.patch(`${this.baseUrl}/user-sites/${id}/deactivate`, data);
    return response.data;
  }

  async activateUserSite(id: number): Promise<UserSite> {
    const response = await apiClient.patch(`${this.baseUrl}/user-sites/${id}/activate`);
    return response.data;
  }

  async getSitesForUser(userId: number): Promise<UserSite[]> {
    const response = await apiClient.get(`${this.baseUrl}/user-sites/user/${userId}/sites`);
    return response.data;
  }

  async getUsersForSite(siteId: number): Promise<UserSite[]> {
    const response = await apiClient.get(`${this.baseUrl}/user-sites/site/${siteId}/users`);
    return response.data;
  }

  // Reports management
  async getAllReports(filters?: ReportFilters): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters?.createdBy) params.append('createdBy', filters.createdBy.toString());
    if (filters?.reportType) params.append('reportType', filters.reportType);
    if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());

    const response = await apiClient.get(`${this.baseUrl}/reports?${params.toString()}`);
    return response.data;
  }

  async getReportById(id: number): Promise<Report> {
    const response = await apiClient.get(`${this.baseUrl}/reports/${id}`);
    return response.data;
  }

  async createReport(data: CreateReportDto): Promise<Report> {
    const response = await apiClient.post(`${this.baseUrl}/reports`, data);
    return response.data;
  }

  async updateReport(id: number, data: UpdateReportDto): Promise<Report> {
    const response = await apiClient.patch(`${this.baseUrl}/reports/${id}`, data);
    return response.data;
  }

  async deleteReport(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.baseUrl}/reports/${id}`);
    return response.data;
  }

  async generateReport(id: number): Promise<{ message: string; reportId: number; generatedAt: string }> {
    const response = await apiClient.post(`${this.baseUrl}/reports/${id}/generate`);
    return response.data;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const response = await apiClient.get(`${this.baseUrl}/reports/user/${userId}`);
    return response.data;
  }

  async getReportTypes(): Promise<{ reportTypes: string[]; count: number }> {
    const response = await apiClient.get(`${this.baseUrl}/reports/types`);
    return response.data;
  }

  async cleanupOldReports(olderThanDays?: number): Promise<{ message: string; cleanedCount: number }> {
    const params = new URLSearchParams();
    if (olderThanDays) params.append('olderThanDays', olderThanDays.toString());

    const response = await apiClient.delete(`${this.baseUrl}/reports/cleanup/old?${params.toString()}`);
    return response.data;
  }
}

export const sitesService = new SitesService();