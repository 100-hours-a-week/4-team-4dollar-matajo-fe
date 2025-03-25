import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Toast from './components/common/Toast';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import LoginPage from './pages/Login';
import KakaoCallback from './pages/Login/KakaoCallback';
import MyPage from './pages/MyPage/MyPage';
import ChatroomList from './pages/Chat/ChatroomList';
import StorageList from './pages/StorageList/StorageList';
import MainRedirect from './pages/MainRedirect';
import { ROUTES } from './constants/routes';

const App: React.FC = () => {
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 라우트 변경 시 토스트 메시지 확인
  useEffect(() => {
    // location.state에서 showToast, message 추출
    const state = location.state as { showToast?: boolean; message?: string } | null;

    if (state?.showToast && state?.message) {
      setToastMessage(state.message);

      // 3초 후 토스트 메시지 숨기기
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
      {/* 토스트 메시지 */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          visible={!!toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* 라우트 정의 */}
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<MainRedirect />} />
          <Route path="/main" element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.KAKAO_CALLBACK} element={<KakaoCallback />} />
          <Route path={ROUTES.CHAT_LIST} element={<ChatroomList />} />
          <Route path={ROUTES.MYPAGE} element={<MyPage />} />
          <Route path={ROUTES.STORAGE} element={<StorageList />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
