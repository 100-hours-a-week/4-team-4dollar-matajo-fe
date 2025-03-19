import { UserRole } from '../contexts/AuthContext';
import { client } from './client';

// 회원가입 함수
export const register = async (userData: { email: string; password: string; name: string }) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.post('/auth/register', userData);

    // 테스트를 위한 더미 응답
    return {
      data: {
        success: true,
        user: {
          id: Math.random().toString(36).substring(2, 10),
          name: userData.name,
          email: userData.email,
          role: UserRole.Client, // 기본적으로 의뢰인으로 등록
        },
        token: 'dummy-token-' + Date.now(),
      },
    };
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
};

// 로그인 함수
export const login = async (email: string, password: string) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.post('/auth/login', { email, password });

    // 테스트를 위한 더미 응답
    return {
      data: {
        success: true,
        user: {
          id: '123456',
          name: '타조 89389',
          email: email,
          role: UserRole.Client,
        },
        token: 'dummy-token-' + Date.now(),
      },
    };
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// 토큰 유효성 검증 함수
export const validateToken = async (token: string) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.post('/auth/validate', { token });

    // 테스트를 위한 더미 응답
    return {
      data: {
        valid: true,
      },
    };
  } catch (error) {
    console.error('토큰 검증 오류:', error);
    return { data: { valid: false } };
  }
};

// 보관인 등록 함수
export const registerAsKeeper = async (userId: string) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.post('/auth/register-keeper', { userId });

    // 테스트를 위한 더미 응답
    return {
      data: {
        success: true,
        user: {
          id: userId,
          role: UserRole.Keeper,
        },
      },
    };
  } catch (error) {
    console.error('보관인 등록 오류:', error);
    throw error;
  }
};

// 보관인 상태 확인 함수
export const checkKeeperStatus = async (userId: string) => {
  try {
    // 실제 API 호출 (현재는 주석 처리)
    // return await client.get(`/auth/keeper-status/${userId}`);

    // 테스트를 위한 더미 응답
    return {
      data: {
        isKeeper: false,
        pendingRegistration: false,
      },
    };
  } catch (error) {
    console.error('보관인 상태 확인 오류:', error);
    throw error;
  }
};
