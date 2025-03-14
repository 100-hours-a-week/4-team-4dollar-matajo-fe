import React from 'react';
import { RouteObject } from 'react-router-dom';

// 페이지 컴포넌트 가져오기
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
import MyPage from '../pages/MyPage/MyPage';
import MyPlace from '../pages/MyPlace/MyPlace';
import MyTrade from '../pages/MyTrade/MyTrade';
import StorageList from '../pages/StorageList/StorageList';
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
