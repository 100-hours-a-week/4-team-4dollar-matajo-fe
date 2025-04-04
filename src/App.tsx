import React, { useState, useEffect } from 'react';
import { Routes, useLocation, useRoutes } from 'react-router-dom';
import Toast from './components/common/Toast';
import { ROUTES } from './constants/routes';
import routes from './routes';
import { messaging } from './firebase'; // 🔥 Firebase 가져오기
import { getToken } from 'firebase/messaging';

const App: React.FC = () => {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const element = useRoutes(routes);

  useEffect(() => {
    getToken(messaging)
      .then(token => {
        if (token) {
          console.log('🔥 현재 FCM 토큰:', token);
        } else {
          console.warn('FCM 토큰이 없습니다.');
        }
      })
      .catch(err => console.error('FCM 토큰 가져오기 실패:', err));
  }, []);

  useEffect(() => {
    // Firebase 설정 서비스 워커에 주입
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'FIREBASE_CONFIG',
          config: {
            apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.REACT_APP_FIREBASE_APP_ID,
            measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
          },
        });
      });
    }
  }, []);

  // 라우트 변경 시 토스트 메시지 확인
  useEffect(() => {
    // location.state에서 showToast, message 추출
    const state = location.state as { showToast?: boolean; message?: string } | null;

    if (state?.showToast && state?.message) {
      setToastMessage(state.message);

      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  // 로그인 페이지 접근 시 로컬 스토리지와 쿠키 정리
  useEffect(() => {
    if (location.pathname === ROUTES.LOGIN) {
      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userNickname');
      localStorage.removeItem('userRole');

      // 쿠키 정리 (모든 쿠키 삭제)
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      console.log('로그인 페이지 진입: 로컬 스토리지 및 쿠키 정리 완료');
    }
  }, [location.pathname]);

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage}
          visible={!!toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
      {element}
    </>
  );
};

export default App;
