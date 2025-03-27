import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import MainLayout from './layouts/MainLayout';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mypage/*" element={<MyPage />} />
      <Route path="/main/*" element={<MainLayout />}>
        {/* 다른 중첩된 라우트들 */}
      </Route>
    </Routes>
  );
};

export default App;
