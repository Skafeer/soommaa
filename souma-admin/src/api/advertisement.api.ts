import { apiClient } from './client';
import type { ApiResponse } from '@/types/auth.types';
import type { PendingAdvertisement } from '@/types/advertisement.types';

export const advertisementApi = {
  listPending: () =>
    apiClient.get<ApiResponse<PendingAdvertisement[]>>('/advertisements/admin/pending'),

  approve: (id: string) =>
    apiClient.post<ApiResponse<{}>>(`/advertisements/admin/${id}/approve`),

  reject: (id: string, reason: string) =>
    apiClient.post<ApiResponse<{}>>(`/advertisements/admin/${id}/reject`, { reason }),
};