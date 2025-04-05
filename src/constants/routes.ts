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
  STORAGE: 'storages',
  STORAGE_DETAIL: 'storages/:id',

  //보관소 수정
  STORAGE_EDIT: '/storages/:id/edit',
  STORAGE_EDIT_DETAILS: '/storages/:id/edit/details',
  STORAGE_EDIT_IMAGES: '/storages/:id/edit/images',

  // 마이페이지 관련
  MYPAGE: 'mypage',
  MYTRADE: 'mytrade',
  MYPLACE: 'myplace',

  // 보관인 등록
  KEEPER_REGISTRATION: 'keeper-registration',

  // 404 페이지
  NOT_FOUND: '*',

  STORAGE_REGISTER: '/storages/register',
  STORAGE_REGISTER_DETAILS: '/storages/register/details',
  STORAGE_REGISTER_IMAGES: '/storages/register/images',
} as const;

export default ROUTES;
