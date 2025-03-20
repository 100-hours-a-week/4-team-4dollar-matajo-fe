// 사용자 ID 저장
export const setUserId = (userId: string | number): void => {
  localStorage.setItem('user_id', userId.toString());
};

// 사용자 ID 가져오기
export const getUserId = (): number => {
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId, 10) : 0;
};

// 사용자 ID 확인 (있는지 없는지)
export const hasUserId = (): boolean => {
  return !!localStorage.getItem('user_id');
};

// 사용자 ID가 없을 경우 임시 ID 설정
export const ensureUserId = (): number => {
  let userId = getUserId();
  if (userId === 0) {
    userId = 1; // 임시 사용자 ID
    setUserId(userId);
  }
  return userId;
};

// 사용자 토큰 저장
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// 사용자 토큰 가져오기
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// 사용자 정보 저장
export const setUser = (user: any): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 사용자 정보 가져오기
export const getUser = (): any => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// 로그아웃 (모든 인증 정보 삭제)
export const clearAuth = (): void => {
  localStorage.removeItem('user_id');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export default {
  setUserId,
  getUserId,
  hasUserId,
  ensureUserId,
  setToken,
  getToken,
  setUser,
  getUser,
  clearAuth,
};
