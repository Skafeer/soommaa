export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'souma_access_token',
  REFRESH_TOKEN: 'souma_refresh_token',
  USER: 'souma_user',
} as const;