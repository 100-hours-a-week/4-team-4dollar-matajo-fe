import React from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import routes from './routes';
import theme from './styles/theme';

const App: React.FC = () => {
  // useRoutes 훅을 사용하여 라우트 설정
  const routing = useRoutes(routes);

  return <ThemeProvider theme={theme}>{routing}</ThemeProvider>;
};

export default App;
