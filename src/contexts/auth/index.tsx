// src/contexts/auth/index.tsx (Updated)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { decodeJWT } from '../../utils/formatting/decodeJWT';

// 사용자 역할 타입 정의
export enum UserRole {
  None = 'NONE',
  Client = 'CLIENT',
  Keeper = 'KEEPER',
}

// 사용자 정보 타입 정의
export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  logout: () => void;
  isKeeper: () => boolean;
  isClient: () => boolean;
}

// 기본값으로 빈 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
  logout: () => {},
  isKeeper: () => false,
  isClient: () => false,
});

// 인증 컨텍스트 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 인증 상태를 초기화하는 함수
  const initAuth = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        // JWT 토큰에서 정보 추출
        const decoded = decodeJWT(accessToken);
        if (decoded) {
          setUser({
            id: decoded.userId.toString(),
            name: decoded.nickname || 'User',
            role: (decoded.role as UserRole) || UserRole.Client,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('인증 초기화 오류:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시와 AUTH_STATE_CHANGED 이벤트 발생 시 인증 상태 초기화
  useEffect(() => {
    initAuth();

    // AUTH_STATE_CHANGED 이벤트 리스너 등록
    const handleAuthChange = () => {
      initAuth();
    };

    window.addEventListener('AUTH_STATE_CHANGED', handleAuthChange);

    return () => {
      window.removeEventListener('AUTH_STATE_CHANGED', handleAuthChange);
    };
  }, []);

  // 로그아웃 함수
  const logout = () => {
    try {
      // accessToken만 제거
      localStorage.removeItem('accessToken');
      setUser(null);

      // 인증 상태 변경 알림
      window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 보관인 체크 함수
  const isKeeper = () => {
    return user?.role === UserRole.Keeper;
  };

  // 의뢰인 체크 함수
  const isClient = () => {
    return user?.role === UserRole.Client;
  };

  // 컨텍스트 값
  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    logout,
    isKeeper,
    isClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
