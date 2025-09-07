import { apiClient } from './api-client';

interface TimezoneInfo {
  name: string;
  displayName: string;
  offset: string;
  abbreviation: string;
  region: string;
}

interface TimezoneResponseDto {
  timezones: TimezoneInfo[];
  count: number;
}

interface SetTimezoneDto {
  timezone: string;
}

interface CurrentTimezoneInfo {
  timezone: string;
  displayName: string;
  offset: string;
  currentTime: string;
}

class TimezoneService {
  private readonly baseUrl = '/api/timezone';

  // Timezone Information
  async getPopularTimezones(): Promise<TimezoneResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/popular`);
    return response.data;
  }

  async getAllTimezones(): Promise<TimezoneResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/all`);
    return response.data;
  }

  async getCurrentTimezone(): Promise<CurrentTimezoneInfo> {
    const response = await apiClient.get(`${this.baseUrl}/current`);
    return response.data;
  }

  // Timezone Management
  async setTimezone(data: SetTimezoneDto) {
    const response = await apiClient.post(`${this.baseUrl}/set`, data);
    return response.data;
  }
}

export const timezoneService = new TimezoneService();