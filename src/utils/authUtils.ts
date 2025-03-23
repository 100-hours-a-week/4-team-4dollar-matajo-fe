// src/utils/authUtils.ts

/**
 * 사용자 인증 관련 로컬 스토리지 키 및 유틸리티 함수
 */

// 로컬 스토리지 키
export const AUTH_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken', // 리프레시 토큰 추가
  USER_ID: 'userId',
  USER_NICKNAME: 'userNickname',
  USER_ROLE: 'userRole', // 사용자 역할 추가
};

/**
 * 사용자 ID를 로컬 스토리지에 저장
 * @param userId 사용자 ID
 */
export const saveUserId = (userId: string | number): void => {
  localStorage.setItem(AUTH_KEYS.USER_ID, userId.toString());
};

/**
 * 로컬 스토리지에서 사용자 ID 가져오기
 * @returns 사용자 ID 또는 null
 */
export const getUserId = (): number | null => {
  const userId = localStorage.getItem(AUTH_KEYS.USER_ID);
  return userId ? parseInt(userId, 10) : null;
};

/**
 * 인증 토큰을 로컬 스토리지에 저장
 * @param token 인증 토큰
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(AUTH_KEYS.TOKEN, token);
};

/**
 * 로컬 스토리지에서 인증 토큰 가져오기
 * @returns 인증 토큰 또는 null
 */
export const getToken = (): string | null => {
  return localStorage.getItem(AUTH_KEYS.TOKEN);
};

/**
 * 리프레시 토큰을 로컬 스토리지에 저장
 * @param refreshToken 리프레시 토큰
 */
export const saveRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, refreshToken);
};

/**
 * 로컬 스토리지에서 리프레시 토큰 가져오기
 * @returns 리프레시 토큰 또는 null
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
};

/**
 * 사용자 닉네임을 로컬 스토리지에 저장
 * @param nickname 사용자 닉네임
 */
export const saveUserNickname = (nickname: string): void => {
  localStorage.setItem(AUTH_KEYS.USER_NICKNAME, nickname);
};

/**
 * 로컬 스토리지에서 사용자 닉네임 가져오기
 * @returns 사용자 닉네임 또는 null
 */
export const getUserNickname = (): string | null => {
  return localStorage.getItem(AUTH_KEYS.USER_NICKNAME);
};

/**
 * 사용자 역할을 로컬 스토리지에 저장
 * @param role 사용자 역할
 */
export const saveUserRole = (role: string): void => {
  localStorage.setItem(AUTH_KEYS.USER_ROLE, role);
};

/**
 * 로컬 스토리지에서 사용자 역할 가져오기
 * @returns 사용자 역할 또는 null
 */
export const getUserRole = (): string | null => {
  return localStorage.getItem(AUTH_KEYS.USER_ROLE);
};

/**
 * 로그아웃 - 모든 인증 관련 데이터 삭제
 */
export const logout = (): void => {
  localStorage.removeItem(AUTH_KEYS.TOKEN);
  localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(AUTH_KEYS.USER_ID);
  localStorage.removeItem(AUTH_KEYS.USER_NICKNAME);
  localStorage.removeItem(AUTH_KEYS.USER_ROLE);
  // 다른 사용자 관련 데이터가 있다면 함께 삭제
  localStorage.removeItem('user');
};

/**
 * 사용자가 로그인되어 있는지 확인
 * @returns 로그인 여부
 */
export const isLoggedIn = (): boolean => {
  return !!getToken();
};

/**
 * API 요청에 사용할 인증 헤더 객체 반환
 * @returns 인증 헤더 객체
 */
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * 카카오 로그인 결과를 저장
 * @param data 로그인 결과 데이터
 */
export const saveKakaoLoginData = (data: {
  accessToken: string;
  refreshToken?: string;
  userId?: string | number;
  nickname?: string;
  role?: string;
}): void => {
  saveToken(data.accessToken);

  if (data.refreshToken) {
    saveRefreshToken(data.refreshToken);
  }

  if (data.userId) {
    saveUserId(data.userId);
  }

  if (data.nickname) {
    saveUserNickname(data.nickname);
  }

  if (data.role) {
    saveUserRole(data.role);
  }
};
