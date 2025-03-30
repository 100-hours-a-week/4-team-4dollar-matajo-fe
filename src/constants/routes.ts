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
  MYPLACE: 'myplace',

  KEEPER_REGISTRATION: 'keeper/registration',

  // 보관인 등록 단계
  REGISTRATION_STEP1: 'registration/step1',
  REGISTRATION_STEP2: 'registration/step2',
  REGISTRATION_STEP3: 'registration/step3',

  // 기타
  EDIT_STORAGE: 'editstorage',

  // 404 페이지
  NOT_FOUND: '*',
};

export default ROUTES;
