import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/auth';

interface PrivateRouteProps {
  requiredRole?: UserRole;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const location = useLocation();
  const { user, loading, isAuthenticated } = useAuth(); // 통합된 인증 상태

  // 로딩 중 상태
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
        <div>인증 확인 중...</div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    console.log('여기 들어오면 안돼!!!!!!!!!!!!!!!!');
    sessionStorage.setItem('returnPath', location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 필요한 역할 확인
  if (requiredRole && user?.role !== requiredRole) {
    // 보관인 권한이 필요한 경우
    if (requiredRole === UserRole.Keeper) {
      return (
        <Navigate
          to="/mypage"
          replace
          state={{
            showKeeperModal: true,
            message: '보관인 권한이 필요한 페이지입니다.',
          }}
        />
      );
    }

    // 기타 권한 부족 시
    return (
      <Navigate
        to="/mypage"
        replace
        state={{
          message: '해당 페이지에 접근 권한이 없습니다.',
        }}
      />
    );
  }

  // 모든 조건 통과 시 페이지 렌더링
  return <Outlet />;
};

export default PrivateRoute;
