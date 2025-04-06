// src/routes/PrivateRoute.tsx (Fixed for refresh issue)
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRoleInToken } from '../utils/api/authUtils';
import { useAuth, UserRole } from '../contexts/auth';
import client from '../services/api/client';
import { decodeJWT } from '../utils/formatting/decodeJWT';
import axios from 'axios';
import { API_BACKEND_URL } from '../constants/api';

// 갱신 진행 중인 Promise를 저장할 변수
let refreshPromise: Promise<boolean> | null = null;

interface PrivateRouteProps {
  requiredRole?: UserRole;
}

// API_BACKEND_URL에서 마지막 슬래시를 제거
const baseURL = API_BACKEND_URL.replace(/\/+$/, '');

/**
 * 인증된 사용자만 접근할 수 있는 Private Route 컴포넌트
 * requiredRole이 지정되면 해당 역할을 가진 사용자만 접근할 수 있음
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const location = useLocation();
  const { user, loading: userLoading } = useAuth();

  const [authState, setAuthState] = useState<{
    isChecking: boolean;
    isAllowed: boolean;
    refreshing: boolean;
  }>({
    isChecking: true,
    isAllowed: false,
    refreshing: false,
  });

  // 토큰 갱신 함수
  const refreshToken = async (): Promise<boolean> => {
    // 이미 진행 중인 갱신 요청이 있으면 그 결과를 재사용
    if (refreshPromise) {
      console.log('이미 진행 중인 토큰 갱신 요청이 있음, 기존 요청의 결과를 기다림');
      return refreshPromise;
    }

    setAuthState(prev => ({ ...prev, refreshing: true }));
    console.log('토큰 갱신 시도 중...');

    // 새로운 요청 생성 및 저장
    refreshPromise = (async () => {
      try {
        // 토큰 재발급 요청 - client 인스턴스 사용
        const response = await client.post(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          },
        );

        // 백엔드 응답 구조 확인 (data.data.accessToken 또는 data.accessToken)
        let newToken = null;
        if (response.data.data && response.data.data.accessToken) {
          newToken = response.data.data.accessToken;
        } else if (response.data.accessToken) {
          newToken = response.data.accessToken;
        }

        if (newToken) {
          console.log('토큰 갱신 성공');
          localStorage.setItem('accessToken', newToken);

          // 이벤트 발생시켜 AuthProvider에게 알림
          window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));
          return true;
        } else {
          console.log('토큰 갱신 응답에 토큰이 없음');
          localStorage.removeItem('accessToken');
          return false;
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        localStorage.removeItem('accessToken');
        return false;
      } finally {
        // 약간의 지연 후 refreshPromise 초기화
        setTimeout(() => {
          refreshPromise = null;
        }, 100);
      }
    })();

    // 요청 결과를 기다린 후 refreshing 상태 해제
    const result = await refreshPromise;
    setAuthState(prev => ({ ...prev, refreshing: false }));
    return result;
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('인증 상태 체크 시작');
        setAuthState(prev => ({ ...prev, isChecking: true }));

        const token = localStorage.getItem('accessToken');
        console.log('현재 토큰:', token ? '존재' : '없음');

        if (!token) {
          console.log('토큰 없음, 로그인 필요');
          setAuthState({ isChecking: false, isAllowed: false, refreshing: false });
          return;
        }

        const decoded = decodeJWT(token);
        const now = Math.floor(Date.now() / 1000);

        if (decoded) {
          const timeLeft = decoded.exp - now;
          console.log('토큰 만료까지 남은 시간:', timeLeft, '초');

          if (timeLeft < 30) {
            console.log('토큰 만료 임박, 갱신 시도');
            try {
              // 토큰 갱신 API 직접 호출
              const response = await axios.post(
                `${API_BACKEND_URL}/auth/refresh`,
                {},
                {
                  withCredentials: true,
                },
              );

              if (response.data.data?.accessToken) {
                console.log('토큰 갱신 성공');
                localStorage.setItem('accessToken', response.data.data.accessToken);
                setAuthState({ isChecking: false, isAllowed: true, refreshing: false });
                return;
              }
            } catch (error) {
              console.error('토큰 갱신 실패:', error);
            }
          } else {
            console.log('토큰 유효, 접근 허용');
            setAuthState({ isChecking: false, isAllowed: true, refreshing: false });
            return;
          }
        }

        console.log('유효한 토큰 없음, 로그인 필요');
        setAuthState({ isChecking: false, isAllowed: false, refreshing: false });
      } catch (error) {
        console.error('인증 확인 중 오류 발생:', error);
        setAuthState({ isChecking: false, isAllowed: false, refreshing: false });
      }
    };

    checkAuth();
  }, [requiredRole, location.pathname]);

  // 로딩 중이거나 토큰 갱신 중에는 화면 렌더링하지 않음
  if (authState.isChecking || userLoading || authState.refreshing) {
    return (
      <div className="flex justify-center items-center h-screen flex-col">
        <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
        <div>인증 확인 중...</div>
      </div>
    );
  }

  // 접근 권한 확인
  if (!authState.isAllowed) {
    // 토큰이 있지만 만료된 경우, 갱신 시도 후 결과를 기다림
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        // 토큰이 있으면 갱신 시도를 기다리고 리다이렉트하지 않음
        return (
          <div className="flex justify-center items-center h-screen flex-col">
            <img src="/tajo-logo.png" alt="Logo" className="w-20 h-20 mb-5" />
            <div>인증 확인 중...</div>
          </div>
        );
      }
    }

    // 토큰이 아예 없는 경우에만 로그인 페이지로 리다이렉트
    console.log('로그인 페이지로 리다이렉트');
    sessionStorage.setItem('returnPath', location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 인증 및 권한 확인 후 접근 허용
  console.log('페이지 접근 허용');
  return <Outlet />;
};

export default PrivateRoute;
