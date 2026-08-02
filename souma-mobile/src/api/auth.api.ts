import { apiClient } from './client';
import { ApiResponse, LoginResponse } from '@/types/auth.types';

export const authApi = {
  requestOtp: (phoneNumber: string) =>
    apiClient.post<ApiResponse<{ devCode?: string }>>('/auth/otp/request', { phoneNumber }),

  verifyOtp: (phoneNumber: string, code: string, fullName?: string) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/otp/verify', { phoneNumber, code, fullName }),
};