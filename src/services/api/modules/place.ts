import client from '../client';
import { API_PATHS } from '../../../constants/api';
import axios from 'axios';
export interface PostByLocation {
  post_id: number;
  address: string;
  // 추가 필드가 있다면 여기에 추가
}
// 장소 타입 정의
export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  district: string; // 구 (예: 영등포구)
  neighborhood: string; // 동 (예: 여의도동)
  isPopular: boolean;
}

// 동 검색 결과 타입 정의
export type DongSearchResult = string;
// 특가 아이템 타입 정의
export interface DiscountItem {
  id: string;
  placeId: string;
  title: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  imageUrl?: string;
}

// 보관소 아이템 타입 정의 (API 응답값에 맞게 수정)
export interface StorageItem {
  id: string | number;
  name: string;
  location: string;
  price: number;
  imageUrl?: string;
  post_tags?: string[]; // API 응답의 post_tags 필드
  itemTypes?: string[]; // 기존 코드와 호환성을 위해 유지
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

// 위치 ID 응답 타입 정의
export interface LocationIdResponse {
  id: number;
  dong: string;
  formatted_address: string;
}

// 위치 ID 캐시 객체 (동일 주소 재검색 시 API 호출 최소화)
const locationIdCache: Record<string, LocationIdResponse> = {};

// 태그를 필터 카테고리별로 매핑하는 도우미 함수
const mapTags = (tags: string[] | undefined, categoryTags: string[]): string[] => {
  if (!tags) return [];
  return tags.filter(tag => categoryTags.includes(tag));
};

// 주변 장소 검색 함수
export const getNearbyPlaces = async (latitude: number, longitude: number, radius: number = 5) => {
  try {
    // 실제 API 호출
    return await client.get(`${API_PATHS.PLACE.NEARBY}`, {
      params: { latitude, longitude, radius },
    });
  } catch (error) {
    console.error('주변 장소 검색 오류:', error);
    throw error;
  }
};

// 장소 검색 함수
export const searchPlaces = async (keyword: string) => {
  try {
    // 실제 API 호출
    return await client.get(`${API_PATHS.PLACE.SEARCH}`, {
      params: { keyword },
    });
  } catch (error) {
    console.error('장소 검색 오류:', error);
    throw error;
  }
};

// 동 검색 함수 (업데이트됨)
export const searchDong = async (keyword: string): Promise<string[]> => {
  try {
    if (!keyword.trim()) return [];

    const response = await client.get(API_PATHS.PLACE.LOCATIONS.AUTOCOMPLETE, {
      params: { dong: keyword },
    });

    // API 응답 구조가 { success: true, message: string, data: string[] } 형태
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('동 검색 오류:', error);
    return [];
  }
};

// 주소 기반 위치 ID 조회 함수 (추가)
export const getLocationId = async (
  formattedAddress: string,
): Promise<LocationIdResponse | null> => {
  try {
    // 캐시에 해당 주소 정보가 있으면 API 호출 없이 반환
    if (locationIdCache[formattedAddress]) {
      console.log('캐시된 위치 ID 사용:', formattedAddress);
      return locationIdCache[formattedAddress];
    }

    // API 호출
    const response = await client.get(API_PATHS.PLACE.LOCATIONS.INFO, {
      params: { formattedAddress },
    });

    // 응답 성공 여부 확인
    if (response.data?.success && response.data.data) {
      // 응답 데이터 캐싱
      const locationData = response.data.data;
      locationIdCache[formattedAddress] = locationData;
      return locationData;
    }

    return null;
  } catch (error) {
    console.error('위치 ID 조회 오류:', error);
    // 오류 발생 시 null 반환
    return null;
  }
};

// 지역 특가 아이템 조회 함수
export const getDiscountItems = async (district: string, neighborhood?: string) => {
  try {
    const params = neighborhood ? { district, neighborhood } : { district };
    return await client.get(`${API_PATHS.PLACE.DISCOUNT_ITEMS}`, { params });
  } catch (error) {
    console.error('특가 아이템 조회 오류:', error);
    throw error;
  }
};

// 최근 거래 내역 조회 함수
export const getRecentItems = async (
  district: string,
  neighborhood?: string,
  limit: number = 10,
) => {
  try {
    const params = neighborhood ? { district, neighborhood, limit } : { district, limit };
    return await client.get(`${API_PATHS.PLACE.RECENT_ITEMS}`, { params });
  } catch (error) {
    console.error('최근 거래 내역 조회 오류:', error);
    throw error;
  }
};

// 보관소 목록 조회 함수 (API 응답값에 맞게 수정)
export const getStorageList = async (
  offset: number = 0,
  limit: number = 10,
  district?: string,
  neighborhood?: string,
): Promise<any> => {
  try {
    const response = await client.get(API_PATHS.POSTS.LIST, {
      params: {
        offset,
        limit,
        district,
        neighborhood,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // JWT 토큰 추가
      },
    });

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        items: response.data.data.map((item: any) => ({
          id: item.post_id,
          name: item.post_title,
          imageUrl: item.post_main_image,
          location: item.post_address,
          price: item.prefer_price,
          post_tags: item.post_tags,
        })),
      },
    };
  } catch (error) {
    console.error('보관소 목록 조회 오류:', error);
    throw error;
  }
};

// 보관소 상세 정보 조회 함수
export const getStorageDetail = async (id: string) => {
  try {
    const endpoint = API_PATHS.POSTS.DETAIL.replace(':postId', id);
    return await client.get(endpoint);
  } catch (error) {
    console.error('보관소 상세 정보 조회 오류:', error);
    throw error;
  }
};

// 보관소 삭제 함수
export const deleteStorage = async (id: string) => {
  try {
    const endpoint = API_PATHS.POSTS.DELETE.replace(':postId', id);
    return await client.delete(endpoint);
  } catch (error) {
    console.error('보관소 삭제 오류:', error);
    throw error;
  }
};

export const getPostsByLocation = async (locationInfoId: number): Promise<PostByLocation[]> => {
  try {
    const response = await client.get(API_PATHS.POSTS.BY_LOCATION, {
      params: { locationInfoId },
    });

    // 응답 성공 여부 확인
    if (response.data?.success) {
      // 게시글이 있는 경우
      if (response.data.message === 'get_posts_by_location_success') {
        return response.data.data || [];
      }
      // 게시글이 없는 경우 (성공이지만 데이터가 비어있음)
      else if (response.data.message === 'no_posts_found') {
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error('위치 기반 게시글 조회 오류:', error);
    return [];
  }
};
