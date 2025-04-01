// constants/routes.ts

// 라우트 경로 상수 정의
export const ROUTES = {
  // 홈 관련
  HOME: '/',
  MAIN: 'main',

  // 인증 관련
  LOGIN: 'login',
  SIGNUP: 'signup',
  KAKAO_CALLBACK: 'auth/kakao',

  // 채팅 관련
  CHAT_LIST: 'chat/list',
  CHAT: 'chat',
  CHAT_DETAIL: 'chat/:id',

  // 보관소 관련
  STORAGE: 'storage',
  STORAGE_DETAIL: 'storage/:id',

  // 마이페이지 관련
  MYPAGE: 'mypage',
  MYTRADE: 'mytrade',
  MYTRADE_DETAIL: 'mytrade/:id',
  MYPLACE: 'myplace',

  // 보관인 등록
  KEEPER_REGISTRATION: 'keeper-registration',

  // 기타
  EDIT_STORAGE: 'editstorage',

  // 404 페이지
  NOT_FOUND: '*',

  STORAGE_REGISTER: '/storage/register',
  STORAGE_REGISTER_DETAILS: '/storage/register/details',
  STORAGE_REGISTER_IMAGES: '/storage/register/images',
} as const;

export default ROUTES;
