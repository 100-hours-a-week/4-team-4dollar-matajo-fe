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
  page: number = 0,
  size: number = 12,
  district?: string,
  neighborhood?: string,
  filter?: string,
) => {
  try {
    // API 호출을 위한 파라미터 설정
    const params: Record<string, any> = {};

    // 필터 파라미터 추가 (백엔드의 실제 API 파라미터 이름에 맞게 조정)
    if (district) params.district = district;
    if (neighborhood) params.neighborhood = neighborhood;

    // 태그 기반 필터링
    if (filter && filter !== '전체') {
      params.filter = filter;
    }

    // 태그 필터링 추가 (선택된 태그를 쿼리 파라미터로 전달)
    if (params.tags) {
      params.tags = params.tags; // 이미 getFilterParams에서 처리됨
    }

    console.log('API 호출 파라미터:', params);

    // API_PATHS.STORAGE.LIST 엔드포인트 사용
    const response = await client.get(API_PATHS.STORAGE.LIST, { params });

    // API 응답 데이터 변환
    console.log('API 응답 데이터:', response.data);

    // 실제 API 응답 구조에 맞게 데이터 추출
    const items = response.data.success && response.data.data ? response.data.data : [];

    const transformedData = {
      data: {
        items: items.map((item: any) => ({
          id: item.post_id,
          name: item.post_title,
          location: item.post_address || '',
          price: item.prefer_price || 0,
          imageUrl: item.post_main_image,
          post_tags: item.post_tags || [],
          // StorageList 컴포넌트가 기대하는 필드 매핑
          itemTypes: item.post_tags || [], // 필터링을 위해 post_tags를 itemTypes에도 매핑
          storageLocation: item.post_tags?.includes('실내')
            ? '실내'
            : item.post_tags?.includes('실외')
              ? '실외'
              : '',
          storageTypes: mapTags(item.post_tags, ['상온 보관', '냉장 보관', '냉동 보관']),
          durationOptions: mapTags(item.post_tags, ['일주일 이내', '한달 이내', '3개월 이상']),
          isValuableItem: item.post_tags?.includes('귀중품') || false,
          keeperId: item.keeper_id || '',
          rating: item.rating || 0,
        })),
        // 페이지네이션 관련 데이터 (API에 없으면 기본값 사용)
        totalPages: 1,
        totalElements: items.length,
        size: items.length,
        number: 0,
      },
    };

    return transformedData;
  } catch (error) {
    console.error('보관소 목록 조회 오류:', error);
    throw error;
  }
};

// 보관소 상세 정보 조회 함수
export const getStorageDetail = async (id: string) => {
  try {
    // API_PATHS.STORAGE.DETAIL 엔드포인트 사용
    const endpoint = API_PATHS.STORAGE.DETAIL.replace(':postId', id);
    return await client.get(endpoint);
  } catch (error) {
    console.error('보관소 상세 정보 조회 오류:', error);
    throw error;
  }
};

// 보관소 삭제 함수
export const deleteStorage = async (id: string) => {
  try {
    // API_PATHS.STORAGE.DELETE 엔드포인트 사용
    const endpoint = API_PATHS.STORAGE.DELETE.replace(':postId', id);
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
