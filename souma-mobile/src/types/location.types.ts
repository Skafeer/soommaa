export interface City {
  id: string;
  nameAr: string;
}

export interface Governorate {
  id: string;
  nameAr: string;
  cities: City[];
}