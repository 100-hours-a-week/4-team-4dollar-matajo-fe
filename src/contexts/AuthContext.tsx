import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  token?: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerAsKeeper: () => Promise<boolean>;
  isKeeper: () => boolean;
  isClient: () => boolean;
}

// 기본값으로 빈 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false, // 로딩 상태를 false로 변경
  login: async () => {},
  logout: () => {},
  registerAsKeeper: async () => false,
  isKeeper: () => false,
  isClient: () => false,
});

// 인증 컨텍스트 프로바이더 컴포넌트
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 테스트를 위해 기본 인증 상태 설정
  const [user, setUser] = useState<User | null>({
    id: '123456',
    name: '테스트 사용자',
    role: UserRole.Client,
    token: 'dummy-token',
  });

  // 로딩 상태 초기값을 false로 변경
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);

          // 토큰 유효성 검증 (실제로는 API 호출로 처리)
          // const isValid = await validateToken(token);
          const isValid = true; // 임시 코드

          if (isValid) {
            setUser({ ...userData, token });
          } else {
            // 토큰이 유효하지 않으면 로그아웃 처리
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    // 테스트 위해 초기화 함수 주석 처리
    // initAuth();
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // API 호출로 로그인 (임시 코드)
      // const response = await api.login(email, password);
      // const { user: userData, token } = response.data;

      // 임시 데이터
      const userData = {
        id: '123456',
        name: '타조 89389',
        role: UserRole.Client,
      };
      const token = 'dummy-token';

      // 사용자 정보와 토큰 저장
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      setUser({ ...userData, token });
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // 보관인 등록 함수
  const registerAsKeeper = async (): Promise<boolean> => {
    try {
      if (!user) {
        return false;
      }

      // API 호출로 보관인 등록 (임시 코드)
      // const response = await api.registerAsKeeper(user.id);
      // const { success } = response.data;

      const success = true; // 임시 코드

      if (success) {
        const updatedUser = {
          ...user,
          role: UserRole.Keeper,
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
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
    login,
    logout,
    registerAsKeeper,
    isKeeper,
    isClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 인증 컨텍스트 사용 훅
export const useAuth = () => useContext(AuthContext);
