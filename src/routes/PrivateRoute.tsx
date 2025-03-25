import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRoleInToken } from '../utils/api/authUtils';
import { UserRole } from '../contexts/auth';

interface PrivateRouteProps {
  requiredRole?: UserRole;
}

/**
 * 인증된 사용자만 접근할 수 있는 Private Route 컴포넌트
 * requiredRole이 지정되면 해당 역할을 가진 사용자만 접근할 수 있음
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<{
    isChecking: boolean;
    isAllowed: boolean;
  }>({
    isChecking: true,
    isAllowed: false,
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        // 기본 인증 확인
        if (!isAuthenticated()) {
          setAuthState({ isChecking: false, isAllowed: false });
          return;
        }

        // 역할 확인이 필요한 경우
        if (requiredRole) {
          const userRole = getUserRoleInToken()?.toUpperCase() ?? '';
          const hasRequiredRole = userRole === requiredRole.toString().toUpperCase();
          setAuthState({ isChecking: false, isAllowed: hasRequiredRole });
          return;
        }

        // 일반 인증된 사용자
        setAuthState({ isChecking: false, isAllowed: true });
      } catch (error) {
        console.error('인증 확인 중 오류 발생:', error);
        setAuthState({ isChecking: false, isAllowed: false });
      }
    };

    checkAuth();
  }, [requiredRole]);

  // 로딩 상태
  if (authState.isChecking) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
        <div>인증 확인 중...</div>
      </div>
    );
  }

  // 접근 권한 확인
  if (!authState.isAllowed) {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    // 보관인 권한 필요
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

    // 기타 권한 오류
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

  return <Outlet />;
};

export default PrivateRoute;
