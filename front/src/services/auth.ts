import api from './api';
import { User, UserCreate, LoginResponse } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    console.log('Attempting login for user:', username);
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    try {
      const response = await api.post<LoginResponse>('/token', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
    const response = await api.post<User>('/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me/');
    return response.data;
  }
};