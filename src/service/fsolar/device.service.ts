import { apiClient } from '../api-client';
import type {
  FsolarResponse,
  PaginatedResponse,
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
  DeviceSettings,
  SetDeviceSettingRequest,
  SetDeviceSettingResponse,
} from '../../types/fsolar';
import { validateDeviceSn, validateDateRange, validatePagination } from './utils';

const FSOLAR_BASE_URL = '/api/api/fsolar';

/**
 * Fsolar Device Management Service
 * Handles all device-related API calls
 */
class FsolarDeviceService {
  /**
   * 2.1 Get Device List
   * Retrieve paginated list of devices
   * GET /devices/list
   */
  async getDeviceList(params: DeviceListParams): Promise<PaginatedResponse<Device>> {
    validatePagination(params.pageNum, params.pageSize);

    const response = await apiClient.get<FsolarResponse<PaginatedResponse<Device>>>(
      `${FSOLAR_BASE_URL}/devices/list`,
      { params }
    );
    return response.data.data;
  }

  /**
   * 2.2 Query Device Energy Data
   * Query energy production/consumption data for a device
   * GET /device/energy
   */
  async getDeviceEnergy(params: DeviceEnergyParams): Promise<DeviceEnergyData> {
    validateDeviceSn(params.deviceSn);

    const response = await apiClient.get<FsolarResponse<DeviceEnergyData>>(
      `${FSOLAR_BASE_URL}/device/energy`,
      { params }
    );
    return response.data.data;
  }

  /**
   * 2.3 Get Device Basic Info
   * Get basic information about a device
   * GET /device/basic/:deviceSn
   */
  async getDeviceBasicInfo(deviceSn: string): Promise<DeviceBasicInfo> {
    validateDeviceSn(deviceSn);

    const response = await apiClient.get<FsolarResponse<DeviceBasicInfo>>(
      `${FSOLAR_BASE_URL}/device/basic/${deviceSn}`
    );
    return response.data.data;
  }

  /**
   * 2.4 Get Device Historical Data
   * Query historical data for a specific device
   * GET /device/history/:deviceSn
   */
  async getDeviceHistory(
    deviceSn: string,
    params: DeviceHistoryParams
  ): Promise<DeviceHistoricalData> {
    validateDeviceSn(deviceSn);

    const response = await apiClient.get<FsolarResponse<DeviceHistoricalData>>(
      `${FSOLAR_BASE_URL}/device/history/${deviceSn}`,
      { params }
    );
    return response.data.data;
  }

  /**
   * 2.5 Batch Query Device Historical Data
   * Query historical data for multiple devices at once
   * GET /devices/history
   */
  async getBatchDeviceHistory(
    params: BatchDeviceHistoryParams
  ): Promise<BatchDeviceHistoryData> {
    const response = await apiClient.get<FsolarResponse<BatchDeviceHistoryData>>(
      `${FSOLAR_BASE_URL}/devices/history`,
      { params }
    );
    return response.data.data;
  }

  /**
   * 2.6 Query Device Events/Alarms
   * Retrieve events and alarms for a device
   * GET /device/events/:deviceSn
   * Note: Query range cannot exceed 7 days
   */
  async getDeviceEvents(
    deviceSn: string,
    params: DeviceEventsParams
  ): Promise<PaginatedResponse<DeviceEvent>> {
    validateDeviceSn(deviceSn);
    validatePagination(params.pageNum, params.pageSize);
    validateDateRange(params.startTime, params.endTime, 7);

    const response = await apiClient.get<FsolarResponse<PaginatedResponse<DeviceEvent>>>(
      `${FSOLAR_BASE_URL}/device/events/${deviceSn}`,
      { params }
    );
    return response.data.data;
  }

  /**
   * 2.7 Add Devices
   * Add new devices to the system
   * POST /devices/add
   */
  async addDevices(request: AddDeviceRequest): Promise<AddDeviceResponse> {
    if (!request.deviceSaveInfoList || request.deviceSaveInfoList.length === 0) {
      throw new Error('At least one device must be provided');
    }

    const response = await apiClient.post<FsolarResponse<AddDeviceResponse>>(
      `${FSOLAR_BASE_URL}/devices/add`,
      request
    );
    return response.data.data;
  }

  /**
   * 2.8 Delete Devices
   * Delete devices from the system
   * POST /devices/delete
   */
  async deleteDevices(deviceSns: string[]): Promise<DeleteDeviceResponse> {
    if (!deviceSns || deviceSns.length === 0) {
      throw new Error('At least one device SN must be provided');
    }

    const response = await apiClient.post<FsolarResponse<DeleteDeviceResponse>>(
      `${FSOLAR_BASE_URL}/devices/delete`,
      { deviceSns } as DeleteDeviceRequest
    );
    return response.data.data;
  }

  /**
   * 2.9 Get Device Settings
   * Query device configuration settings
   * GET /device/setting/:deviceSn
   */
  async getDeviceSettings(deviceSn: string): Promise<DeviceSettings> {
    validateDeviceSn(deviceSn);

    const response = await apiClient.get<FsolarResponse<DeviceSettings>>(
      `${FSOLAR_BASE_URL}/device/setting/${deviceSn}`
    );
    return response.data.data;
  }

  /**
   * 2.10 Set Device Settings
   * Update device configuration settings
   * POST /device/setting
   */
  async setDeviceSettings(
    request: SetDeviceSettingRequest
  ): Promise<SetDeviceSettingResponse> {
    validateDeviceSn(request.deviceSn);

    if (!request.settingsContent || request.settingsContent.length === 0) {
      throw new Error('At least one setting must be provided');
    }

    const response = await apiClient.post<FsolarResponse<SetDeviceSettingResponse>>(
      `${FSOLAR_BASE_URL}/device/setting`,
      request
    );
    return response.data.data;
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Get all devices (auto-pagination)
   * Fetches all pages and returns combined results
   */
  async getAllDevices(
    filters?: Omit<DeviceListParams, 'pageNum' | 'pageSize'>
  ): Promise<Device[]> {
    const allDevices: Device[] = [];
    let currentPage = 1;
    const pageSize = 100; // Use max allowed

    while (true) {
      const result = await this.getDeviceList({
        pageNum: currentPage,
        pageSize,
        ...filters,
      });

      allDevices.push(...result.dataList);

      // Check if we've fetched all pages
      if (currentPage >= parseInt(result.totalPage)) {
        break;
      }

      currentPage++;
    }

    return allDevices;
  }

  /**
   * Check if device exists
   */
  async deviceExists(deviceSn: string): Promise<boolean> {
    try {
      await this.getDeviceBasicInfo(deviceSn);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get device count
   */
  async getDeviceCount(filters?: Omit<DeviceListParams, 'pageNum' | 'pageSize'>): Promise<number> {
    const result = await this.getDeviceList({
      pageNum: 1,
      pageSize: 1,
      ...filters,
    });
    return parseInt(result.total);
  }

  /**
   * Search devices by name or SN
   */
  async searchDevices(query: string, pageNum: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Device>> {
    return this.getDeviceList({
      pageNum,
      pageSize,
      deviceSn: query,
    });
  }
}

export const fsolarDeviceService = new FsolarDeviceService();
