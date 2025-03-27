// constants/api.ts

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
export const API_BACKEND_URL = API_BASE_URL; // API_BASE_URL과 동일하게 설정

export const KAKAO_AUTH = {
  REST_API_KEY: process.env.REACT_APP_KAKAO_REST_API_KEY || '244abed4cb1b567f33d22e14fc58a2c5',
  REDIRECT_URI: process.env.REACT_APP_KAKAO_REDIRECT_URI || 'http://localhost:3000/auth/kakao',
  getLoginUrl: () => {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_AUTH.REST_API_KEY}&redirect_uri=${encodeURIComponent(KAKAO_AUTH.REDIRECT_URI)}&response_type=code`;
  },
};

export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    KAKAO: '/api/auth/kakao',
    KAKAO_CALLBACK: '/api/auth/kakao/callback',
    VERIFY: '/api/auth/verify',
    KEEPER_STATUS: '/api/auth/keeper-status', // 추가
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
      AUTOCOMPLETE: '/api/locations/autocomplete', // 검색어로 동검색 (이름 변경됨)
      INFO: '/api/locations/info', // 동 테이블 id값 반환 (이름 변경됨)
    },
  },
  STORAGE: {
    LIST: '/api/storage/list',
    DETAIL: '/api/storage/:postId',
    REGISTER: '/api/storage/register',
    UPDATE: '/api/storage/:postId',
    DELETE: '/api/storage/:postId',
    CREATE: '/api/storage/list', // CREATE 속성 추가 (LIST와 동일한 엔드포인트 사용)
  },
  POSTS: {
    BY_LOCATION: '/api/posts/location', // 위치 ID 기반 게시글 조회
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

// 추가: 기본 내보내기
const api = {
  API_BASE_URL,
  API_BACKEND_URL,
  KAKAO_AUTH,
  API_PATHS,
};

export default api;
