import { apiClient } from './api-client';

const DB_BASE_URL = '/api/fsolar/db';

class FSolarService {
  // ==================== DEVICE MANAGEMENT ====================

  /**
   * Get all devices with pagination
   * @param params - page, limit
   */
  async getDbDevices(params?: { page?: number; limit?: number }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/devices`, { params });
  }

  /**
   * Get single device by device SN
   * @param deviceSn - Device serial number
   */
  async getDbDevice(deviceSn: string): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}`);
  }

  // ==================== ENERGY MONITORING ====================

  /**
   * Get device energy history
   * @param deviceSn - Device serial number
   * @param params - limit
   */
  async getDbDeviceEnergy(deviceSn: string, params?: { limit?: number }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/energy`, { params });
  }

  /**
   * Get latest energy reading for a device
   * @param deviceSn - Device serial number
   */
  async getDbDeviceEnergyLatest(deviceSn: string): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/energy/latest`);
  }

  /**
   * Get all energy data with pagination
   * @param params - page, limit, deviceSn (filter)
   */
  async getDbEnergy(params?: { page?: number; limit?: number; deviceSn?: string }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/energy`, { params });
  }

  // ==================== HISTORICAL DATA ====================

  /**
   * Get device historical data
   * @param deviceSn - Device serial number
   * @param params - granularity (daily/monthly/yearly), limit
   */
  async getDbDeviceHistory(
    deviceSn: string,
    params?: { granularity?: 'daily' | 'monthly' | 'yearly'; limit?: number }
  ): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/history`, { params });
  }

  /**
   * Get all historical data with pagination
   * @param params - page, limit, deviceSn, granularity
   */
  async getDbHistory(params?: {
    page?: number;
    limit?: number;
    deviceSn?: string;
    granularity?: 'daily' | 'monthly' | 'yearly';
  }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/history`, { params });
  }

  // ==================== EVENTS & ALARMS ====================

  /**
   * Get device events
   * @param deviceSn - Device serial number
   * @param params - limit
   */
  async getDbDeviceEvents(deviceSn: string, params?: { limit?: number }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/devices/${deviceSn}/events`, { params });
  }

  /**
   * Get all events with pagination
   * @param params - page, limit, deviceSn, status
   */
  async getDbEvents(params?: {
    page?: number;
    limit?: number;
    deviceSn?: string;
    status?: 'active' | 'cleared' | 'acknowledged';
  }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/events`, { params });
  }

  /**
   * Get active events only
   * @param params - limit
   */
  async getDbActiveEvents(params?: { limit?: number }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/events/active`, { params });
  }

  // ==================== SYNC OPERATIONS ====================

  /**
   * Trigger manual sync
   * @param data - types array, optional date
   */
  async triggerDbSync(data: {
    types: ('devices' | 'energy' | 'history_daily' | 'events' | 'full')[];
    date?: string;
  }): Promise<any> {
    return apiClient.post(`${DB_BASE_URL}/sync/trigger`, data);
  }

  /**
   * Get sync status
   */
  async getDbSyncStatus(): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/sync/status`);
  }

  /**
   * Get sync history logs
   * @param params - page, limit, type (filter)
   */
  async getDbSyncHistory(params?: { page?: number; limit?: number; type?: string }): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/sync/history`, { params });
  }

  /**
   * Get database statistics
   */
  async getDbStats(): Promise<any> {
    return apiClient.get(`${DB_BASE_URL}/stats`);
  }
}

export default new FSolarService();
