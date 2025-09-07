import { apiClient } from './api-client';

interface CreateUserSessionDto {
  userId: number;
  sessionToken: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  deviceInfo?: string;
  location?: string;
  isRememberMe?: boolean;
  metadata?: any;
}

interface UpdateUserSessionDto {
  userId?: number;
  sessionToken?: string;
  refreshToken?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt?: string;
  deviceInfo?: string;
  location?: string;
  isRememberMe?: boolean;
  metadata?: any;
  lastAccessedAt?: string;
}

interface UserSessionResponseDto {
  id: number;
  userId: number;
  sessionToken: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
  location?: string;
  status: 'active' | 'expired' | 'terminated';
  startedAt: string;
  expiresAt: string;
  lastAccessedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  isRememberMe: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface TerminateSessionDto {
  terminationReason?: string;
}

interface UserSessionFilters {
  userId?: number;
  status?: 'active' | 'expired' | 'terminated';
  ipAddress?: string;
  isActive?: boolean;
}

class UserSessionsService {
  private readonly baseUrl = '/api/user-sessions';

  // Session Management
  async createSession(data: CreateUserSessionDto): Promise<UserSessionResponseDto> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getAllSessions(filters?: UserSessionFilters): Promise<UserSessionResponseDto[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.ipAddress) params.append('ipAddress', filters.ipAddress);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await apiClient.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getSessionById(id: number): Promise<UserSessionResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateSession(id: number, data: UpdateUserSessionDto): Promise<UserSessionResponseDto> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteSession(id: number) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // User-specific queries
  async getUserSessions(userId: number): Promise<UserSessionResponseDto[]> {
    const response = await apiClient.get(`${this.baseUrl}/user/${userId}`);
    return response.data;
  }

  async getSessionByToken(sessionToken: string): Promise<UserSessionResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/token/${sessionToken}`);
    return response.data;
  }

  // Session Management
  async terminateSession(id: number, data?: TerminateSessionDto): Promise<UserSessionResponseDto> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/terminate`, data || {});
    return response.data;
  }

  async terminateAllUserSessions(userId: number, data?: TerminateSessionDto): Promise<{ message: string; terminatedCount: number }> {
    const response = await apiClient.patch(`${this.baseUrl}/user/${userId}/terminate-all`, data || {});
    return response.data;
  }

  // Cleanup
  async cleanupExpiredSessions(): Promise<{ message: string; cleanedCount: number }> {
    const response = await apiClient.delete(`${this.baseUrl}/expired`);
    return response.data;
  }
}

export const userSessionsService = new UserSessionsService();