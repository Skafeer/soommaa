import { AdvertisementListItem } from './advertisement.types';

export interface FavoriteItem {
  id: string;
  advertisementId: string;
  createdAt: string;
  advertisement: AdvertisementListItem;
}
