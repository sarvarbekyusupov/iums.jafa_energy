import { apiClient } from './api-client';

interface CreateScheduledReportDto {
  name: string;
  reportType: string;
  schedule: string; // cron expression
  parameters: any;
  recipients: string[];
  isEnabled?: boolean;
}

interface UpdateScheduledReportDto {
  name?: string;
  reportType?: string;
  schedule?: string;
  parameters?: any;
  recipients?: string[];
  isEnabled?: boolean;
}

interface ScheduledReportDto {
  id: string;
  name: string;
  reportType: string;
  schedule: string;
  parameters: any;
  recipients: string[];
  isEnabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CronExample {
  expression: string;
  description: string;
  example: string;
}

interface ReportStatus {
  status: string;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  successCount: number;
  failureCount: number;
}

class ReportSchedulerService {
  private readonly baseUrl = '/api/report-scheduler';

  // Scheduled Report Management
  async getScheduledReports(): Promise<ScheduledReportDto[]> {
    const response = await apiClient.get(`${this.baseUrl}/scheduled-reports`);
    return response.data;
  }

  async createScheduledReport(data: CreateScheduledReportDto): Promise<ScheduledReportDto> {
    const response = await apiClient.post(`${this.baseUrl}/scheduled-reports`, data);
    return response.data;
  }

  async updateScheduledReport(id: string, data: UpdateScheduledReportDto): Promise<ScheduledReportDto> {
    const response = await apiClient.put(`${this.baseUrl}/scheduled-reports/${id}`, data);
    return response.data;
  }

  async deleteScheduledReport(id: string) {
    const response = await apiClient.delete(`${this.baseUrl}/scheduled-reports/${id}`);
    return response.data;
  }

  // Report Execution
  async triggerScheduledReport(id: string) {
    const response = await apiClient.post(`${this.baseUrl}/scheduled-reports/${id}/trigger`);
    return response.data;
  }

  async getScheduledReportStatus(id: string): Promise<ReportStatus> {
    const response = await apiClient.get(`${this.baseUrl}/scheduled-reports/${id}/status`);
    return response.data;
  }

  // Utilities
  async sendTestEmail(email: string) {
    const response = await apiClient.post(`${this.baseUrl}/test-email/${email}`);
    return response.data;
  }

  async getCronExamples(): Promise<CronExample[]> {
    const response = await apiClient.get(`${this.baseUrl}/cron-examples`);
    return response.data;
  }
}

export const reportSchedulerService = new ReportSchedulerService();