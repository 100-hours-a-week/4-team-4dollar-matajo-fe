import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

const App: React.FC = () => {
  // useRoutes 훅을 사용하여 라우트 설정
  const routing = useRoutes(routes);

  return <>{routing}</>;
};

export default App;
