import { apiClient } from './client';
import { ApiResponse } from '@/types/auth.types';
import { ReportTargetType } from '@/types/report.types';

interface CreateReportPayload {
  targetType: ReportTargetType;
  advertisementId?: string;
  reportedUserId?: string;
  reason: string;
  description?: string;
}

export const reportApi = {
  create: (payload: CreateReportPayload) =>
    apiClient.post<ApiResponse<{}>>('/reports', payload),
};