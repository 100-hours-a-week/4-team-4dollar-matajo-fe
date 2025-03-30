// src/services/api/client.ts
import axios from 'axios';
import { getToken, logout } from '../../utils/api/authUtils';
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

// 인터셉터 설정 - 요청에 JWT 토큰 포함
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
    console.error('API 요청 인터셉터 오류:', error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터 - 오류 처리
client.interceptors.response.use(
  response => {
    console.log(`API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    // 상세한 오류 로깅
    if (error.response) {
      console.error(`API 오류: ${error.response.status} ${error.config?.url}`, error.response.data);

      // 401 Unauthorized 오류 처리 (토큰 만료 등)
      if (error.response.status === 401) {
        console.warn('인증 오류 발생: 로그아웃 처리');
        logout();
      }
    } else if (error.request) {
      console.error('API 응답 없음:', error.request);
    } else {
      console.error('API 요청 설정 오류:', error.message);
    }

    return Promise.reject(error);
  },
);

// client를 기본 내보내기로 설정
export default client;
