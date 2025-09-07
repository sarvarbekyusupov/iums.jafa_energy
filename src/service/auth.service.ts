import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { ApiUrls } from '../api/api-urls';
import type {
  LoginDto,
  CreateUserDto,
  SetPasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateUserDto,
  AuthResponse,
  CreateUserResponse,
  UserResponseDto,
  ApiError
} from '../types/auth';

class AuthService {
  private readonly apiClient = axios.create({
    baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_BASE_URL || 'http://localhost:3000'),
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await this.refreshToken();
            const token = localStorage.getItem('access_token');
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.apiClient(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post(
        ApiUrls.AUTH.LOGIN,
        credentials
      );
      
      if (response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('user_id', response.data.user_id);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async register(userData: CreateUserDto): Promise<CreateUserResponse> {
    try {
      const response: AxiosResponse<CreateUserResponse> = await this.apiClient.post(
        ApiUrls.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async activateAccount(data: SetPasswordDto): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post(
        ApiUrls.AUTH.ACTIVATE,
        data
      );
      
      if (response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('user_id', response.data.user_id);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post(ApiUrls.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.apiClient.post(
        ApiUrls.AUTH.REFRESH
      );
      
      if (response.data.accessToken) {
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('user_id', response.data.user_id);
      }
      
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const data: ForgotPasswordDto = { email };
      const response: AxiosResponse<{ message: string }> = await this.apiClient.post(
        ApiUrls.AUTH.FORGOT_PASSWORD,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.apiClient.post(
        ApiUrls.AUTH.RESET_PASSWORD,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async changePassword(userId: number, data: ChangePasswordDto): Promise<void> {
    try {
      await this.apiClient.patch(ApiUrls.USERS.CHANGE_PASSWORD(userId), data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<UserResponseDto | null> {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) return null;
      
      const response: AxiosResponse<UserResponseDto> = await this.apiClient.get(
        ApiUrls.USERS.GET_BY_ID(parseInt(userId))
      );
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    try {
      const response: AxiosResponse<UserResponseDto[]> = await this.apiClient.get(
        ApiUrls.USERS.GET_ALL
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    try {
      const response: AxiosResponse<UserResponseDto> = await this.apiClient.get(
        ApiUrls.USERS.GET_BY_ID(id)
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateUser(id: number, data: UpdateUserDto): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.apiClient.patch(
        ApiUrls.USERS.UPDATE(id),
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.apiClient.delete(
        ApiUrls.USERS.DELETE(id)
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async toggleUserStatus(id: number): Promise<UserResponseDto> {
    try {
      const response: AxiosResponse<UserResponseDto> = await this.apiClient.patch(
        ApiUrls.USERS.TOGGLE_STATUS(id)
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async verifyUserEmail(id: number): Promise<UserResponseDto> {
    try {
      const response: AxiosResponse<UserResponseDto> = await this.apiClient.patch(
        ApiUrls.USERS.VERIFY_EMAIL(id)
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async resendActivationEmail(id: number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.apiClient.post(
        ApiUrls.USERS.RESEND_ACTIVATION(id)
      );
      return response.data;
    } catch (error: any) {
      console.error('Activation email error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: ApiUrls.USERS.RESEND_ACTIVATION(id),
        userId: id
      });
      throw this.handleError(error);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  private handleError(error: any): ApiError {
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle array of error messages
      let message = 'An error occurred';
      if (Array.isArray(errorData.message)) {
        message = errorData.message.join(', ');
      } else if (typeof errorData.message === 'string') {
        message = errorData.message;
      }
      
      return {
        statusCode: error.response.status,
        message,
        error: errorData.error || 'Unknown Error',
      };
    }
    
    return {
      statusCode: 500,
      message: error.message || 'Network error occurred',
      error: 'Network Error',
    };
  }
}

export const authService = new AuthService();