import { apiClient } from './api-client';
import type { AvailabilityReport, TemperatureReport } from '../types/availability';

/**
 * Share of daylight time each inverter actually produced, computed by the backend from the stored
 * five-minute readings. Only the stations the signed-in user may see come back.
 */
class AvailabilityService {
  async getReport(from?: string, to?: string): Promise<AvailabilityReport> {
    const response = await apiClient.get<{ data: AvailabilityReport }>('/api/availability', {
      params: { from, to },
    });
    return response.data.data;
  }

  /** Inverter temperatures: now, today's peak, the window's peak and time spent hot. */
  async getTemperatures(days = 30): Promise<TemperatureReport> {
    const response = await apiClient.get<{ data: TemperatureReport }>('/api/temperature', { params: { days } });
    return response.data.data;
  }
}

export const availabilityService = new AvailabilityService();
