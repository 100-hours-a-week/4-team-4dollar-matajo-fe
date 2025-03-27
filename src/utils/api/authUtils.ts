// src/utils/api/authUtils.ts

import { decodeJWT, getRole, getUserId, getNickname } from '../formatting/decodeJWT';
import { UserRole } from '../../contexts/auth';

// 로그인 데이터 인터페이스
interface KakaoLoginData {
  accessToken: string;
  userId?: string;
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
// saveKakaoLoginData 함수 수정
export const saveKakaoLoginData = (data: KakaoLoginData) => {
  try {
    // accessToken만 저장
    localStorage.setItem('accessToken', data.accessToken);

    // 저장 후 인증 상태 변경 이벤트 발생
    notifyAuthStateChange();

    console.log('로그인 데이터 저장 완료 (accessToken만 저장)');
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
 * 사용자 인증 여부 확인 함수 (isLoggedIn의 별칭)
 * @returns 인증 상태 여부
 */
export const isAuthenticated = (): boolean => {
  return isLoggedIn();
};

/**
 * 사용자 ID 가져오기
 * @returns 사용자 ID 또는 null
 */
export const getUserIdInToken = (): number | null => {
  try {
    const token = getToken();
    if (!token) return null;
    return getUserId(token);
  } catch (error) {
    console.error('토큰에서 역할 추출 중 오류:', error);
    return null;
  }
};

/**
 * JWT 토큰에서 사용자 역할 추출하기
 * @returns 사용자 역할 또는 null
 */
export const getUserRoleInToken = (): string | null => {
  try {
    const token = getToken();
    if (!token) return null;
    return getRole(token);
  } catch (error) {
    console.error('토큰에서 역할 추출 중 오류:', error);
    return null;
  }
};

/**
 * 사용자가 보관인인지 확인
 * @returns 보관인 여부
 */
export const isKeeper = (): boolean => {
  const role = getUserRoleInToken();
  return role === UserRole.Keeper;
};

/**
 * 사용자 닉네임 가져오기 (임시로 하드코딩)
 * @returns 사용자 닉네임
 */
export const getUserNickname = (): string => {
  // 실제로는 서버에서 가져오거나 JWT에서 추출
  return '타조 회원';
};

/**
 * 인증 데이터 저장 (saveKakaoLoginData의 별칭)
 * @param accessToken JWT 토큰
 * @param userId 사용자 ID (선택적)
 * @param role 사용자 역할 (선택적)
 */

export const saveAuthData = (accessToken: string, userId?: string, role?: string): void => {
  // accessToken만 저장하도록 수정
  localStorage.setItem('accessToken', accessToken);

  // 인증 상태 변경 알림
  notifyAuthStateChange();
};
/**
 * 로그아웃 함수 - 로컬 스토리지의 인증 관련 데이터를 모두 삭제
 */
// authUtils.ts의 logout 함수 수정
export const logout = (): void => {
  try {
    // accessToken만 삭제
    localStorage.removeItem('accessToken');

    console.log('로그아웃 처리 완료 (accessToken 삭제)');

    // 인증 상태 변경 이벤트 발생
    notifyAuthStateChange();
  } catch (error) {
    console.error('로그아웃 중 오류:', error);
  }
};

/**
 * 보관인 역할 업데이트 - 새 토큰으로 저장
 * @param accessToken 새 접근 토큰 (새 역할 정보가 포함된)
 */
export const updateUserRole = (accessToken: string): void => {
  try {
    // 기존 토큰 대체
    localStorage.setItem('accessToken', accessToken);

    // 인증 상태 변경 알림
    notifyAuthStateChange();

    console.log('사용자 역할 업데이트 완료');
  } catch (error) {
    console.error('역할 업데이트 중 오류:', error);
  }
};
