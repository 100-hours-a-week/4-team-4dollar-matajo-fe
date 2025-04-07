// src/services/api/client.ts
import axios from 'axios';
import { API_BACKEND_URL } from '../../constants/api';
import { checkAndRefreshToken } from '../../utils/api/authUtils';

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

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;

      try {
        // checkAndRefreshToken 함수 사용
        const isTokenValid = await checkAndRefreshToken();

        if (isTokenValid) {
          // 새 토큰으로 원래 요청 재시도
          return client(originalRequest);
        } else {
          // 토큰 재발급 실패 시 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('토큰 재발급 실패:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
