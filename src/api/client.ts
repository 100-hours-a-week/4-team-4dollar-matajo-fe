// <<<<<<< feat/teddy_0324 
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://15.164.251.118:8080';

const client = axios.create({
  baseURL: API_BASE_URL,
// =======
// import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
// import { API_BACKEND_URL } from '../constants/api';

// // 기본 axios 인스턴스 생성
// export const client = axios.create({
//   baseURL: API_BACKEND_URL,
// >>>>>>> main
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // 쿠키, 인증 헤더 등 자격 증명 정보 포함
});

// 인터셉터 설정 - 요청에 JWT 토큰 포함
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    return Promise.reject(error);
  },
);

export default client;
