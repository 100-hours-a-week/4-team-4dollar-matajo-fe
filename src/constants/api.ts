// constants/api.ts

if (!process.env.REACT_APP_API_BACKEND_URL) {
  throw new Error('REACT_APP_API_BACKEND_URL is not defined');
}

if (!process.env.REACT_APP_API_URL) {
  throw new Error('REACT_APP_API_URL is not defined');
}

if (!process.env.REACT_APP_KAKAO_REST_API_KEY) {
  throw new Error('REACT_APP_KAKAO_REST_API_KEY is not defined');
}

if (!process.env.REACT_APP_KAKAO_REDIRECT_URI) {
  throw new Error('REACT_APP_KAKAO_REDIRECT_URI is not defined');
}

export const API_BACKEND_URL = process.env.REACT_APP_API_BACKEND_URL;
export const API_URL = process.env.REACT_APP_API_URL;
export const API_BASE_URL = API_BACKEND_URL; // 이전 코드와의 호환성을 위해 추가

export const KAKAO_AUTH = {
  REST_API_KEY: process.env.REACT_APP_KAKAO_REST_API_KEY,
  REDIRECT_URI: process.env.REACT_APP_KAKAO_REDIRECT_URI,
  getLoginUrl: () => {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_AUTH.REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_AUTH.REDIRECT_URI)}&response_type=code`;
  },
};

export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/auth/logout', // 명세서에 맞춰 수정
    REFRESH: '/auth/refresh', // 명세서에 맞춰 수정
    KAKAO: '/auth/kakao', // 명세서에 맞춰 수정
    VERIFY: '/api/auth/verify',
    KEEPER_STATUS: '/api/auth/keeper-status',
  },
  USER: {
    ME: '/api/users/me',
    PROFILE: '/api/users/profile',
    UPDATE: '/api/users/profile',
    REGISTER_AS_KEEPER: '/api/users/keeper',
    NICKNAME: '/api/users/nickname', // 명세서에 맞게 추가
    DELETE: '/api/users', // 명세서에 맞게 추가
  },
  PLACE: {
    NEARBY: '/api/places/nearby',
    SEARCH: '/api/places/search',
    DISCOUNT_ITEMS: '/api/places/discount-items',
    RECENT_ITEMS: '/api/places/recent-items',
    LOCATIONS: {
      AUTOCOMPLETE: '/api/locations/autocomplete',
      INFO: '/api/locations/info',
    },
  },
  POSTS: {
    LIST: '/api/posts',
    DETAIL: '/api/posts/:postId',
    CREATE: '/api/posts',
    UPDATE: '/api/posts/:postId',
    DELETE: '/api/posts/:postId',
    BY_LOCATION: '/api/posts/location',
    MY_POSTS: '/api/posts/my-posts', // 내 보관소 조회용
    TOGGLE_VISIBILITY: '/api/posts/:postId/visibility', // 공개/비공개 전환
    PROMOTION: '/api/posts/promotion', // 로컬 딜 조회
  },
  CHAT: {
    ROOMS: '/api/chats',
    MESSAGES: '/api/chats/:roomId/message',
    CREATE: '/api/chats',
    SEND: '/app/:roomId/message',
    TRADE_INFO: '/api/trades',
    UPLOAD_IMAGE: '/api/chats/image',
    READ: '/api/chats/:roomId/read',
    LEAVE: '/api/chat/:roomId',
    DETAIL: '/api/chats/:roomId',
  },
  KEEPER: {
    REGISTER: '/api/keeper/register',
    PROFILE: '/api/keeper/profile',
    UPDATE: '/api/keeper/profile',
  },
  MYPAGE: {
    STORAGE: '/api/posts/my-posts',
  },
  TRADES: {
    MY_TRADES: '/api/trades/my-trades',
    RECENT_BY_LOCATION: '/api/trades',
  },
};

// 기본 내보내기
const api = {
  API_BASE_URL,
  API_BACKEND_URL,
  API_URL,
  KAKAO_AUTH,
  API_PATHS,
};

export default api;
