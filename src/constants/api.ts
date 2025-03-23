// API 기본 URL 설정
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://15.164.251.118:8080';

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
    ROOMS: '/api/chat', // '/api/chat/rooms'에서 '/api/chat'으로 수정
    MESSAGES: '/api/chat/:roomId/message', // 기존대로 유지
    READ: '/api/chat/:roomId/read', // 기존대로 유지
    LEAVE: '/api/chat/:roomId', // '/api/chat/:roomId/leave'에서 수정 (DELETE 메서드 사용)
    UPLOAD_IMAGE: '/api/chat/images/upload', // 기존대로 유지
  },

  // 보관소 관련
  STORAGE: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    UPDATE: '/api/posts/:postId',
    DETAIL: '/api/posts/:postId',
    DELETE: '/api/posts/:postId',
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
    DISCOUNT_ITEMS: '/place/discount',
    RECENT_ITEMS: '/place/discount',
  },
};
