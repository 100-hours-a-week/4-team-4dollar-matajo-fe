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

/**
 * 닉네임을 변경하는 함수
 * @param nickname 새로운 닉네임
 * @returns 성공 시 true 반환
 */
export const updateNickname = async (nickname: string): Promise<boolean> => {
  try {
    const response = await client.patch<ApiResponse<null>>(API_PATHS.USER.NICKNAME, {
      nickname: nickname,
    });

    return response.data.success;
  } catch (error) {
    console.error('닉네임 변경 실패:', error);
    throw error;
  }
};
