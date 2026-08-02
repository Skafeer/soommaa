import { apiClient } from './client';
import type { ApiResponse } from '@/types/auth.types';
import type { PendingReport } from '@/types/report.types';

export const reportApi = {
  listPending: () =>
    apiClient.get<ApiResponse<PendingReport[]>>('/reports/admin/pending'),

  resolve: (id: string, status: 'ACTION_TAKEN' | 'DISMISSED') =>
    apiClient.post<ApiResponse<{}>>(`/reports/admin/${id}/resolve`, { status }),
};