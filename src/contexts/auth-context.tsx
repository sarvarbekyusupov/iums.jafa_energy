import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AuthContextType,
  UserResponseDto,
  LoginDto,
  CreateUserDto,
  SetPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateUserDto,
  ApiError
} from '../types/auth';
import { authService } from '../service/auth.service';
import { message } from 'antd';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = authService.getToken();
      if (storedToken) {
        setToken(storedToken);
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
  };

  const login = async (credentials: LoginDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      setToken(response.accessToken);
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        message.success(response.message || 'Login successful');
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error: any) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      message.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const register = async (userData: CreateUserDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      message.success(response.message || 'User created successfully. Check your email for activation link.');
    } catch (error: any) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const activateAccount = async (data: SetPasswordDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.activateAccount(data);
      
      setToken(response.accessToken);
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        message.success(response.message || 'Account activated successfully');
      }
    } catch (error: any) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Account activation failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.forgotPassword(email);
      message.success(response.message || 'Password reset link sent to your email');
    } catch (error: any) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Failed to send password reset email');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.resetPassword(data);
      message.success(response.message || 'Password reset successfully');
    } catch (error: any) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Password reset failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordDto): Promise<void> => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      setIsLoading(true);
      await authService.changePassword(user.id, data);
      message.success('Password changed successfully');
    } catch (error: any) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'Password change failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      setToken(response.accessToken);
      
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      throw error;
    }
  };

  const updateUser = async (id: number, data: UpdateUserDto): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.updateUser(id, data);
      
      if (user && user.id === id) {
        const updatedUser = await authService.getCurrentUser();
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
      
      message.success(response.message || 'User updated successfully');
    } catch (error: any) {
      const apiError = error as ApiError;
      message.error(apiError.message || 'User update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    activateAccount,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};