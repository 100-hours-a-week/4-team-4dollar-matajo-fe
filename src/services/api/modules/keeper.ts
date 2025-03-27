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
    accessToken?: string;
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
    const response = await client.post(API_PATHS.USER.REGISTER_AS_KEEPER, data);
    return response.data;
  } catch (error) {
    console.error('보관인 등록 동의 실패:', error);
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
    const response = await client.post(API_PATHS.USER.REGISTER_AS_KEEPER, data);

    // 성공 응답에 새 토큰이 포함된 경우 역할 업데이트
    if (response.data.success && response.data.data?.accessToken) {
      // 새 토큰 저장
      localStorage.setItem('accessToken', response.data.data.accessToken);

      // 직접 updateUserRole 함수 가져와서 호출
      updateUserRole(response.data.data.accessToken);

      // 역할 변경 이벤트 발생
      window.dispatchEvent(
        new CustomEvent('USER_ROLE_CHANGED', {
          detail: { role: 2 }, // 보관인 역할을 명시적으로 설정
        }),
      );
    }

    return response.data;
  } catch (error) {
    console.error('보관인 약관 동의 실패:', error);
    throw error;
  }
};

/**
 * 보관인 역할 확인 API 호출
 * @returns 보관인 여부
 */
export const checkKeeperRole = async (): Promise<boolean> => {
  try {
    const response = await client.get(API_PATHS.USER.ME);
    // 응답에서 role 정보를 확인하여 보관인 여부 리턴
    // role 값이 2인 경우 보관인으로 가정 (실제 값은 API 명세에 따라 조정)
    return response.data?.data?.role === 2;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    return false;
  }
};
