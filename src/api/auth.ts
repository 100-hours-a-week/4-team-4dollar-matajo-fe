// src/api/auth.ts
import client from './client';
import { API_PATHS } from '../constants/api';
import { redirect } from 'react-router-dom';

// 로그인 응답 타입 정의
export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    nickname?: string;
    role?: string;
  };
  message?: string;
}

// 카카오 로그인 함수
export const kakaoLogin = async (code: string): Promise<LoginResponse> => {
  try {
    console.log('====== 카카오 로그인 API 요청 시작 ======');
    console.log('코드 길이:', code.length);
    console.log('코드의 처음 20자:', code.substring(0, 20));
    console.log('코드의 마지막 20자:', code.substring(code.length - 20));
    console.log('API 엔드포인트:', `${API_PATHS.AUTH.KAKAO}`);
    // const redirectUri = 'http://localhost:3000/auth/kakao/callback'

    // 요청 데이터에 리다이렉트 URI 추가
    const requestData = {
      code,
    };

    console.log('요청 데이터:', requestData);
    const response = await client.post(`${API_PATHS.AUTH.KAKAO}`, requestData);

    console.log('응답 상태 코드:', response.status);
    console.log('응답 헤더:', response.headers);
    console.log('응답 데이터:', response.data);
    console.log('성공 여부:', response.data.success);
    console.log('====== 카카오 로그인 API 요청 종료 ======');

    return response.data;
  } catch (error: any) {
    console.error('====== 카카오 로그인 오류 ======');
    console.error('오류 메시지:', error.message);

    if (error.response) {
      console.error('서버 응답:', error.response.status);
      console.error('서버 응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('요청은 보냈으나 응답이 없음');
    } else {
      console.error('요청 설정 중 오류 발생:', error.message);
    }

    throw error;
  }
};

// 로그아웃 함수 (필요한 경우 유지)
export const logout = async () => {
  try {
    console.log('로그아웃 시도');
    const response = await client.post(`${API_PATHS.AUTH.LOGOUT}`);
    console.log('로그아웃 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 보관인 등록 함수 (필요한 경우 유지)
export const registerAsKeeper = async (userId: string) => {
  try {
    console.log('보관인 등록 시도:', userId);
    const response = await client.post(`${API_PATHS.AUTH.REGISTER_AS_KEEPER}`, { userId });
    console.log('보관인 등록 응답:', response.data);
    return response;
  } catch (error) {
    console.error('보관인 등록 오류:', error);
    throw error;
  }
};

// 보관인 상태 확인 함수 (필요한 경우 유지)
export const checkKeeperStatus = async (userId: string) => {
  try {
    console.log('보관인 상태 확인 시도:', userId);
    const response = await client.get(`${API_PATHS.AUTH.KEEPER_STATUS}/${userId}`);
    console.log('보관인 상태 확인 응답:', response.data);
    return response;
  } catch (error) {
    console.error('보관인 상태 확인 오류:', error);
    throw error;
  }
};
