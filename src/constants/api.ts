// API 기본 URL 설정
export const API_BASE_URL = 'https://api.matoajo.store';

// API 경로 정의
export const API_PATHS = {
  // 인증 관련
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VALIDATE_TOKEN: '/auth/validate',
    REGISTER_AS_KEEPER: '/auth/register-keeper',
    KEEPER_STATUS: '/auth/keeper-status',
  },

  // 채팅 관련
  CHAT: {
    ROOMS: '/chat/rooms',
    MESSAGES: '/chat/messages',
  },

  // 보관소 관련
  STORAGE: {
    LIST: '/storage/list',
    DETAIL: '/storage/detail',
    CREATE: '/storage/create',
    UPDATE: '/storage/update',
    DELETE: '/storage/delete',
  },

  // 사용자 관련
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },

  // 장소 관련
  PLACE: {
    SEARCH: '/place/search',
    NEARBY: '/place/nearby',
  },
};
