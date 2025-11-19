import { apiClient } from './api-client';
import { ApiUrls } from '../api/api-urls';

export interface AssignStationDto {
  userId: number;
  stationId: string;
  provider: 'hopecloud' | 'soliscloud' | 'fsolar';
  stationName: string;
  isOwner?: boolean;
}

export interface UserStationResponse {
  id: number;
  user_id: number;
  station_id: string;
  provider: string;
  station_name: string;
  is_owner: boolean;
  is_active: boolean;
  assigned_at: string;
}

class UserStationsService {
  /**
   * Assign a station to a user (Admin only)
   */
  async assignStation(data: AssignStationDto): Promise<{ message: string; id: number }> {
    try {
      const response = await apiClient.post(ApiUrls.USER_STATIONS.ASSIGN, data);
      return response.data;
    } catch (error) {
      console.error('Error assigning station:', error);
      throw error;
    }
  }

  /**
   * Get all stations assigned to a user
   */
  async getUserStations(userId: number, provider?: string): Promise<UserStationResponse[]> {
    try {
      const url = provider
        ? `${ApiUrls.USER_STATIONS.GET_USER_STATIONS(userId)}?provider=${provider}`
        : ApiUrls.USER_STATIONS.GET_USER_STATIONS(userId);
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stations:', error);
      throw error;
    }
  }

  /**
   * Remove a station assignment from a user (Admin only)
   */
  async removeStation(userId: number, provider: string, stationId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(
        ApiUrls.USER_STATIONS.REMOVE(userId, provider, stationId)
      );
      return response.data;
    } catch (error) {
      console.error('Error removing station:', error);
      throw error;
    }
  }

  /**
   * Get all users assigned to a specific station (Admin only)
   */
  async getStationUsers(provider: string, stationId: string): Promise<UserStationResponse[]> {
    try {
      const response = await apiClient.get(
        ApiUrls.USER_STATIONS.GET_STATION_USERS(provider, stationId)
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching station users:', error);
      throw error;
    }
  }

  /**
   * Deactivate a station assignment (soft delete) (Admin only)
   */
  async deactivateStation(userId: number, provider: string, stationId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(
        ApiUrls.USER_STATIONS.DEACTIVATE(userId, provider, stationId)
      );
      return response.data;
    } catch (error) {
      console.error('Error deactivating station:', error);
      throw error;
    }
  }
}

export const userStationsService = new UserStationsService();
