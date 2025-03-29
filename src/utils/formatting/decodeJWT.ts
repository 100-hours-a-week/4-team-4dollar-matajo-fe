import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: number;
  role: string;
  nickname: string;
  iat: number;
  exp: number;
}

export const decodeJWT = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};

export const getUserId = (token: string): number | null => {
  const decoded = decodeJWT(token);
  return decoded ? decoded.userId : null;
};

export const getRole = (token: string): string | null => {
  const decoded = decodeJWT(token);
  return decoded ? decoded.role : null;
};

export const getNickname = (token: string): string | null => {
  const decoded = decodeJWT(token);
  return decoded ? decoded.nickname : null;
};

/**
 * JWT 토큰을 디코딩하여 유저 역할을 업데이트하는 함수
 * @param token JWT 토큰
 * @returns void
 */
export const updateUserRole = (token: string): void => {
  try {
    const decoded = decodeJWT(token);

    if (decoded && decoded.role) {
      // 로컬 스토리지에 역할 정보 저장
      localStorage.setItem('userRole', decoded.role);

      // 역할 변경 이벤트 발생
      window.dispatchEvent(
        new CustomEvent('USER_ROLE_CHANGED', {
          detail: { role: decoded.role },
        }),
      );

      console.log('사용자 역할 업데이트 완료:', decoded.role);
    }
  } catch (error) {
    console.error('사용자 역할 업데이트 실패:', error);
  }
};
