// constants/api.ts
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    KAKAO: '/api/auth/kakao',
    KAKAO_CALLBACK: '/api/auth/kakao/callback',
    VERIFY: '/api/auth/verify',
  },
  USER: {
    ME: '/api/users/me',
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/profile',
  },
  PLACE: {
    NEARBY: '/api/places/nearby',
    SEARCH: '/api/places/search',
    DISCOUNT_ITEMS: '/api/places/discount-items',
    RECENT_ITEMS: '/api/places/recent-items',
    LOCATIONS: {
      SEARCH: '/api/locations/search', // 동 검색 API 추가
    },
  },
  STORAGE: {
    LIST: '/api/storage/list',
    DETAIL: '/api/storage/:postId',
    REGISTER: '/api/storage/register',
    UPDATE: '/api/storage/:postId',
    DELETE: '/api/storage/:postId',
  },
  CHAT: {
    ROOMS: '/api/chat/rooms',
    MESSAGES: '/api/chat/rooms/:roomId/messages',
    SEND: '/api/chat/rooms/:roomId/send',
    CREATE: '/api/chat/rooms/create',
  },
  KEEPER: {
    REGISTER: '/api/keeper/register',
    PROFILE: '/api/keeper/profile',
    UPDATE: '/api/keeper/profile',
  },
};
