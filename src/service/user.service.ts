import { apiClient } from './api-client';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  SetPasswordDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto
} from '../types';

class UserService {
  private readonly baseUrl = '/api/users';

  // User Management
  async createUser(userData: CreateUserDto) {
    const response = await apiClient.post(this.baseUrl, userData);
    return response.data;
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const response = await apiClient.get(this.baseUrl);
    return response.data;
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async updateUser(id: number, userData: UpdateUserDto) {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Authentication
  async activateAccount(data: SetPasswordDto) {
    const response = await apiClient.post(`${this.baseUrl}/activate`, data);
    return response.data;
  }

  async login(credentials: LoginDto) {
    const response = await apiClient.post(`${this.baseUrl}/login`, credentials);
    return response.data;
  }

  async logout() {
    const response = await apiClient.post(`${this.baseUrl}/logout`);
    return response.data;
  }

  async refreshTokens() {
    const response = await apiClient.post(`${this.baseUrl}/refresh`);
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordDto) {
    const response = await apiClient.post(`${this.baseUrl}/forgot-password`, data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordDto) {
    const response = await apiClient.post(`${this.baseUrl}/reset-password`, data);
    return response.data;
  }

  async changePassword(id: number, data: ChangePasswordDto) {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/change-password`, data);
    return response.data;
  }

  // User Status Management
  async toggleUserStatus(id: number) {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/toggle-status`);
    return response.data;
  }

  async verifyEmail(id: number) {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/verify-email`);
    return response.data;
  }

  async resendActivationEmail(id: number) {
    const response = await apiClient.post(`${this.baseUrl}/${id}/resend-activation`);
    return response.data;
  }
}

export const userService = new UserService();