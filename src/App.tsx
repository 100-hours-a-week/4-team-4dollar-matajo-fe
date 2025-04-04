import React, { useEffect, useState } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import Toast from './components/common/Toast';
import { ROUTES } from './constants/routes';
import routes from './routes';
import FcmService from './services/FcmService';

const App: React.FC = () => {
  const location = useLocation();
  const element = useRoutes(routes);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const setupFCM = async () => {
      try {
        const fcmService = FcmService.getInstance();
        await fcmService.getAndRegisterToken(); // 앱 시작 시 무조건 확인 및 등록
        fcmService.setupTokenRefresh(); // 토큰 주기적 확인

        // 포그라운드 메시지 처리
        fcmService.onMessage(payload => {
          const { title, body } = payload.notification || {};
          if (title && body) {
            setToastMessage(`${title}: ${body}`);
            new Audio('/notification.mp3').play().catch(console.warn);
            setTimeout(() => setToastMessage(null), 3000);
          }
        });
      } catch (err) {
        console.error('🚨 FCM 초기화 실패:', err);
      }
    };

    setupFCM();
  }, []);

  useEffect(() => {
    const state = location.state as { showToast?: boolean; message?: string } | null;
    if (state?.showToast && state?.message) {
      setToastMessage(state.message);
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    if (location.pathname === ROUTES.LOGIN) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userNickname');
      localStorage.removeItem('userRole');
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      console.log('🧹 로그인 진입 시 정리 완료');
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
