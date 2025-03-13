import React from 'react';
import { RouteObject } from 'react-router-dom';

// 페이지 컴포넌트 가져오기
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
