import { client } from './client';
import { API_PATHS } from '../constants/api';

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

// 보관소 아이템 타입 정의
export interface StorageItem {
  id: string;
  name: string;
  price: number;
  tags: string[];
  imageUrl?: string;
  location: string;
  keeperId: string;
  rating?: number;
}

// 주변 장소 검색 함수
export const getNearbyPlaces = async (latitude: number, longitude: number, radius: number = 5) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.get(`${API_PATHS.PLACE.NEARBY}`, {
    //   params: { latitude, longitude, radius },
    // });

    // 테스트용 더미 데이터
    return {
      data: {
        places: [
          {
            id: '1',
            name: '여의도 보관함',
            address: '서울특별시 영등포구 여의도동 국제금융로 10',
            latitude: 37.52508,
            longitude: 126.92671,
            district: '영등포구',
            neighborhood: '여의도동',
            isPopular: true,
          },
          {
            id: '2',
            name: '당산 보관함',
            address: '서울특별시 영등포구 당산동 당산로 214',
            latitude: 37.53361,
            longitude: 126.90292,
            district: '영등포구',
            neighborhood: '당산동',
            isPopular: false,
          },
        ],
      },
    };
  } catch (error) {
    console.error('주변 장소 검색 오류:', error);
    throw error;
  }
};

// 장소 검색 함수
export const searchPlaces = async (keyword: string) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.get(`${API_PATHS.PLACE.SEARCH}`, {
    //   params: { keyword },
    // });

    // 테스트용 더미 데이터
    return {
      data: {
        places: [
          {
            id: '1',
            name: '여의도 보관함',
            address: '서울특별시 영등포구 여의도동 국제금융로 10',
            latitude: 37.52508,
            longitude: 126.92671,
            district: '영등포구',
            neighborhood: '여의도동',
            isPopular: true,
          },
        ],
      },
    };
  } catch (error) {
    console.error('장소 검색 오류:', error);
    throw error;
  }
};

// 지역 특가 아이템 조회 함수
export const getDiscountItems = async (district: string, neighborhood?: string) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // const params = neighborhood ? { district, neighborhood } : { district };
    // return await client.get(`${API_PATHS.PLACE.DISCOUNT_ITEMS}`, { params });

    // 테스트용 더미 데이터
    return {
      data: {
        items: [
          {
            id: '1',
            placeId: '1',
            title: '여의도 보관소 특가',
            originalPrice: 15000,
            discountPrice: 8250,
            discountRate: 45,
            imageUrl: 'https://placehold.co/300x200',
          },
          {
            id: '2',
            placeId: '1',
            title: '당산 보관소 특가',
            originalPrice: 12000,
            discountPrice: 7800,
            discountRate: 35,
            imageUrl: 'https://placehold.co/300x200',
          },
        ],
      },
    };
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
    // 실제 API 호출 (현재는 주석 처리)
    // const params = neighborhood ? { district, neighborhood, limit } : { district, limit };
    // return await client.get(`${API_PATHS.PLACE.RECENT_ITEMS}`, { params });

    // 테스트용 더미 데이터
    return {
      data: {
        items: [
          {
            id: '1',
            name: '플레이스테이션',
            price: 12000,
            tags: ['전자기기', '일주일 이내'],
            imageUrl: 'https://placehold.co/64x64',
            location: '여의도동',
            keeperId: 'keeper1',
            rating: 4.5,
          },
          {
            id: '2',
            name: '산세베리아',
            price: 12000,
            tags: ['식물', '장기'],
            imageUrl: 'https://placehold.co/64x64',
            location: '여의도동',
            keeperId: 'keeper2',
            rating: 4.8,
          },
        ],
      },
    };
  } catch (error) {
    console.error('최근 거래 내역 조회 오류:', error);
    throw error;
  }
};

// 보관소 목록 조회 함수
export const getStorageList = async (district?: string, neighborhood?: string, filter?: string) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // const params = { district, neighborhood, filter };
    // return await client.get(`${API_PATHS.PLACE.STORAGE_LIST}`, { params });

    // 테스트용 더미 데이터
    return {
      data: {
        items: [
          {
            id: '1',
            name: '여의도 보관소',
            price: 10000,
            tags: ['24시간', '대형물품', '보안'],
            imageUrl: 'https://placehold.co/64x64',
            location: '여의도동',
            keeperId: 'keeper1',
            rating: 4.5,
          },
          {
            id: '2',
            name: '당산 보관소',
            price: 8000,
            tags: ['냉장', '소형물품'],
            imageUrl: 'https://placehold.co/64x64',
            location: '당산동',
            keeperId: 'keeper2',
            rating: 4.2,
          },
        ],
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
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.get(`${API_PATHS.PLACE.STORAGE_DETAIL}/${id}`);

    // 테스트용 더미 데이터
    return {
      data: {
        id: '1',
        name: '여의도 보관소',
        description: '안전하고 깨끗한 여의도 보관소입니다. 24시간 보안 시스템을 운영하고 있습니다.',
        address: '서울특별시 영등포구 여의도동 국제금융로 10',
        price: 10000,
        tags: ['24시간', '대형물품', '보안'],
        imageUrls: ['https://placehold.co/300x200', 'https://placehold.co/300x200'],
        location: '여의도동',
        keeperId: 'keeper1',
        keeperName: '홍길동',
        keeperRating: 4.5,
        reviews: [
          {
            id: '1',
            userId: 'user1',
            userName: '김철수',
            rating: 5,
            content: '매우 깨끗하고 안전한 보관소입니다. 추천합니다!',
            createdAt: '2023-12-01',
          },
          {
            id: '2',
            userId: 'user2',
            userName: '이영희',
            rating: 4,
            content: '위치가 좋고 서비스가 친절해요.',
            createdAt: '2023-11-25',
          },
        ],
      },
    };
  } catch (error) {
    console.error('보관소 상세 정보 조회 오류:', error);
    throw error;
  }
};
