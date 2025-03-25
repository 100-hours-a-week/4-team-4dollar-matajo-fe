// routes/index.tsx
import { RouteObject } from 'react-router-dom';
import { UserRole } from '../contexts/AuthContext';

// 페이지 컴포넌트 가져오기
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login/index';
import MyPage from '../pages/MyPage';
import MyPlace from '../pages/MyPage/MyPlace'; // 경로 수정
import MyTrade from '../pages/MyPage/MyTrade'; // 경로 수정
import StorageList from '../pages/StorageList/StorageList';
import StorageDetail from '../pages/StorageDetail/StorageDetail';
import KeeperRegistration from '../pages/Keeper/KeeperRegistration';
import Registration1 from '../pages/Registration/Registration1';
import Registration2 from '../pages/Registration/Registration2';
import Registration3 from '../pages/Registration/Registration3';
import SearchAddress from '../pages/Map/SearchAddress';
import ChatroomList from '../pages/Chat/ChatroomList';
import Chat from '../pages/Chat/Chat';
import EditStorage from '../pages/EditStorage/EditStorage';
import NotFoundPage from '../pages/NotFound';
import KakaoCallback from '../pages/Login/KakaoCallback';
import MainRedirect from '../pages/MainRedirect';

// 레이아웃 컴포넌트
import MainLayout from '../components/layout/MainLayout';

// 라우트 가드 컴포넌트
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// 라우트 정의
const routes: RouteObject[] = [
  // 메인 리다이렉트 라우트
  {
    path: '/',
    element: <MainRedirect />,
  },
  // 공개 라우트 (로그인하지 않아도 접근 가능)
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      // 카카오 로그인 콜백 라우트
      {
        path: 'auth/kakao',
        element: <KakaoCallback />,
      },
    ],
  },
  // 인증된 사용자만 접근 가능한 라우트
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { path: 'main', element: <HomePage /> },
          { path: 'mypage', element: <MyPage /> },
          { path: 'mytrade', element: <MyTrade /> },
          { path: 'myplace', element: <MyPlace /> },
          { path: 'storage', element: <StorageList /> },
          { path: 'storagedetail/:id', element: <StorageDetail /> },
          { path: 'chat/list', element: <ChatroomList /> },
        ],
      },
      { path: 'chat', element: <Chat onBack={() => window.history.back()} /> },
      { path: 'chat/:id', element: <Chat onBack={() => window.history.back()} /> },
      { path: 'keeper/registration', element: <KeeperRegistration /> },
      { path: 'registration/step1', element: <Registration1 /> },
      { path: 'registration/step2', element: <Registration2 /> },
      { path: 'registration/step3', element: <Registration3 /> },
      { path: 'search-address', element: <SearchAddress /> },
      { path: 'editstorage', element: <EditStorage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
