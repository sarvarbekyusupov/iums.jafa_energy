import { apiClient } from './api-client';

export const siteKpisService = {
  createSiteKpi: (data: any): Promise<any> =>
    apiClient.post('/site-kpis', data),

  getAllSiteKpis: (): Promise<any[]> =>
    apiClient.get('/site-kpis'),

  getSiteKpiById: (id: number): Promise<any> =>
    apiClient.get(`/site-kpis/${id}`),

  updateSiteKpi: (id: number, data: any): Promise<any> =>
    apiClient.put(`/site-kpis/${id}`, data),

  deleteSiteKpi: (id: number): Promise<void> =>
    apiClient.delete(`/site-kpis/${id}`),

  getKpisBySite: (siteId: number): Promise<any[]> =>
    apiClient.get(`/site-kpis/site/${siteId}`),

  getKpisByDateRange: (startDate: string, endDate: string): Promise<any[]> =>
    apiClient.get(`/site-kpis/date-range?start=${startDate}&end=${endDate}`),

  calculateSiteEfficiency: (siteId: number): Promise<any> =>
    apiClient.get(`/site-kpis/efficiency/${siteId}`),
};