import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface PrivateRouteProps {
  requiredRole?: UserRole; // 접근에 필요한 역할
}

/**
 * 인증된 사용자만 접근할 수 있는 라우트를 위한 컴포넌트
 * requiredRole이 지정되면 해당 역할을 가진 사용자만 접근할 수 있음
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 인증 정보 로딩 중일 때 로딩 표시
  // if (loading) {
  //   return <div>로딩 중...</div>;
  // }

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 특정 역할이 요구되는 경우 역할 확인
  if (requiredRole && user?.role !== requiredRole) {
    // 역할에 따른 다른 리다이렉트 처리
    if (requiredRole === UserRole.Keeper && user?.role === UserRole.Client) {
      // 의뢰인이 보관인 전용 페이지에 접근하려고 할 때
      return <Navigate to="/mypage" replace />;
    } else {
      // 그 외의 경우 홈으로 리다이렉트
      return <Navigate to="/" replace />;
    }
  }

  // 조건을 모두 만족하면 자식 라우트 렌더링
  return <Outlet />;
};

export default PrivateRoute;
