// src/pages/Home/MainRedirect.tsx (Updated)
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../../utils/api/authUtils';
import { ROUTES } from '../../constants/routes';

/**
 * 메인 리다이렉트 컴포넌트
 * 인증 상태에 따라 메인 페이지 또는 로그인 페이지로 리다이렉트
 */
const MainRedirect: React.FC = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('MainRedirect 컴포넌트 렌더링, 현재 경로:', location.pathname);

    // 토큰을 확인하여 인증 상태 저장
    const checkAuthStatus = () => {
      try {
        const authStatus = isLoggedIn();
        console.log('인증 상태 확인:', authStatus ? '로그인됨' : '로그인되지 않음');
        setIsAuthenticated(authStatus);
      } catch (error) {
        console.error('인증 상태 확인 오류:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // AUTH_STATE_CHANGED 이벤트 리스너 등록
    const handleAuthChange = () => {
      console.log('인증 상태 변경 감지');
      checkAuthStatus();
    };

    window.addEventListener('AUTH_STATE_CHANGED', handleAuthChange);

    return () => {
      window.removeEventListener('AUTH_STATE_CHANGED', handleAuthChange);
    };
  }, [location.pathname]);

  if (isLoading) {
    // 로딩 상태 표시
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-5">
        <img src="/tajo-logo.png" alt="Logo" className="w-24 h-24" />
        <div>인증 상태 확인 중...</div>
      </div>
    );
  }

  // 현재 경로가 /mypage/mytrade 또는 /storage/mytrade인 경우 리다이렉트하지 않음
  if (
    location.pathname === `/${ROUTES.MYPAGE}/${ROUTES.MYTRADE}` ||
    location.pathname === `/${ROUTES.MYTRADE}`
  ) {
    return null;
  }

  // 인증 상태에 따라 리다이렉트
  if (isAuthenticated) {
    // 현재 경로가 /인 경우에만 /main으로 리다이렉트
    if (location.pathname === '/') {
      console.log('인증됨: 메인 페이지로 리다이렉트');
      return <Navigate to="/main" replace />;
    }
    // 그 외의 경우 현재 경로 유지
    return null;
  } else {
    console.log('인증되지 않음: 로그인 페이지로 리다이렉트');
    return <Navigate to="/login" replace />;
  }
};

export default MainRedirect;
