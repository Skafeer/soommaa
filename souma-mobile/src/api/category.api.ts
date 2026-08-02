import { apiClient } from './client';
import { ApiResponse } from '@/types/auth.types';
import { CategoryListItem, CategoryDetail } from '@/types/category.types';

export const categoryApi = {
  list: () => apiClient.get<ApiResponse<CategoryListItem[]>>('/categories'),
  getById: (id: string) => apiClient.get<ApiResponse<CategoryDetail>>(`/categories/${id}`),
};