// src/constants/api.ts

// API 기본 URL 설정
export const API_BACKEND_URL =
  process.env.REACT_APP_API_BACKEND_URL || 'http://15.164.251.118:8080';

// API 경로 정의
export const API_PATHS = {
  AUTH: {
    KAKAO: '/auth/kakao',
    REGISTER_AS_KEEPER: '/auth/register-keeper',
    KEEPER_STATUS: '/auth/keeper-status',
    LOGOUT: '/auth/logout',
  },
  PLACE: {
    GET_ALL: '/places',
    GET_BY_ID: '/places',
    CREATE: '/places',
    UPDATE: '/places',
    DELETE: '/places',
    // 장소 관련
    SEARCH: '/place/search',
    NEARBY: '/place/nearby',
    DISCOUNT_ITEMS: '/place/discount',
    RECENT_ITEMS: '/place/discount',
  },
  // 채팅 관련 API 경로
  CHAT: {
    ROOMS: '/chat/rooms',
    MESSAGES: '/chat/rooms/:roomId/messages',
  },
  // 보관소 관련
  STORAGE: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    UPDATE: '/api/posts/:postId',
    DETAIL: '/api/posts/:postId',
    DELETE: '/api/posts/:postId',
  },
};

// API 기본 URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://15.164.251.118:8080';

// 카카오 인증 관련 상수
export const KAKAO_AUTH = {
  REST_API_KEY: process.env.REACT_APP_KAKAO_REST_API_KEY || '244abed4cb1b567f33d22e14fc58a2c5',
  REDIRECT_URI: 'http://localhost:3000/auth/kakao/callback',
  getLoginUrl: () => {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_AUTH.REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_AUTH.REDIRECT_URI)}&response_type=code`;
  },
};
