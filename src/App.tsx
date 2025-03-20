// App.tsx를 다음과 같이 수정하세요
import React from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import routes from './routes';
import theme from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  // useRoutes 훅을 사용하여 라우트 설정
  const routing = useRoutes(routes);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>{routing}</ThemeProvider>
    </AuthProvider>
  );
};

export default App;
