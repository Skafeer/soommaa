export interface AdvertisementImage {
  id: string;
  url: string;
  isCover: boolean;
}

export interface AdvertisementListItem {
  id: string;
  title: string;
  price: string;
  currency: string;
  condition: string | null;
  images: AdvertisementImage[];
  category: { nameAr: string; slug: string };
  governorate: { nameAr: string };
  city: { nameAr: string };
}

export interface PaginatedAdvertisements {
  items: AdvertisementListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AdvertisementAttributeValueDetail {
  id: string;
  valueText: string | null;
  valueNumber: string | null;
  valueBoolean: boolean | null;
  categoryAttribute: { nameAr: string; type: string };
  option: { valueAr: string } | null;
}

export interface AdvertisementDetail {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  condition: string | null;
  status: string;
  viewsCount: number;
  images: AdvertisementImage[];
  attributeValues: AdvertisementAttributeValueDetail[];
  category: { nameAr: string; slug: string };
  governorate: { nameAr: string };
  city: { nameAr: string };
  user: { id: string; fullName: string; phoneVerifiedAt: string | null; phoneNumber: string };
}
