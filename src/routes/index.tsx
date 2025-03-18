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
          { path: 'storagelist', element: <StorageList /> },
          { path: 'storagedetail', element: <StorageDetail /> },
          { path: 'chatroomlist', element: <ChatroomList /> },
          { path: 'chat', element: <Chat /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },

  // 보관인만 접근 가능한 라우트
  {
    path: '/',
    element: <PrivateRoute requiredRole={UserRole.Keeper} />,
    children: [
      {
<<<<<<< HEAD
        path: '/',
        element: <MainLayout />,
        children: [
          { path: 'myplace', element: <MyPlace /> },
          { path: 'editstorage', element: <EditStorage /> },
        ],
=======
        path: 'myplace',
        element: <MyPlace />,
      },
      {
        path: 'mytrade',
        element: <MyTrade />,
      },
      {
        path: 'storagelist',
        element: <StorageList />,
      },
      {
        path: 'storagedetail',
        element: <StorageDetail />,
      },
      {
        path: 'keeper-registration',
        element: <KeeperRegistration />,
      },
      {
        path: 'registration/step1',
        element: <Registration1 />,
      },
      {
        path: 'registration/step2',
        element: <Registration2 />,
      },
      {
        path: 'registration/step3',
        element: <Registration3 />,
      },
      {
        path: 'editstorage',
        element: <EditStorage />,
      },
      {
        path: 'chatroomlist',
        element: <ChatroomList />,
      },
      {
        path: 'chat',
        element: <Chat />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
>>>>>>> a0fa272c04059a69ecd8b3a18ed2c0cf9ac3753c
      },
    ],
  },

  // 보관인 등록 과정 (의뢰인만 접근 가능)
  {
    path: 'registration',
    element: <PrivateRoute requiredRole={UserRole.Client} />,
    children: [
      { path: 'step1', element: <Registration1 /> },
      { path: 'step2', element: <Registration2 /> },
      { path: 'step3', element: <Registration3 /> },
    ],
  },
];

export default routes;
