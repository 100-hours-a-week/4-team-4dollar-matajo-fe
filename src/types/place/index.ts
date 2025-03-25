// Place, DiscountItem, StorageItem 타입 정의
export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  district: string;
  neighborhood: string;
  isPopular: boolean;
}

export interface DiscountItem {
  id: string;
  placeId: string;
  title: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  imageUrl?: string;
}

export interface StorageItem {
  id: string | number;
  name: string;
  location: string;
  price: number;
  imageUrl?: string;
  post_tags?: string[];
  itemTypes?: string[];
  storageTypes?: string[];
  durationOptions?: string[];
  isValuableItem?: boolean;
  keeperId?: string;
  rating?: number;
  post_address?: string;
  post_title?: string;
  post_main_image?: string;
  prefer_price?: number;
}
