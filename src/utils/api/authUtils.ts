// src/utils/authUtils.ts
import { LoginResponse } from '../../services/api/modules/auth';

// 로그인 데이터 인터페이스
interface KakaoLoginData {
  accessToken: string;
  userId: string;
  role?: string;
}

// 새로운 이벤트를 정의합니다
const AUTH_STATE_CHANGED = 'AUTH_STATE_CHANGED';

/**
 * 인증 상태 변경을 알리는 이벤트를 발생시키는 함수
 */
export const notifyAuthStateChange = () => {
  window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED));
};

/**
 * 카카오 로그인 데이터를 로컬 스토리지에 저장하는 함수
 * @param data 카카오 로그인 데이터
 */
export const saveKakaoLoginData = (data: KakaoLoginData) => {
  try {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('userId', data.userId);

    // role이 존재하는 경우에만 저장
    if (data.role) {
      localStorage.setItem('userRole', data.role);
    }

    // 닉네임은 저장하지 않음
    localStorage.removeItem('userNickname');

    // 저장 후 인증 상태 변경 이벤트 발생
    notifyAuthStateChange();

    console.log('로그인 데이터 저장 완료');
  } catch (error) {
    console.error('로그인 데이터 저장 오류:', error);
  }
};

/**
 * JWT 토큰을 로컬 스토리지에서 가져오는 함수
 * @returns 저장된 토큰 또는 null
 */
export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * 사용자 로그인 여부를 확인하는 함수
 * @returns 로그인 상태 여부
 */
export const isLoggedIn = (): boolean => {
  const token = getToken();
  return !!token;
};

/**
 * 로그아웃 함수 - 로컬 스토리지의 인증 관련 데이터를 모두 삭제
 */
export const logout = (): void => {
  try {
    // 로컬 스토리지 데이터 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userNickname');
    localStorage.removeItem('userRole');

    // 쿠키 정리 (모든 쿠키 삭제)
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    console.log('로그아웃 처리 완료 (로컬 스토리지 및 쿠키 데이터 삭제)');
  } catch (error) {
    console.error('로그아웃 중 오류:', error);
  }
};
