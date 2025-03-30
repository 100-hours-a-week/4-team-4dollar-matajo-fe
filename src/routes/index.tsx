// routes/index.tsx
import { RouteObject } from 'react-router-dom';
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
import EditStorage from '../pages/EditStorage/EditStorage';
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
      {
        path: ROUTES.HOME,
        element: <MainLayout />,
        children: [
          { path: ROUTES.MAIN, element: <HomePage /> },
          { path: ROUTES.MYPAGE, element: <MyPage /> },
          { path: ROUTES.MYTRADE, element: <MyTrade /> },
          { path: ROUTES.STORAGE, element: <StorageList /> },
          { path: ROUTES.STORAGE_DETAIL, element: <StorageDetail /> },
          { path: ROUTES.CHAT_LIST, element: <ChatroomList /> },
        ],
      },
      { path: ROUTES.CHAT, element: <Chat onBack={() => window.history.back()} /> },
      { path: ROUTES.CHAT_DETAIL, element: <Chat onBack={() => window.history.back()} /> },
      { path: ROUTES.KEEPER_REGISTRATION, element: <KeeperRegistration /> },
    ],
  },

  // 보관인만 접근 가능한 라우트
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'registration',
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
      },
      { path: ROUTES.EDIT_STORAGE, element: <EditStorage /> },
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
