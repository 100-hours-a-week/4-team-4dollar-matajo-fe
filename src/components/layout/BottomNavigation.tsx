import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
// useAuth와 authUtils 임포트 수정
import { useAuth } from '../../hooks/auth';
import { isLoggedIn, checkAndRefreshToken } from '../../utils/api/authUtils';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#280081', // 선택되었을 때
  inactive: '#61646B', // 선택 안 되었을 때
  background: '#FFFFFF',
  gray: '#9E9E9E',
};

// 네비게이션 컨테이너
const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  right: 0;
  width: 100%;
  height: 76px;
  background: ${THEME.background};
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  margin: 0 auto;
  @media (min-width: 480px) {
    width: 480px;
    right: auto;
  }
`;

// 네비게이션 아이템
const NavItem = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => (props.isActive ? THEME.primary : THEME.inactive)};
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: ${props => (props.isActive ? 700 : 500)};
  transition: all 0.2s ease;
`;

// 네비게이션 아이콘 (SVG를 위한 스타일)
const NavIcon = styled.svg<{ isActive: boolean }>`
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  fill: ${props => (props.isActive ? THEME.primary : THEME.inactive)};
  transition: fill 0.2s ease;
`;

// 탭 정의 타입
export type TabType = '홈' | '보관소' | '채팅' | '마이페이지';

// 프롭스 정의
interface BottomNavigationProps {
  activeTab: string;
  onTabChange?: (tab: TabType) => void;
}

// SVG 아이콘 컴포넌트 정의
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <NavIcon isActive={isActive} viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </NavIcon>
);

const StorageIcon = ({ isActive }: { isActive: boolean }) => (
  <NavIcon isActive={isActive} viewBox="0 0 24 24">
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
  </NavIcon>
);

const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <NavIcon isActive={isActive} viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
  </NavIcon>
);

const MyPageIcon = ({ isActive }: { isActive: boolean }) => (
  <NavIcon isActive={isActive} viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </NavIcon>
);

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const isAuthenticated = isLoggedIn();

  // 탭 데이터
  const tabs: Array<{ name: TabType; icon: React.FC<{ isActive: boolean }>; path: string }> = [
    { name: '홈', icon: HomeIcon, path: '/main' },
    { name: '보관소', icon: StorageIcon, path: '/storages' },
    { name: '채팅', icon: ChatIcon, path: '/chat/list' },
    { name: '마이페이지', icon: MyPageIcon, path: '/mypage' },
  ];

  // 탭 클릭 핸들러
  const handleTabClick = async (tab: TabType, path: string) => {
    if (onTabChange) {
      onTabChange(tab);
      return;
    }

    const isTokenValid = await checkAndRefreshToken();
    if (!isTokenValid) {
      console.log('제발 여기여라!!!!!!!!!!!!!!!!!');
      navigate('/login', { replace: true });
      return;
    }

    if (!isAuthenticated && path !== '/main') {
      navigate('/login');
      return;
    }

    navigate(path);
  };

  return (
    <NavContainer>
      {tabs.map(tab => (
        <NavItem
          key={tab.name}
          isActive={activeTab === tab.name}
          onClick={() => handleTabClick(tab.name, tab.path)}
        >
          <tab.icon isActive={activeTab === tab.name} />
          {tab.name}
        </NavItem>
      ))}
    </NavContainer>
  );
};

export default BottomNavigation;
