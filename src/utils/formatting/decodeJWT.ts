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
