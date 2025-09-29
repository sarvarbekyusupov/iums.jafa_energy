import { apiClient } from './api-client';

export interface EquipmentStatistic {
  id: number;
  deviceId: number;
  date: string;
  totalEnergyKwh: string;
  peakPowerKw: string;
  avgPowerKw: string;
  operatingHours: number;
  efficiency: number;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentStatisticsFilters {
  deviceId?: number;
  startDate?: string;
  endDate?: string;
  siteId?: number;
  limit?: number;
}

class EquipmentStatisticsService {
  private readonly baseUrl = '/api/equipment-statistics';

  // Get all equipment statistics
  async getAllEquipmentStatistics(filters?: EquipmentStatisticsFilters): Promise<EquipmentStatistic[]> {
    const params = new URLSearchParams();
    if (filters?.deviceId) params.append('deviceId', filters.deviceId.toString());
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.siteId) params.append('siteId', filters.siteId.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Get daily statistics for a specific device
  async getDailyStats(deviceId: number, filters?: { startDate?: string; endDate?: string }): Promise<EquipmentStatistic[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`${this.baseUrl}/daily/${deviceId}?${params.toString()}`);
    return response.data;
  }

  // Get monthly statistics for a specific device
  async getMonthlyStats(deviceId: number, filters?: { startDate?: string; endDate?: string }): Promise<EquipmentStatistic[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`${this.baseUrl}/monthly/${deviceId}?${params.toString()}`);
    return response.data;
  }

  // Get yearly statistics for a specific device
  async getYearlyStats(deviceId: number, filters?: { startDate?: string; endDate?: string }): Promise<EquipmentStatistic[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`${this.baseUrl}/yearly/${deviceId}?${params.toString()}`);
    return response.data;
  }

  // Get hourly statistics for a specific device (today)
  async getHourlyStats(deviceId: number, date?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await apiClient.get(`${this.baseUrl}/hourly/${deviceId}?${params.toString()}`);
    return response.data;
  }

  // Get statistics by device ID
  async getStatsByDeviceId(deviceId: number): Promise<EquipmentStatistic[]> {
    const response = await apiClient.get(`${this.baseUrl}/device/${deviceId}`);
    return response.data;
  }

  // Get statistics summary for a site
  async getSiteSummary(siteId: number, filters?: { startDate?: string; endDate?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`${this.baseUrl}/site/${siteId}/summary?${params.toString()}`);
    return response.data;
  }
}

export const equipmentStatisticsService = new EquipmentStatisticsService();