import { apiClient } from './api-client';

interface FusionSolarPlant {
  plantCode: string;
  plantName: string;
  plantAddress: string;
  longitude: number;
  latitude: number;
  capacity: number;
  contactPerson: string;
  contactMethod: string;
  gridConnectionDate: string;
}

interface FusionSolarDevice {
  devId: string;
  devName: string;
  devTypeId: number;
  devType: string;
  stationCode: string;
  longitude: number;
  latitude: number;
  installationDate: string;
  capacity: number;
}

interface FusionSolarSyncResult {
  batchType: string;
  status: string;
  recordsProcessed: number;
  recordsFailed: number;
  startTime: string;
  endTime: string;
  details: any;
}

interface FusionSolarHealthStatus {
  status: 'healthy' | 'unhealthy';
  details: {
    authenticated: boolean;
    tokenExpiry: number;
    circuitBreakerState: string;
    rateLimitCounter: number;
  };
}

interface FusionSolarBatchStatus {
  realtimeProcessing: boolean;
  dailyProcessing: boolean;
  monthlyProcessing: boolean;
  fusionSolarHealth: any;
}

class FusionSolarService {
  private readonly baseUrl = '/api/fusion-solar';

  // Health and Status
  async getHealth(): Promise<FusionSolarHealthStatus> {
    const response = await apiClient.get(`${this.baseUrl}/health`);
    return response.data;
  }

  async getBatchStatus(): Promise<FusionSolarBatchStatus> {
    const response = await apiClient.get(`${this.baseUrl}/status`);
    return response.data;
  }

  // Data Retrieval
  async getPlants(): Promise<FusionSolarPlant[]> {
    const response = await apiClient.get(`${this.baseUrl}/plants`);
    return response.data;
  }

  async getDevices(stationCode: string): Promise<FusionSolarDevice[]> {
    const response = await apiClient.get(`${this.baseUrl}/devices?stationCode=${stationCode}`);
    return response.data;
  }

  // Synchronization
  async triggerRealtimeSync(): Promise<FusionSolarSyncResult> {
    const response = await apiClient.post(`${this.baseUrl}/sync/realtime`);
    return response.data;
  }

  async triggerDailySync(date?: string): Promise<FusionSolarSyncResult> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await apiClient.post(`${this.baseUrl}/sync/daily?${params.toString()}`);
    return response.data;
  }

  async triggerMonthlySync(): Promise<FusionSolarSyncResult> {
    const response = await apiClient.post(`${this.baseUrl}/sync/monthly`);
    return response.data;
  }
}

export const fusionSolarService = new FusionSolarService();