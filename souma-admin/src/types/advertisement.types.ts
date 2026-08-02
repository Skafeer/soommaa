export interface AdvertisementImage {
  id: string;
  url: string;
  isCover: boolean;
}

export interface PendingAdvertisement {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  condition: string | null;
  status: string;
  createdAt: string;
  images: AdvertisementImage[];
  user: { id: string; fullName: string; phoneNumber: string };
  category: { nameAr: string };
}