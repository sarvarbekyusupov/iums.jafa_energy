import { apiClient } from '../api-client';
import type {
  FsolarResponse,
  AuthTokens,
  AuthStatus,
  RefreshTokenResponse,
  EncryptPasswordRequest,
  EncryptPasswordResponse,
} from '../../types/fsolar';

const FSOLAR_BASE_URL = '/api/fsolar';

/**
 * Fsolar Authentication Service
 * Handles all authentication-related API calls
 */
class FsolarAuthService {
  /**
   * 1.1 Login
   * Note: This is handled automatically by backend. Only use if you need to manually trigger login.
   * POST /auth/login
   */
  async login(): Promise<AuthTokens> {
    const response = await apiClient.post<FsolarResponse<AuthTokens>>(
      `${FSOLAR_BASE_URL}/auth/login`
    );
    return response.data.data;
  }

  /**
   * 1.2 Check Authentication Status
   * Check if backend is authenticated with Fsolar API
   * GET /auth/status
   */
  async getAuthStatus(): Promise<AuthStatus> {
    const response = await apiClient.get<FsolarResponse<AuthStatus>>(
      `${FSOLAR_BASE_URL}/auth/status`
    );
    return response.data.data;
  }

  /**
   * 1.3 Refresh Token
   * Note: This is handled automatically by backend. Only use if you need to manually refresh.
   * POST /auth/refresh
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<FsolarResponse<RefreshTokenResponse>>(
      `${FSOLAR_BASE_URL}/auth/refresh`
    );
    return response.data.data;
  }

  /**
   * 1.4 Logout
   * Logout from Fsolar API and clear cached tokens
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post<FsolarResponse<{}>>(`${FSOLAR_BASE_URL}/auth/logout`);
  }

  /**
   * 1.5 Encrypt Password
   * Encrypt a password using Fsolar's RSA encryption
   * POST /utils/encrypt-password
   */
  async encryptPassword(password: string): Promise<string> {
    const response = await apiClient.post<FsolarResponse<EncryptPasswordResponse>>(
      `${FSOLAR_BASE_URL}/utils/encrypt-password`,
      { password } as EncryptPasswordRequest
    );
    return response.data.data.encryptedPassword;
  }

  /**
   * Check if Fsolar is authenticated
   * Returns true if authenticated, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const status = await this.getAuthStatus();
      return status.authenticated;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get time until token expires in minutes
   */
  async getTokenExpiryMinutes(): Promise<number | null> {
    try {
      const status = await this.getAuthStatus();
      if (!status.authenticated) return null;

      const expiryDate = new Date(status.tokenExpiry);
      const now = new Date();
      const diffMs = expiryDate.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      return diffMinutes;
    } catch (error) {
      return null;
    }
  }
}

export const fsolarAuthService = new FsolarAuthService();
