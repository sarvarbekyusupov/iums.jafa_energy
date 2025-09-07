import { apiClient } from './api-client';

interface CreateNotificationDto {
  userId: number;
  type: 'alarm' | 'maintenance' | 'system' | 'report';
  title: string;
  message: string;
  data?: any;
  isRead?: boolean;
  readAt?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
}

interface UpdateNotificationDto {
  userId?: number;
  type?: 'alarm' | 'maintenance' | 'system' | 'report';
  title?: string;
  message?: string;
  data?: any;
  isRead?: boolean;
  readAt?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
}

interface NotificationResponseDto {
  id: number;
  userId: number;
  type: 'alarm' | 'maintenance' | 'system' | 'report';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: string;
  createdAt: string;
}

interface MarkAsReadDto {
  notificationIds: string[];
}

class NotificationsService {
  private readonly baseUrl = '/api/notifications';

  // Notification Management
  async createNotification(data: CreateNotificationDto): Promise<NotificationResponseDto> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  async getAllNotifications(): Promise<NotificationResponseDto[]> {
    const response = await apiClient.get(this.baseUrl);
    return response.data;
  }

  async getNotificationById(id: string): Promise<NotificationResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateNotification(id: string, data: UpdateNotificationDto): Promise<NotificationResponseDto> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async deleteNotification(id: string) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Mark as Read
  async markAsRead(data: MarkAsReadDto) {
    const response = await apiClient.post(`${this.baseUrl}/read`, data);
    return response.data;
  }
}

export const notificationsService = new NotificationsService();