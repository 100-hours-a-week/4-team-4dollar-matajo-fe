import React from 'react';
import { RouteObject } from 'react-router-dom';

// 페이지 컴포넌트 가져오기
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
import MyPage from '../pages/MyPage/MyPage';
import MyPlace from '../pages/MyPlace/MyPlace';
import MyTrade from '../pages/MyTrade/MyTrade';
import StorageList from '../pages/StorageList/StorageList';
import StorageDetail from '../pages/StorageDetail/StorageDetail';
import Registration1 from '../pages/Registration/Registration1';
import Registration2 from '../pages/Registration/Registration2';
import Registration3 from '../pages/Registration/Registration3';
import ChatroomList from '../pages/Chat/ChatroomList';
import Chat from '../pages/Chat/Chat';
import EditStorage from '../pages/EditStorage/EditStorage';
import NotFoundPage from '../pages/NotFound';

// 레이아웃 컴포넌트
import MainLayout from '../components/layout/MainLayout';

// 라우트 정의
const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'mypage',
        element: <MyPage />,
      },
      {
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
      },
    ],
  },
];

export default routes;
