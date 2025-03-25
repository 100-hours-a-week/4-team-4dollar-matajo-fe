import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/api/authUtils';

// UserRole 타입 정의
export enum UserRole {
  Client = '1', // 의뢰인
  Keeper = '2', // 보관인
}

interface PrivateRouteProps {
  requiredRole?: UserRole; // 접근에 필요한 역할 (선택적)
}

/**
 * 인증된 사용자만 접근할 수 있는 Private Route 컴포넌트
 * requiredRole이 지정되면 해당 역할을 가진 사용자만 접근할 수 있음
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // 인증 상태 확인
    const checkAuth = () => {
      setIsChecking(true);

      // 로그인 되어 있는지 확인
      const userAuthenticated = isAuthenticated();

      if (!userAuthenticated) {
        // 로그인되어 있지 않으면 접근 불가
        setIsAllowed(false);
        setIsChecking(false);
        return;
      }

      // 특정 역할이 필요한 경우 역할 확인
      if (requiredRole) {
        const userRole = getUserRole();

        // 사용자 역할이 필요한 역할과 일치하는지 확인
        if (userRole === requiredRole) {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      } else {
        // 역할 제한이 없으면 인증만으로 충분
        setIsAllowed(true);
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [requiredRole]);

  // 인증 확인 중에는 로딩 표시
  if (isChecking) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
        }}
      >
        <img
          src="/tajo-logo.png"
          alt="Logo"
          style={{ width: '80px', height: '80px', marginBottom: '20px' }}
        />
        <div>인증 확인 중...</div>
      </div>
    );
  }

  // 인증되지 않았거나 권한이 없는 경우 리다이렉트
  if (!isAllowed) {
    if (requiredRole === UserRole.Keeper) {
      // 보관인 권한이 필요한 페이지인 경우, 보관인 등록 페이지로 이동할 수 있도록 상태와 함께 마이페이지로 리다이렉트
      return <Navigate to="/mypage" state={{ showKeeperModal: true }} replace />;
    }

    // 그냥 로그인이 안 된 경우는 로그인 페이지로 리다이렉트
    return <Navigate to="/login" replace />;
  }

  // 인증되고 권한이 있는 경우 자식 라우트 렌더링
  return <Outlet />;
};

export default PrivateRoute;
