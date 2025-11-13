import api from './api';
import { User, UserCreate, LoginResponse } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('Attempting login for user:', username);
    
    // ИСПРАВЛЕНИЕ: используйте URLSearchParams вместо FormData
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    
    try {
      const response = await api.post<LoginResponse>('/auth/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Правильный Content-Type
        },
      });
      console.log('Login successful, token received');
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  async register(userData: UserCreate): Promise<User> {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  }
};