import client from '../client';
import { API_PATHS } from '../../../constants/api';
import { updateUserRole } from '../../../utils/formatting/decodeJWT';

// 보관인 등록 동의 요청 타입
interface KeeperAgreementRequest {
  keeper_agreement: boolean;
}

// 보관인 약관 동의 요청 타입
interface KeeperTermsRequest {
  terms_of_service: boolean;
  privacy_policy: boolean;
}

// 보관인 등록 응답 타입
interface KeeperRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

/**
 * 보관인 등록 동의 API 호출
 * @param data 보관인 동의 정보
 * @returns 등록 결과
 */
export const registerKeeperAgreement = async (
  data: KeeperAgreementRequest,
): Promise<KeeperRegistrationResponse> => {
  try {
    console.log('보관인 등록 동의 API 요청 데이터:', data);
    const response = await client.post(API_PATHS.USER.REGISTER_AS_KEEPER, data);
    console.log('보관인 등록 동의 API 응답:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('보관인 등록 동의 실패:', error);

    // 상세 에러 정보 출력
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error('서버 응답 에러:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('서버 응답 없음:', error.request);
    }

    throw error;
  }
};

/**
 * 보관인 약관 동의 API 호출
 * @param data 보관인 약관 동의 정보
 * @returns 등록 결과
 */
export const registerKeeperTerms = async (
  data: KeeperTermsRequest,
): Promise<KeeperRegistrationResponse> => {
  try {
    console.log('보관인 등록 API 요청 데이터:', data);
    console.log('보관인 등록 API 경로:', API_PATHS.USER.REGISTER_AS_KEEPER);

    const response = await client.post(API_PATHS.USER.REGISTER_AS_KEEPER, data);
    console.log('보관인 등록 API 응답:', response.data);

    return {
      success: true,
      message: response.data.message,
      data: {
        accessToken: response.data.data.access_token,
      },
    };
  } catch (error: any) {
    console.error('보관인 약관 동의 실패:', error);

    // 상세 에러 정보 출력
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error('서버 응답 에러:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('서버 응답 없음:', error.request);
    }

    throw error;
  }
};
/**
 * 액세스 토큰에서 사용자 역할을 파싱하여 보관인 여부 확인
 * @returns 보관인 여부
 */

export const checkKeeperRole = (): boolean => {
  try {
    // 로컬 스토리지에서 액세스 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      console.error('액세스 토큰이 없습니다.');
      return false;
    }

    // JWT 토큰 파싱 (payload 부분 추출)
    const payload = accessToken.split('.')[1];
    if (!payload) {
      console.error('유효하지 않은 토큰 형식입니다.');
      return false;
    }

    // Base64 디코딩
    const decodedPayload = atob(payload);

    // JSON 파싱
    const userInfo = JSON.parse(decodedPayload);

    // role 값 확인 (role 값이 2 또는 "KEEPER"인 경우 보관인으로 판단)
    return userInfo.role === 2 || userInfo.role === 'KEEPER';
  } catch (error) {
    console.error('토큰 파싱 중 오류 발생:', error);
    return false;
  }
};
