// src/services/api/client.ts
import axios from 'axios';
import { API_BACKEND_URL } from '../../constants/api';

console.log('API 클라이언트 초기화: API_BACKEND_URL =', API_BACKEND_URL);

const baseURL = API_BACKEND_URL.replace(/\/+$/, '');

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');

    // 더 자세한 토큰 로깅
    console.group('🔐 API 요청 전 토큰 상태');
    console.log('토큰 존재 여부:', !!token);
    console.log('요청 URL:', `${config.baseURL || ''}${config.url || ''}`);
    console.log('요청 메서드:', config.method?.toUpperCase() || 'UNKNOWN');
    if (token) {
      console.log('토큰 일부:', token.substring(0, 10) + '...');
    }
    console.groupEnd();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // URL 정규화
    if (config.url) {
      config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
    }

    return config;
  },
  error => {
    console.error('🚨 API 요청 전 오류:', error);
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    console.group('🚨 API 응답 오류 처리');
    console.log('오류 상태 코드:', error.response?.status);
    console.log('요청 URL:', originalRequest?.url);
    console.log('요청 메서드:', originalRequest?.method);
    console.log('재시도 여부:', !!originalRequest?._retry);
    console.groupEnd();

    // 401 에러 처리 로직
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      // 이미 토큰 갱신 중인 경우
      if (isRefreshing) {
        console.log('🔄 토큰 갱신 중 대기');
        return new Promise(resolve => {
          addSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔐 토큰 재발급 시도', {
          currentPath: window.location.pathname,
          url: originalRequest.url,
          method: originalRequest.method,
        });

        // 토큰 재발급 요청
        const response = await client.post(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          },
        );

        console.log('✅ 토큰 재발급 응답:', {
          status: response.status,
          data: response.data,
        });

        if (response.data.data?.access_token) {
          const newAccessToken = response.data.data.access_token;

          console.log('🔑 새 토큰 발급:', {
            tokenLength: newAccessToken.length,
            tokenStart: newAccessToken.substring(0, 10) + '...',
          });

          localStorage.setItem('accessToken', newAccessToken);

          // 원래 요청의 헤더 업데이트
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 인증 상태 변경 이벤트
          window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));

          // 대기 중인 요청들 실행
          onRefreshed(newAccessToken);
          isRefreshing = false;

          console.log('🔁 원본 요청 재시도');
          return client(originalRequest);
        } else {
          console.warn('❌ 새 토큰 발급 실패: 토큰 데이터 없음');
          throw new Error('No access token in response');
        }
      } catch (refreshError) {
        console.error('🚫 토큰 재발급 완전 실패:', refreshError);

        // 명시적 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // 인증 상태 변경 이벤트
        window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));

        isRefreshing = false;

        // 현재 경로 확인
        const currentPath = window.location.pathname;

        console.log('🔒 로그인 페이지 리다이렉트 고려:', {
          currentPath,
          isLoginPage: currentPath === '/login',
        });

        // 이미 로그인 페이지에 있다면 리다이렉트하지 않음
        if (currentPath !== '/login') {
          // 현재 경로를 로컬 스토리지에 저장
          localStorage.setItem('redirectAfterLogin', currentPath);

          // 약간의 지연 후 리다이렉션
          setTimeout(() => {
            console.log('🚪 로그인 페이지로 리다이렉트');
            window.location.href = '/login';
          }, 100);
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
