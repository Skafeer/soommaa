import { apiClient } from './client';
import { ApiResponse } from '@/types/auth.types';
import { PaginatedAdvertisements, AdvertisementDetail } from '@/types/advertisement.types';

export const advertisementApi = {
  list: () => apiClient.get<ApiResponse<PaginatedAdvertisements>>('/advertisements'),
  getById: (id: string) => apiClient.get<ApiResponse<AdvertisementDetail>>(`/advertisements/${id}`),
};
