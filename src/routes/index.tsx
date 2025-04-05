// routes/index.tsx
import { RouteObject, Navigate } from 'react-router-dom';
import { UserRole } from '../contexts/auth';

// 페이지 컴포넌트 가져오기
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login/index';
import MyPage from '../pages/MyPage';
import StorageList from '../pages/StorageList/StorageList';
import StorageDetail from '../pages/MyPage/subpages/StorageDetail';
import KeeperRegistration from '../pages/MyPage/subpages/KeeperRegistration';
import ChatroomList from '../pages/Chat/ChatroomList';
import Chat from '../pages/Chat/Chat';
import EditStorageBasic from '../pages/EditStorage/EditStorageBasic';
import EditStorageDetails from '../pages/EditStorage/EditStorageDetails';
import EditStorageImages from '../pages/EditStorage/EditStorageImages';
import NotFoundPage from '../pages/NotFound';
import KakaoCallback from '../pages/Login/KakaoCallback';
import MainRedirect from '../pages/Home/MainRedirect';
import MyPlace from '../pages/MyPage/subpages/MyPlacePage';
import MyTrade from '../pages/MyPage/subpages/MyTradePage';

// 레이아웃 컴포넌트
import MainLayout from '../components/layout/MainLayout';

// 라우트 가드 컴포넌트
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// 라우트 정의
import { ROUTES } from '../constants/routes';

// 새로운 import 추가
import StorageRegistrationBasic from '../pages/Registration/StorageRegistrationBasic';
import StorageRegistrationDetails from '../pages/Registration/StorageRegistrationDetails';
import StorageRegistrationImages from '../pages/Registration/StorageRegistrationImages';

const routes: RouteObject[] = [
  // 메인 리다이렉트 라우트 (초기 진입점)
  {
    path: ROUTES.HOME,
    element: <MainRedirect />,
  },

  // 공개 라우트 (로그인하지 않아도 접근 가능)
  {
    path: ROUTES.HOME,
    element: <PublicRoute />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      // 카카오 로그인 콜백 라우트
      {
        path: ROUTES.KAKAO_CALLBACK,
        element: <KakaoCallback />,
      },
    ],
  },

  // 인증된 사용자만 접근 가능한 라우트
  {
    path: ROUTES.HOME,
    element: <PrivateRoute />,
    children: [
      // MainLayout이 적용되는 라우트들
      {
        element: <MainLayout />,
        children: [
          { path: ROUTES.MAIN, element: <HomePage /> },
          { path: ROUTES.STORAGE, element: <StorageList /> },
          { path: ROUTES.STORAGE_DETAIL, element: <StorageDetail /> },
          { path: ROUTES.CHAT_LIST, element: <ChatroomList /> },
          { path: ROUTES.CHAT, element: <Chat onBack={() => window.history.back()} /> },
          { path: ROUTES.CHAT_DETAIL, element: <Chat onBack={() => window.history.back()} /> },
          { path: ROUTES.KEEPER_REGISTRATION, element: <KeeperRegistration /> },
          // MyPage와 관련 라우트들을 MainLayout 안으로 이동
          {
            path: ROUTES.MYPAGE,
            element: <MyPage />,
            children: [{ path: ROUTES.MYTRADE, element: <MyTrade /> }],
          },
        ],
      },
    ],
  },

  /* // 보관인 등록 라우트 (일반 사용자)
  {
    path: '/registration',
    element: <PrivateRoute />,
    children: [
      {
        path: 'step1',
        element: <StorageRegistrationBasic />,
      },
      {
        path: 'step2',
        element: <StorageRegistrationDetails />,
      },
      {
        path: 'step3',
        element: <StorageRegistrationImages />,
      },
    ],
  }, */

  // 보관소 등록 라우트 (보관인 전용)
  {
    path: '/storages',
    element: <PrivateRoute requiredRole={UserRole.Keeper} />,
    children: [
      {
        path: 'register',
        element: <StorageRegistrationBasic />,
      },
      {
        path: 'register/details',
        element: <StorageRegistrationDetails />,
      },
      {
        path: 'register/images',
        element: <StorageRegistrationImages />,
      },
      { path: ':id/edit', element: <EditStorageBasic /> },
      { path: ':id/edit/details', element: <EditStorageDetails /> },
      { path: ':id/edit/images', element: <EditStorageImages /> },
      { path: ROUTES.MYPLACE, element: <MyPlace /> },
    ],
  },

  // 존재하지 않는 경로에 대한 처리
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFoundPage />,
  },
];

export default routes;
