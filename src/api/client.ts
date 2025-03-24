// src/api/client.ts
import axios from 'axios';
import { getToken, logout } from '../utils/authUtils';
import { API_BASE_URL } from '../constants/api';

// API_BASE_URL은 이제 constants/api.ts에서 가져옴

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키, 인증 헤더 등 자격 증명 정보 포함
});

// 인터셉터 설정 - 요청에 JWT 토큰 포함
client.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// 응답 인터셉터 - 오류 처리
client.interceptors.response.use(
  response => response,
  error => {
    // 401 Unauthorized 오류 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // 로컬 스토리지에서 토큰 제거
      logout();
    }
    return Promise.reject(error);
  },
);

export default client;
