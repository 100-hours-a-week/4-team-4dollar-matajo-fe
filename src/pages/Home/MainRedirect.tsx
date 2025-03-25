// src/pages/Home/MainRedirect.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../../utils/api/authUtils'; // 절대 경로로 수정

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

    // 인증 상태 확인
    const authStatus = isLoggedIn();
    setIsAuthenticated(authStatus);
    setIsLoading(false);

    console.log('인증 상태:', authStatus ? '로그인됨' : '로그인되지 않음');
  }, [location]);

  if (isLoading) {
    // 로딩 상태 표시
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <img src="/tajo-logo.png" alt="Logo" style={{ width: '100px', height: '100px' }} />
        <div>로딩 중...</div>
      </div>
    );
  }

  // 인증 상태에 따라 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/main" replace state={location.state} />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default MainRedirect;
