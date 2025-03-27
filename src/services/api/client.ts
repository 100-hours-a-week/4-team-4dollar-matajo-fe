// src/services/api/client.ts
import axios from 'axios';
import { API_BACKEND_URL } from '../../constants/api';

// 공통 설정의 Axios 인스턴스 생성
const client = axios.create({
  baseURL: API_BACKEND_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정
client.interceptors.request.use(
  config => {
    // 로컬 스토리지에서 액세스 토큰 가져오기
    const accessToken = localStorage.getItem('accessToken');

    // 토큰이 있으면 Authorization 헤더에 추가
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => {
    console.error('API 요청 전 오류 발생:', error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터 설정
client.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // 에러 응답이 있는 경우
    const originalRequest = error.config;

    // 401 Unauthorized 에러이고 재시도하지 않은 경우
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 리프레시 토큰 가져오기
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          // 리프레시 토큰이 없으면 로그아웃 처리
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return Promise.reject(error);
        }

        // 토큰 리프레시 요청
        const response = await axios.post(`${API_BACKEND_URL}/auth/refresh`, {
          refreshToken,
        });

        if (response.data.accessToken) {
          // 새 액세스 토큰 저장
          localStorage.setItem('accessToken', response.data.accessToken);

          // 새 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        // 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  },
);

export default client;
