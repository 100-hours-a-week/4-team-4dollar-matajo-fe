// src/services/api/modules/auth.ts
import client from '../client';
import { API_PATHS, KAKAO_AUTH } from '../../../constants/api';

// 로그인 응답 타입 정의
export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
    userId?: string;
    nickname?: string;
    role?: string;
  };
  message?: string;
  error?: any;
}

/**
 * 카카오 로그인 API 함수 - API 명세서에 따라 GET 메서드로 수정
 * @param code 카카오 인증 코드
 * @returns 로그인 응답
 */

export const kakaoLogin = async (code: string): Promise<LoginResponse> => {
  try {
    console.log('====== 카카오 로그인 API 요청 시작 ======');
    console.log('코드 길이:', code.length);
    console.log('코드의 처음 20자:', code.substring(0, 20));
    console.log('코드의 마지막 20자:', code.substring(code.length - 20));

    // 올바른 엔드포인트 사용 확인
    console.log('API 엔드포인트:', API_PATHS.AUTH.KAKAO);
    console.log('리다이렉트 URI:', KAKAO_AUTH.REDIRECT_URI);

    // 서버가 POST 요청을 기대하므로 다시 POST로 변경
    const response = await client.post(API_PATHS.AUTH.KAKAO, {
      code,
      redirect_uri: KAKAO_AUTH.REDIRECT_URI,
    });

    console.log('응답 상태 코드:', response.status);
    console.log('응답 헤더:', response.headers);
    console.log('응답 데이터:', response.data);
    console.log('====== 카카오 로그인 API 요청 종료 ======');

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error: any) {
    console.error('====== 카카오 로그인 오류 ======');
    console.error('오류 메시지:', error.message);

    if (error.response) {
      console.error('서버 응답:', error.response.status);
      console.error('서버 응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('요청은 보냈으나 응답이 없음');
    } else {
      console.error('요청 설정 중 오류 발생:', error.message);
    }

    return {
      success: false,
      data: {
        accessToken: '',
      },
      message:
        error.response?.data?.message ||
        error.message ||
        '카카오 로그인 처리 중 오류가 발생했습니다.',
      error,
    };
  }
};

/**
 * 로그아웃 API 함수
 * @returns 로그아웃 응답
 */
export const logoutApi = async () => {
  try {
    console.log('로그아웃 시도');
    const response = await client.post(API_PATHS.AUTH.LOGOUT);
    console.log('로그아웃 응답:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return {
      success: false,
      message: '로그아웃 처리 중 오류가 발생했습니다.',
      error,
    };
  }
};

/**
 * 보관인 상태 확인 함수
 * @param userId 사용자 ID
 * @returns 보관인 상태 응답
 */
export const checkKeeperStatus = async (userId: string) => {
  try {
    console.log('보관인 상태 확인 시도:', userId);
    const response = await client.get(`${API_PATHS.AUTH.KEEPER_STATUS}/${userId}`);
    console.log('보관인 상태 확인 응답:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('보관인 상태 확인 오류:', error);
    return {
      success: false,
      message: '보관인 상태 확인 중 오류가 발생했습니다.',
      error,
    };
  }
};

/**
 * 로그인 검증 API 함수
 * @returns 검증 응답
 */
export const verifyAuth = async () => {
  try {
    const response = await client.get(API_PATHS.AUTH.VERIFY);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: '인증 검증에 실패했습니다.',
      error,
    };
  }
};
