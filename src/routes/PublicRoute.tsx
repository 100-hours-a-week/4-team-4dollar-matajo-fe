import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  // 이미 로그인한 사용자가 접근할 경우 리다이렉트할 경로
  redirectTo?: string;
}

/**
 * 비로그인 사용자를 위한 공개 라우트 컴포넌트
 * 이미 로그인한 사용자의 경우 redirectTo 경로로 리다이렉트 (기본값: 홈)
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ redirectTo = '/' }) => {
  const { isAuthenticated, loading } = useAuth();

  // 인증 정보 로딩 중일 때 로딩 표시
  // if (loading) {
  //   return <div>로딩 중...</div>;
  // }

  // 이미 로그인한 사용자는 redirectTo 경로로 리다이렉트
  if (isAuthenticated && redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // 비로그인 사용자는 자식 라우트 렌더링
  return <Outlet />;
};

export default PublicRoute;
