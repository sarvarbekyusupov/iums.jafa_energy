import { apiClient } from './api-client';

interface SystemHealth {
  status: string;
  uptime: number;
  services: ServiceHealth[];
  database: DatabaseHealth;
  integrations: IntegrationHealth[];
}

interface ServiceHealth {
  name: string;
  status: string;
  uptime: number;
  responseTime: number;
  errorRate: number;
}

interface DatabaseHealth {
  status: string;
  connectionCount: number;
  queryLatency: number;
  diskUsage: number;
}

interface IntegrationHealth {
  name: string;
  status: string;
  lastSync: string;
  errorCount: number;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  requestCount: number;
  errorRate: number;
  throughput: number;
  endpoints: EndpointMetrics[];
}

interface EndpointMetrics {
  path: string;
  method: string;
  responseTime: number;
  requestCount: number;
  errorCount: number;
}

interface MonitoringDashboard {
  systemHealth: SystemHealth;
  performanceMetrics: PerformanceMetrics;
  alerts: MonitoringAlert[];
  recentEvents: MonitoringEvent[];
}

interface MonitoringAlert {
  id: string;
  severity: string;
  message: string;
  service: string;
  timestamp: string;
}

interface MonitoringEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

class MonitoringService {
  private readonly baseUrl = '/api/monitoring';

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiClient.get(`${this.baseUrl}/health`);
    return response.data;
  }

  async getServiceHealthMetrics(): Promise<ServiceHealth[]> {
    const response = await apiClient.get(`${this.baseUrl}/health/services`);
    return response.data;
  }

  async getDatabaseHealth(): Promise<DatabaseHealth> {
    const response = await apiClient.get(`${this.baseUrl}/health/database`);
    return response.data;
  }

  // Integration Health
  async getHopeCloudHealth(): Promise<IntegrationHealth> {
    const response = await apiClient.get(`${this.baseUrl}/health/hopecloud`);
    return response.data;
  }

  async getPdfServiceHealth(): Promise<ServiceHealth> {
    const response = await apiClient.get(`${this.baseUrl}/health/pdf-service`);
    return response.data;
  }

  // Performance
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const response = await apiClient.get(`${this.baseUrl}/performance`);
    return response.data;
  }

  // Dashboard
  async getMonitoringDashboard(): Promise<MonitoringDashboard> {
    const response = await apiClient.get(`${this.baseUrl}/dashboard`);
    return response.data;
  }

  // Actions
  async triggerHealthCheck() {
    const response = await apiClient.post(`${this.baseUrl}/health/check`);
    return response.data;
  }

  async resetMetrics() {
    const response = await apiClient.post(`${this.baseUrl}/metrics/reset`);
    return response.data;
  }
}

export const monitoringService = new MonitoringService();