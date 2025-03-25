import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '../../services/api/modules/auth';

// 사용자 역할 타입 정의
export enum UserRole {
  None = 'none', // 비회원
  Client = 'client', // 의뢰인
  Keeper = 'keeper', // 보관인
}

// 사용자 정보 타입 정의
export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  token?: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  logout: () => void;
  registerAsKeeper: () => Promise<boolean>;
  isKeeper: () => boolean;
  isClient: () => boolean;
}

// 기본값으로 빈 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
  logout: () => {},
  registerAsKeeper: async () => false,
  isKeeper: () => false,
  isClient: () => false,
});

// 인증 컨텍스트 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 기본값을 null로 설정
  const [user, setUser] = useState<User | null>(null);

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const nickname = localStorage.getItem('userNickname');
        const role = localStorage.getItem('userRole');

        if (userId && accessToken) {
          // 기본적인 유저 데이터 설정
          setUser({
            id: userId,
            name: nickname || 'User',
            role: (role as UserRole) || UserRole.Client,
            token: accessToken,
          });
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

    initAuth();
  }, []);

  // 로그아웃 함수
  const logout = () => {
    try {
      // API 호출은 제거하고 로컬 스토리지만 정리
      localStorage.removeItem('userId');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userNickname');
      localStorage.removeItem('userRole');
      setUser(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 보관인 등록 함수
  const registerAsKeeper = async (): Promise<boolean> => {
    try {
      if (!user) {
        return false;
      }

      // 여기서 authApi.registerAsKeeper API 호출 (이 함수는 남겨뒀으므로 그대로 사용 가능)
      const response = await authApi.registerAsKeeper(user.id);

      if (response.data && response.data.success) {
        const updatedUser = {
          ...user,
          role: UserRole.Keeper,
        };

        localStorage.setItem('userRole', UserRole.Keeper);
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('보관인 등록 오류:', error);
      return false;
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
    registerAsKeeper,
    isKeeper,
    isClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
