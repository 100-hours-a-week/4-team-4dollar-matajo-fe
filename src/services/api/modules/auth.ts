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
 * 카카오 로그인 API 함수 - POST 메소드 사용
 * @param code 카카오 인증 코드
 * @returns 로그인 응답
 */
export const kakaoLogin = async (code: string): Promise<LoginResponse> => {
  try {
    console.log('====== 카카오 로그인 API 요청 시작 ======');
    console.log('코드 길이:', code.length);
    console.log('코드:', code);

    // 올바른 엔드포인트 사용 확인
    const endpoint = API_PATHS.AUTH.KAKAO;
    console.log('API 엔드포인트:', endpoint);
    console.log('리다이렉트 URI:', KAKAO_AUTH.REDIRECT_URI);

    // POST 메소드 사용 - body로 전달
    const response = await client.post(endpoint, {
      code: code,
    });

    console.log('응답 상태 코드:', response.status);
    console.log('응답 헤더:', response.headers);
    console.log('응답 데이터:', response.data);
    console.log('====== 카카오 로그인 API 요청 종료 ======');

    // 응답 데이터 구조 매핑
    return {
      success: response.data.success,
      data: {
        accessToken: response.data.data.access_token,
        refreshToken: response.data.data.refresh_token,
        nickname: response.data.data.nickname,
      },
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('====== 카카오 로그인 오류 ======');
    console.error('오류 메시지:', error.message);

    // 상세한 오류 로깅
    if (error.response) {
      console.error('서버 응답:', error.response.status);
      console.error('서버 응답 데이터:', error.response.data);
      console.error('요청 URL:', error.config?.url);
      console.error('요청 메소드:', error.config?.method);
      console.error('요청 데이터:', error.config?.data);

      // 특정 오류 타입 확인
      if (error.response.status === 400) {
        console.error('잘못된 요청: 코드 또는 리다이렉트 URI를 확인하세요');
      } else if (error.response.status === 401) {
        console.error('인증 실패: 토큰이 유효하지 않거나 만료되었을 수 있습니다');
      } else if (error.response.status === 404) {
        console.error('엔드포인트를 찾을 수 없음: API 경로를 확인하세요');
      } else if (error.response.status === 405) {
        console.error('허용되지 않는 메소드: HTTP 메소드를 확인하세요 (GET vs POST)');
      } else if (error.response.status === 500) {
        console.error('서버 오류: 백엔드 팀에 문의하세요');
      }
    } else if (error.request) {
      console.error('응답 없음');
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
  // userId 파라미터 검증 추가
  if (!userId) {
    console.error('보관인 상태 확인 실패: userId가 필요합니다');
    return {
      success: false,
      message: '사용자 ID가 필요합니다.',
    };
  }

  try {
    console.log('보관인 상태 확인 시도:', userId);
    const response = await client.get(`${API_PATHS.AUTH.KEEPER_STATUS}/${userId}`);
    console.log('보관인 상태 확인 응답:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('보관인 상태 확인 오류:', error);

    // 더 구체적인 오류 메시지 제공
    let errorMessage = '보관인 상태 확인 중 오류가 발생했습니다.';
    if (error.response?.status === 404) {
      errorMessage = '사용자를 찾을 수 없습니다. 사용자 ID를 확인해주세요.';
    } else if (error.response?.status === 403) {
      errorMessage = '보관인 상태 확인 권한이 없습니다.';
    }

    return {
      success: false,
      message: errorMessage,
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
    console.log('인증 검증 시도');
    const response = await client.get(API_PATHS.AUTH.VERIFY);
    console.log('인증 검증 응답:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('인증 검증 오류:', error);

    let errorMessage = '인증 검증에 실패했습니다.';
    if (error.response?.status === 401) {
      errorMessage = '세션이 만료되었습니다. 다시 로그인해주세요.';
    }

    return {
      success: false,
      message: errorMessage,
      error,
    };
  }
};
