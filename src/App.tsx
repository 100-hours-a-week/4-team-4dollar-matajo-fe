import React, { useEffect, useState } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import Toast from './components/common/Toast';
import { ROUTES } from './constants/routes';
import routes from './routes';
import FcmService from './services/FcmService';
import styled from 'styled-components';

// 알림 가치 설명 배너 스타일
const NotificationBanner = styled.div`
  position: fixed;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  z-index: 1000;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      transform: translate(-50%, -100%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`;

const BannerIcon = styled.div`
  font-size: 24px;
  margin-right: 12px;
`;

const BannerContent = styled.div`
  flex: 1;
`;

const BannerTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
`;

const BannerText = styled.div`
  font-size: 12px;
  color: #666;
`;

const BannerButton = styled.button`
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  margin-left: 12px;
`;

const BannerCloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 0px;
  position: absolute;
  right: 8px;
  top: 0px;
`;

const App: React.FC = () => {
  const location = useLocation();
  const element = useRoutes(routes);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [isMainPage, setIsMainPage] = useState(false);

  // 현재 페이지가 메인 페이지인지 확인
  useEffect(() => {
    setIsMainPage(location.pathname === '/' || location.pathname === '/main');
  }, [location.pathname]);

  // 알림 권한 상태 확인 및 배너 표시 여부 결정
  useEffect(() => {
    // 메인 페이지이고 알림 권한이 아직 결정되지 않은 경우에만 배너 표시
    if (isMainPage && 'Notification' in window && Notification.permission === 'default') {
      // 페이지 로드 후 1초 지연 후 배너 표시 (사용자가 페이지를 먼저 볼 수 있도록)
      const timer = setTimeout(() => {
        // 로컬 스토리지 확인하여 이미 배너를 닫았던 사용자에게는 표시하지 않음
        const hasClosedBanner = localStorage.getItem('notificationBannerClosed');
        if (!hasClosedBanner) {
          setShowNotificationBanner(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowNotificationBanner(false);
    }
  }, [isMainPage]);

  // 알림 권한 요청 처리
  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window)) {
        console.log('이 브라우저는 알림을 지원하지 않습니다.');
        return;
      }

      // 배너 숨김
      setShowNotificationBanner(false);

      // 약간의 지연 후 권한 요청 (UI가 정리되도록)
      setTimeout(async () => {
        console.log('알림 권한 요청 시작...');
        const permission = await Notification.requestPermission();
        console.log('알림 권한 상태:', permission);

        if (permission === 'granted') {
          console.log('알림 권한이 허용되었습니다.');

          // FCM 설정
          const fcmService = FcmService.getInstance();
          await fcmService.getAndRegisterToken();
          fcmService.setupTokenRefresh();

          // 사용자에게 성공 메시지 표시
          setToastMessage('알림 설정이 완료되었습니다.');
          setTimeout(() => setToastMessage(null), 3000);
        }
      }, 100);
    } catch (error) {
      console.error('권한 요청 중 오류 발생:', error);
    }
  };

  // 배너 닫기 버튼 처리
  const handleCloseBanner = () => {
    setShowNotificationBanner(false);
    // 배너를 다시 표시하지 않도록 로컬 스토리지에 기록
    localStorage.setItem('notificationBannerClosed', 'true');
  };

  // FCM 초기화
  useEffect(() => {
    const setupFCM = async () => {
      try {
        const fcmService = FcmService.getInstance();

        // 이미 알림 권한이 있는 경우에만 FCM 초기화
        if ('Notification' in window && Notification.permission === 'granted') {
          await fcmService.getAndRegisterToken();
          fcmService.setupTokenRefresh();
        }

        // FCM 메시지 리스너 설정
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
      {element}

      {/* 알림 권한 요청 배너 - 메인 페이지에서만 표시 */}
      {showNotificationBanner && (
        <NotificationBanner>
          <BannerIcon>🔔</BannerIcon>
          <BannerContent>
            <BannerTitle>채팅 알림 받기</BannerTitle>
            <BannerText>채팅 알림을 실시간으로 받아보세요!</BannerText>
          </BannerContent>
          <BannerButton onClick={requestNotificationPermission}>허용하기</BannerButton>
          <BannerCloseButton onClick={handleCloseBanner}>×</BannerCloseButton>
        </NotificationBanner>
      )}

      {toastMessage && <Toast message={toastMessage} visible={true} />}
    </>
  );
};

export default App;
