import { apiClient } from './client';
import { ApiResponse } from '@/types/auth.types';
import { Governorate } from '@/types/location.types';

export const locationApi = {
  listGovernorates: () => apiClient.get<ApiResponse<Governorate[]>>('/locations/governorates'),
};