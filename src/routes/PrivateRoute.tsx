// src/routes/PrivateRoute.tsx (Updated)
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRoleInToken } from '../utils/api/authUtils';
import { useAuth, UserRole } from '../contexts/auth';
// useAuth, UserRole 가져옴

interface PrivateRouteProps {
  requiredRole?: UserRole;
}

/**
 * 인증된 사용자만 접근할 수 있는 Private Route 컴포넌트
 * requiredRole이 지정되면 해당 역할을 가진 사용자만 접근할 수 있음
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const location = useLocation();
  const { user, loading: userLoading } = useAuth(); // ✅ user & loading 상태 가져오기

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
        console.log('인증 상태 확인 시작');

        // 기본 인증 확인 (토큰 존재 및 유효성 검사)
        if (!isAuthenticated()) {
          console.log('사용자가 인증되지 않음');
          setAuthState({ isChecking: false, isAllowed: false });
          return;
        }

        // 역할 확인이 필요한 경우
        if (requiredRole) {
          console.log(`필요한 역할: ${requiredRole} 확인 중`);
          const userRole = getUserRoleInToken()?.toUpperCase() ?? '';
          console.log(`사용자 역할: ${userRole}`);

          const hasRequiredRole = userRole === requiredRole.toString().toUpperCase();
          console.log(`역할 일치 여부: ${hasRequiredRole}`);

          setAuthState({ isChecking: false, isAllowed: hasRequiredRole });
          return;
        }

        // 일반 인증된 사용자
        console.log('인증된 사용자 - 접근 허용');
        setAuthState({ isChecking: false, isAllowed: true });
      } catch (error) {
        console.error('인증 확인 중 오류 발생:', error);
        setAuthState({ isChecking: false, isAllowed: false });
      }
    };

    checkAuth();
  }, [requiredRole, location.pathname]);

  // ✅ 로딩 중에는 화면 렌더링하지 않음
  if (authState.isChecking || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
        <div>인증 확인 중...</div>
      </div>
    );
  }

  // 접근 권한 확인
  if (!authState.isAllowed) {
    // 로그인이 안 된 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated()) {
      console.log('로그인 페이지로 리다이렉트');
      // 로그인 후 돌아올 경로 저장
      sessionStorage.setItem('returnPath', location.pathname);
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    // 보관인 권한 필요한 페이지
    if (requiredRole === UserRole.Keeper) {
      console.log('보관인 권한이 필요한 페이지');
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
    console.log('권한 부족으로 마이페이지로 리다이렉트');
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

  // 인증 및 권한 확인 후 접근 허용
  console.log('페이지 접근 허용');
  return <Outlet />;
};

export default PrivateRoute;
