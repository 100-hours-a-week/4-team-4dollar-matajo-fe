import { RouteObject } from 'react-router-dom';
import { UserRole } from '../contexts/AuthContext';

// 페이지 컴포넌트 가져오기
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
import MyPage from '../pages/MyPage/MyPage';
import MyPlace from '../pages/MyPlace/MyPlace';
import MyTrade from '../pages/MyTrade/MyTrade';
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

// 레이아웃 컴포넌트
import MainLayout from '../components/layout/MainLayout';

// 라우트 가드 컴포넌트
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// 라우트 정의
const routes: RouteObject[] = [
  // 공개 라우트 (로그인하지 않아도 접근 가능)
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
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
          { index: true, element: <HomePage /> },
          { path: 'mypage', element: <MyPage /> },
          { path: 'mytrade', element: <MyTrade /> },
          { path: 'myplace', element: <MyPlace /> },
          { path: 'storage', element: <StorageList /> },
          { path: 'storagedetail/:id', element: <StorageDetail /> },
          // 채팅 리스트만 MainLayout에 포함
          { path: 'chat/list', element: <ChatroomList /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      // 채팅 상세 페이지는 MainLayout 없이 독립적으로 렌더링 (네비바 제거)
      { path: 'chat', element: <Chat onBack={() => window.history.back()} /> },
      { path: 'chat/:id', element: <Chat onBack={() => window.history.back()} /> },

      // 보관인 등록 관련 페이지
      { path: 'keeper/registration', element: <KeeperRegistration /> }, // 보관인 등록 시작 페이지
      { path: 'registration/step1', element: <Registration1 /> }, // 보관소 등록 1단계
      { path: 'registration/step2', element: <Registration2 /> }, // 보관소 등록 2단계
      { path: 'registration/step3', element: <Registration3 /> }, // 보관소 등록 3단계
      { path: 'search-address', element: <SearchAddress /> }, // 보관소 장소 검색 페이지지

      // 보관소 수정 페이지
      { path: 'editstorage', element: <EditStorage /> }, // 보관소 등록/수정 페이지
    ],
  },
];

export default routes;
