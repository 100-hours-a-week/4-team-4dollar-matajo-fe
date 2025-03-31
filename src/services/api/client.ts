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
  withCredentials: false,
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

    // CORS 관련 헤더 제거 (서버에서 처리하도록)
    // config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
    // config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    // config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

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
