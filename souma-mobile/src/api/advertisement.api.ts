import { apiClient } from './client';
import { ApiResponse } from '@/types/auth.types';
import { PaginatedAdvertisements, AdvertisementDetail } from '@/types/advertisement.types';

interface CreateAdvertisementPayload {
  categoryId: string;
  governorateId: string;
  cityId: string;
  title: string;
  description: string;
  price: number;
  condition?: 'NEW' | 'USED';
  attributeValues?: {
    categoryAttributeId: string;
    valueText?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
    optionId?: string;
  }[];
}

export const advertisementApi = {
  list: () => apiClient.get<ApiResponse<PaginatedAdvertisements>>('/advertisements'),
  getById: (id: string) => apiClient.get<ApiResponse<AdvertisementDetail>>(`/advertisements/${id}`),

  create: (payload: CreateAdvertisementPayload) =>
    apiClient.post<ApiResponse<AdvertisementDetail>>('/advertisements', payload),

  uploadImages: (adId: string, imageUris: string[]) => {
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      formData.append('images', {
        uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      } as any);
    });
    return apiClient.post<ApiResponse<any>>(`/advertisements/${adId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  submitForReview: (adId: string) =>
    apiClient.post<ApiResponse<AdvertisementDetail>>(`/advertisements/${adId}/submit`),
};