import client from '../client';
import { API_PATHS } from '../../../constants/api';
import { registerKeeperTerms } from './keeper';

// 백엔드 API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * 사용자 프로필 정보를 조회하는 함수
 * @returns Promise<UserProfile> 사용자 프로필 정보를 담은 Promise
 */
export interface UserProfile {
  userId: string;
  nickname: string;
  email: string;
  profileImage?: string;
  isKeeper: boolean;
  createdAt: string;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await client.get<ApiResponse<UserProfile>>(API_PATHS.USER.PROFILE);

    if (response.data.success) {
      return response.data.data;
    } else {
      console.error('프로필 조회 실패:', response.data.message);
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('프로필 API 호출 오류:', error);
    throw error;
  }
};

interface KeeperRegistrationData {
  terms_of_service: boolean;
  privacy_policy: boolean;
}

/**
 * 보관인 등록 함수 (keeper.ts의 registerKeeperTerms 함수 사용)
 * @deprecated - keeper.ts의 registerKeeperTerms 함수를 사용하세요.
 */
export const registerAsKeeper = async (termsData: {
  terms_of_service: boolean;
  privacy_policy: boolean;
}) => {
  console.warn(
    'registerAsKeeper 함수는 deprecated 되었습니다. keeper.ts의 registerKeeperTerms 함수를 사용해주세요.',
  );
  return registerKeeperTerms(termsData);
};

export interface PlaceItem {
  post_id: number;
  post_title: string;
  post_address: string;
  post_main_image: string;
  hidden_status: boolean;
  prefer_price: number;
  created_at: string;
}

export const getUserPlaces = async (): Promise<PlaceItem[]> => {
  // 임시 목업 데이터
  const mockData: PlaceItem[] = [
    {
      post_id: 13,
      post_title: '케아네집',
      post_address: '부산 부산진구 신천대로 241',
      post_main_image:
        'https://matajo-image.s3.ap-northeast-2.amazonaws.com/post/2e807462-62eb-44cd-8939-1651734adc15.jpg',
      hidden_status: false,
      prefer_price: 32324,
      created_at: '2025.03.27 13:26:27',
    },
  ];

  return Promise.resolve(mockData);
};

/**
 * 닉네임을 변경하는 함수
 * @param nickname 새로운 닉네임
 * @returns 성공 시 true 반환
 */
export const updateNickname = async (nickname: string, userId: string): Promise<boolean> => {
  try {
    const response = await client.patch<ApiResponse<null>>('/api/users/nickname', {
      nickname,
      userId,
    });

    return response.data.success;
  } catch (error) {
    console.error('닉네임 변경 실패:', error);
    throw error;
  }
};
