import React, { useState, useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom'; // BrowserRouter 제거
import { ThemeProvider } from 'styled-components';
import routes from './routes';
import theme from './styles/theme';
import Toast from './components/common/Toast';
import './App.css';

// 토스트 메시지 관리 컴포넌트
const ToastManager = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  const location = useLocation();
  const element = useRoutes(routes);

  // 라우트 변경 시 토스트 메시지 확인
  useEffect(() => {
    // location.state에서 토스트 메시지 확인
    if (location.state?.showToast) {
      setToast({
        visible: true,
        message: location.state.message || '작업이 완료되었습니다',
        type: location.state.type || 'success',
      });

      // 상태 초기화 (이중 표시 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
      {element}
      <Toast
        message={toast.message}
        visible={toast.visible}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <ToastManager />
    </ThemeProvider>
  );
};

export default App;
