// src/constants/api.ts

// API 기본 URL 설정
export const API_BACKEND_URL = process.env.REACT_APP_API_BACKEND_URL || 'http://43.201.83.7:8080';

// API 경로 정의
export const API_PATHS = {
  // 인증 관련
  AUTH: {
    KAKAO: '/kakao',
    KEEPER_STATUS: '/auth/keeper-status',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // 채팅 관련
  CHAT: {
    ROOMS: '/api/chats', // '/api/chat/rooms'에서 '/api/chat'으로 수정
    MESSAGES: '/api/chats/:roomId/message', // 기존대로 유지
    READ: '/api/chats/:roomId/read', // 기존대로 유지
    LEAVE: '/api/chats/:roomId', // '/api/chat/:roomId/leave'에서 수정 (DELETE 메서드 사용)
    UPLOAD_IMAGE: '/api/chats/images/upload', // 기존대로 유지
    TRADE_INFO: '/api/trades',
  },

  // 보관소 관련
  STORAGE: {
    LIST: '/api/posts',
    CREATE: '/api/posts',
    UPDATE: '/api/posts/:postId',
    DETAIL: '/api/posts/:postId',
    DELETE: '/api/posts/:postId',
    VISIBLE: '/api/posts/:postId/visibility',
  },

  // 사용자 관련
  USER: {
    PROFILE: '/api/users/nickname',
    UPDATE: '/api/users/nickname',
    REGISTER_AS_KEEPER: '/api/users/keeper',
  },

  // 사용자 관련
  MYPAGE: {
    TRADE: '/api/my/trades',
    PLACE: '/api/my/posts',
  },

  // 장소 관련
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
};

// 카카오 인증 관련 상수
export const KAKAO_AUTH = {
  REST_API_KEY: process.env.REACT_APP_KAKAO_REST_API_KEY || '9655a3f1781523203be3afb00ad486e4',
  REDIRECT_URI: process.env.REACT_APP_KAKAO_REDIRECT_URI || 'https://matajo.store/kakao',
  getLoginUrl: () => {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_AUTH.REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_AUTH.REDIRECT_URI)}&response_type=code`;
  },
};
