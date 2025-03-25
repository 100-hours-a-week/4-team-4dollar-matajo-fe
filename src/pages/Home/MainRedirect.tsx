import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 메인 페이지로 리다이렉트하는 컴포넌트
 * 로그인 처리 후 리다이렉트 문제를 해결하기 위해 사용
 */
const MainRedirect: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('MainRedirect 컴포넌트 렌더링, 현재 경로:', location.pathname);
  }, [location]);

  // 이전 페이지의 상태 정보를 유지하며 /main으로 리다이렉트
  return <Navigate to="/main" replace state={location.state} />;
};

export default MainRedirect;
