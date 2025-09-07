import { apiClient } from './api-client';
import { ApiUrls } from '../api/api-urls';
import type { Report, CreateReportDto, UpdateReportDto, ReportFilters } from '../types/api';

class ReportsService {
  async getAllReports(filters?: ReportFilters): Promise<Report[]> {
    const params = new URLSearchParams();
    if (filters?.createdBy) params.append('createdBy', filters.createdBy.toString());
    if (filters?.reportType) params.append('reportType', filters.reportType);
    if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());

    const response = await apiClient.get(`${ApiUrls.REPORTS.GET_ALL}?${params.toString()}`);
    return response.data;
  }

  async getReportById(id: number): Promise<Report> {
    const response = await apiClient.get(ApiUrls.REPORTS.GET_BY_ID(id));
    return response.data;
  }

  async createReport(data: CreateReportDto): Promise<Report> {
    const response = await apiClient.post(ApiUrls.REPORTS.CREATE, data);
    return response.data;
  }

  async updateReport(id: number, data: UpdateReportDto): Promise<Report> {
    const response = await apiClient.patch(ApiUrls.REPORTS.UPDATE(id), data);
    return response.data;
  }

  async deleteReport(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(ApiUrls.REPORTS.DELETE(id));
    return response.data;
  }

  async generateReport(id: number): Promise<{ message: string; reportId: number; generatedAt: string }> {
    const response = await apiClient.post(ApiUrls.REPORTS.GENERATE(id));
    return response.data;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    const response = await apiClient.get(ApiUrls.REPORTS.GET_BY_USER(userId));
    return response.data;
  }

  async getReportTypes(): Promise<{ reportTypes: string[]; count: number }> {
    const response = await apiClient.get(ApiUrls.REPORTS.GET_TYPES);
    return response.data;
  }

  async cleanupOldReports(olderThanDays?: number): Promise<{ message: string; cleanedCount: number }> {
    const params = new URLSearchParams();
    if (olderThanDays) params.append('olderThanDays', olderThanDays.toString());

    const response = await apiClient.delete(`${ApiUrls.REPORTS.CLEANUP_OLD}?${params.toString()}`);
    return response.data;
  }

  async getReportPreview(id: number): Promise<{ html: string; data: any }> {
    const response = await apiClient.get(`${ApiUrls.REPORTS.BASE}/${id}/preview`);
    return response.data;
  }

  async downloadReport(id: number, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const response = await apiClient.get(`${ApiUrls.REPORTS.BASE}/${id}/download/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const reportsService = new ReportsService();