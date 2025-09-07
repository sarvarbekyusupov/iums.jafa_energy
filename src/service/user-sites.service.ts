import { apiClient } from './api-client';
import type {
  CreateUserSiteDto,
  UpdateUserSiteDto,
  UserSiteResponseDto,
  DeactivateUserSiteDto
} from '../types';

interface UserSiteFilters {
  userId?: number;
  siteId?: number;
  role?: 'manager' | 'technician' | 'observer' | 'maintainer';
  accessLevel?: 'read_only' | 'read_write' | 'full_access' | 'admin';
  isActive?: boolean;
}

class UserSitesService {
  private readonly baseUrl = '/api/user-sites';

  // User-Site Management
  async createUserSite(data: CreateUserSiteDto): Promise<UserSiteResponseDto> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getAllUserSites(filters?: UserSiteFilters): Promise<UserSiteResponseDto[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.siteId) params.append('siteId', filters.siteId.toString());
    if (filters?.role) params.append('role', filters.role);
    if (filters?.accessLevel) params.append('accessLevel', filters.accessLevel);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getUserSiteById(id: number): Promise<UserSiteResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateUserSite(id: number, data: UpdateUserSiteDto): Promise<UserSiteResponseDto> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteUserSite(id: number) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // User-specific queries
  async getSitesForUser(userId: number): Promise<UserSiteResponseDto[]> {
    const response = await apiClient.get(`${this.baseUrl}/user/${userId}/sites`);
    return response.data;
  }

  async getUsersForSite(siteId: number): Promise<UserSiteResponseDto[]> {
    const response = await apiClient.get(`${this.baseUrl}/site/${siteId}/users`);
    return response.data;
  }

  // Status management
  async deactivateUserSite(id: number, data: DeactivateUserSiteDto): Promise<UserSiteResponseDto> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/deactivate`, data);
    return response.data;
  }

  async activateUserSite(id: number): Promise<UserSiteResponseDto> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/activate`);
    return response.data;
  }
}

export const userSitesService = new UserSitesService();