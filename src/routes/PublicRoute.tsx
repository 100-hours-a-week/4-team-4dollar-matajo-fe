// src/routes/PublicRoute.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  // 리다이렉트 로직은 각 컴포넌트 내부에서 처리
}

/**
 * 비로그인 사용자를 위한 공개 라우트 컴포넌트
 * 이미 로그인한 사용자의 경우 각 컴포넌트에서 개별적으로 리다이렉트 처리
 */
const PublicRoute: React.FC<PublicRouteProps> = () => {
  const { loading } = useAuth();

  // 인증 정보 로딩 중일 때 로딩 표시
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 리다이렉트 로직은 제거하고 각 컴포넌트에서 처리
  return <Outlet />;
};

export default PublicRoute;
