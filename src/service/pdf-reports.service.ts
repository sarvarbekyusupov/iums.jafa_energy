import { apiClient } from './api-client';

interface DateRangeDto {
  startDate: string;
  endDate: string;
}

interface GenerateReportDto {
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  dateRange: DateRangeDto;
  siteIds?: number[];
  includeCharts?: boolean;
  format?: 'pdf' | 'html';
  template?: string;
}

interface GenerateDailyReportDto {
  date: string;
  siteIds?: number[];
}

interface GenerateMonthlyReportDto {
  month: string;
  siteIds?: number[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
}

interface GeneratedReport {
  id: string;
  fileName: string;
  reportType: string;
  generatedAt: string;
  size: number;
  status: string;
}

interface ServiceHealth {
  status: string;
  uptime: number;
  templatesLoaded: number;
  reportsGenerated: number;
}

class PdfReportsService {
  private readonly baseUrl = '/api/pdf-reports';

  // Report Generation
  async generateCustomReport(data: GenerateReportDto) {
    const response = await apiClient.post(`${this.baseUrl}/generate`, data);
    return response.data;
  }

  async generateDailyReport(data: GenerateDailyReportDto) {
    const response = await apiClient.post(`${this.baseUrl}/daily`, data);
    return response.data;
  }

  async generateMonthlyReport(data: GenerateMonthlyReportDto) {
    const response = await apiClient.post(`${this.baseUrl}/monthly`, data);
    return response.data;
  }

  async generateAndEmailReport(data: any) {
    const response = await apiClient.post(`${this.baseUrl}/email`, data);
    return response.data;
  }

  // Templates and Management
  async getServiceHealth(): Promise<ServiceHealth> {
    const response = await apiClient.get(`${this.baseUrl}/health`);
    return response.data;
  }

  async listTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/templates`);
    return response.data;
  }

  async listGeneratedReports(limit?: string): Promise<GeneratedReport[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);

    const response = await apiClient.get(`${this.baseUrl}/reports?${params.toString()}`);
    return response.data;
  }

  // File Download
  async downloadReport(fileName: string): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/download/${fileName}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const pdfReportsService = new PdfReportsService();