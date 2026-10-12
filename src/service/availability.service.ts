import { apiClient } from './api-client';
import type { AvailabilityReport } from '../types/availability';

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
}

export const availabilityService = new AvailabilityService();
