// src/utils/api/authUtils.ts
import { decodeJWT } from '../formatting/decodeJWT';
import { UserRole } from '../../contexts/auth';

/**
 * 로컬 스토리지에서 토큰을 가져오는 함수
 * @returns 저장된 액세스 토큰 또는 null
 */
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('토큰 가져오기 오류:', error);
    return null;
  }
};

/**
 * 사용자가 로그인 상태인지 확인하는 함수
 * @returns 로그인 여부
 */
export const isLoggedIn = (): boolean => {
  try {
    const token = getToken();
    if (!token) return false;

    const decoded = decodeJWT(token);
    if (!decoded) return false;

    // 토큰 만료 확인 (현재 시간이 만료 시간보다 작아야 유효)
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp > now;
  } catch (error) {
    console.error('로그인 상태 확인 오류:', error);
    return false;
  }
};

/**
 * 사용자가 인증된 상태인지 확인하는 함수 (isLoggedIn과 동일하지만 명확한 네이밍을 위해 추가)
 * @returns 인증 여부
 */
export const isAuthenticated = (): boolean => {
  return isLoggedIn();
};

/**
 * 로그아웃 처리 함수 - 토큰 제거 및 이벤트 발생
 */
export const logout = (): void => {
  try {
    localStorage.removeItem('accessToken');

    // 인증 상태 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));

    console.log('로그아웃 성공');
  } catch (error) {
    console.error('로그아웃 처리 오류:', error);
  }
};

/**
 * 토큰 저장 함수
 * @param token JWT 토큰
 */
export const saveToken = (token: string): void => {
  try {
    console.log('토큰 저장 시작:', token.substring(0, 10) + '...');
    localStorage.setItem('accessToken', token);

    // 저장 직후 확인
    const savedToken = localStorage.getItem('accessToken');
    console.log('저장된 토큰 확인:', savedToken ? savedToken.substring(0, 10) + '...' : '없음');

    // 인증 상태 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));

    console.log('토큰 저장 성공');
  } catch (error) {
    console.error('토큰 저장 오류:', error);
  }
};

/**
 * 토큰에서 사용자 ID 추출 함수
 * @returns 사용자 ID 또는 null
 */
export const getUserIdFromToken = (): string | null => {
  try {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded ? decoded.userId.toString() : null;
  } catch (error) {
    console.error('사용자 ID 추출 오류:', error);
    return null;
  }
};

/**
 * 토큰에서 역할 정보 추출 함수
 * @returns 사용자 역할 또는 null
 */
export const getUserRoleInToken = (): string | null => {
  try {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded ? decoded.role : null;
  } catch (error) {
    console.error('사용자 역할 추출 오류:', error);
    return null;
  }
};

/**
 * 사용자가 특정 역할을 가지고 있는지 확인하는 함수
 * @param role 확인할 역할
 * @returns 역할 보유 여부
 */
export const hasRole = (role: UserRole): boolean => {
  try {
    const userRole = getUserRoleInToken();
    return userRole?.toUpperCase() === role.toString().toUpperCase();
  } catch (error) {
    console.error('역할 확인 오류:', error);
    return false;
  }
};

/**
 * 사용자가 보관인인지 확인하는 함수
 * @returns 보관인 여부
 */
export const isKeeper = (): boolean => {
  return hasRole(UserRole.Keeper);
};

/**
 * 사용자가 의뢰인인지 확인하는 함수
 * @returns 의뢰인 여부
 */
export const isClient = (): boolean => {
  return hasRole(UserRole.Client);
};

/**
 * 토큰에서 닉네임 정보 추출 함수
 * @returns 사용자 닉네임 또는 null
 */
export const getNicknameFromToken = (): string | null => {
  try {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded ? decoded.nickname : null;
  } catch (error) {
    console.error('닉네임 추출 오류:', error);
    return null;
  }
};
