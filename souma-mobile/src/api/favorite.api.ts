import { apiClient } from './client';
import { ApiResponse } from '@/types/auth.types';
import { FavoriteItem } from '@/types/favorite.types';

export const favoriteApi = {
  list: () => apiClient.get<ApiResponse<FavoriteItem[]>>('/favorites'),
  add: (advertisementId: string) => apiClient.post<ApiResponse<{}>>(`/favorites/${advertisementId}`),
  remove: (advertisementId: string) => apiClient.delete<ApiResponse<{}>>(`/favorites/${advertisementId}`),
};
