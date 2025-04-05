// src/services/api/client.ts
import axios from 'axios';
import { API_BACKEND_URL } from '../../constants/api';

// 디버그용 로그
console.log('API 클라이언트 초기화: API_BACKEND_URL =', API_BACKEND_URL);

// baseURL에서 중복 슬래시 제거
const baseURL = API_BACKEND_URL.replace(/\/+$/, '');

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30초
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

// 요청 인터셉터 설정
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log('API 요청에 토큰 추가:', token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('API 요청에 토큰 없음');
    }

    // URL 정규화만 유지
    if (config.url) {
      config.url = config.url.replace(/([^:]\/)\/+/g, '$1');
    }

    // 요청 디버깅을 위한 로그
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    return config;
  },
  error => {
    console.error('API 요청 전 오류 발생:', error);
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log('🔐 토큰 재발급 시도', {
          url: originalRequest.url,
          method: originalRequest.method,
        });

        const response = await client.post(
          '/auth/refresh',
          {},
          {
            withCredentials: true,
          },
        );

        console.log('✅ 토큰 재발급 응답:', response.data);

        if (response.data.data?.access_token) {
          const newAccessToken = response.data.data.access_token;

          localStorage.setItem('accessToken', newAccessToken);

          // 원래 요청의 헤더 업데이트
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // 인증 상태 변경 이벤트
          window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));

          console.log('🔁 원본 요청 재시도');
          return client(originalRequest);
        }
      } catch (refreshError) {
        console.error('🚫 토큰 재발급 실패:', refreshError);

        // 명시적 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // 인증 상태 변경 이벤트
        window.dispatchEvent(new CustomEvent('AUTH_STATE_CHANGED'));

        // 로그인 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
