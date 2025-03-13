import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  // 현재 경로에 있는 링크에 활성 스타일 적용
  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-primary-600 font-medium'
      : 'text-gray-700 hover:text-primary-600';
  };

  return (
    <nav className="flex items-center space-x-6">
      <Link to="/" className={isActive('/')}>
        홈
      </Link>
      <Link to="/login" className={isActive('/login')}>
        로그인
      </Link>
      {/* 추가 메뉴 항목들 */}
    </nav>
  );
};

export default Navbar;
