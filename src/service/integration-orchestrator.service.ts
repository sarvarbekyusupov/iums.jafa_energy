import { apiClient } from './api-client';

interface IntegrationHealth {
  status: string;
  details: any;
}

interface IntegrationStatus {
  realtimeProcessing: boolean;
  dailyProcessing: boolean;
  monthlyProcessing: boolean;
  health: any;
}

interface SystemOverview {
  integrations: any[];
  totalSites: number;
  totalDevices: number;
  totalAlarms: number;
  systemHealth: string;
}

interface SyncResult {
  batchType: string;
  status: string;
  recordsProcessed: number;
  recordsFailed: number;
  startTime: string;
  endTime: string;
  details: any;
}

interface EmergencyShutdownRequest {
  reason: string;
}

class IntegrationOrchestratorService {
  private readonly baseUrl = '/api/integrations';

  // Health and Status
  async getIntegrationHealth(): Promise<IntegrationHealth> {
    const response = await apiClient.get(`${this.baseUrl}/health`);
    return response.data;
  }

  async getIntegrationStatus(): Promise<IntegrationStatus> {
    const response = await apiClient.get(`${this.baseUrl}/status`);
    return response.data;
  }

  async getSystemOverview(): Promise<SystemOverview> {
    const response = await apiClient.get(`${this.baseUrl}/overview`);
    return response.data;
  }

  // Synchronization
  async triggerAllRealtimeSync(): Promise<SyncResult[]> {
    const response = await apiClient.post(`${this.baseUrl}/sync/realtime/all`);
    return response.data;
  }

  async triggerAllDailySync(date?: string): Promise<SyncResult[]> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await apiClient.post(`${this.baseUrl}/sync/daily/all?${params.toString()}`);
    return response.data;
  }

  async triggerAllMonthlySync(): Promise<SyncResult[]> {
    const response = await apiClient.post(`${this.baseUrl}/sync/monthly/all`);
    return response.data;
  }

  // Emergency Controls
  async emergencyShutdown(data: EmergencyShutdownRequest) {
    const response = await apiClient.post(`${this.baseUrl}/emergency/shutdown`, data);
    return response.data;
  }
}

export const integrationOrchestratorService = new IntegrationOrchestratorService();