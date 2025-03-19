import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5', // 선택되었을 때
  inactive: '#61646B', // 선택 안 되었을 때
  background: '#FFFFFF',
  gray: '#9E9E9E',
};

// 네비게이션 컨테이너
const NavContainer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 375px;
  height: 76px;
  background: ${THEME.background};
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
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
    <path d="M12 2L2 9v12h8v-6h4v6h8V9L12 2zm0 2.83l6 5V19h-4v-6H10v6H6V9.83l6-5z" />
  </NavIcon>
);

const StorageIcon = ({ isActive }: { isActive: boolean }) => (
  <NavIcon isActive={isActive} viewBox="0 0 24 24">
    <path d="M20 2H4a2 2 0 00-2 2v16a2 2 0 002 2h16a2 2 0 002-2V4a2 2 0 00-2-2zM4 4h16v4H4V4zm0 6h16v10H4V10z" />
  </NavIcon>
);

const ChatIcon = ({ isActive }: { isActive: boolean }) => (
  <NavIcon isActive={isActive} viewBox="0 0 24 24">
    <path d="M20 2H4a2 2 0 00-2 2v14l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm0 12H6l-2 2V4h16v10z" />
  </NavIcon>
);

const MyPageIcon = ({ isActive }: { isActive: boolean }) => (
  <NavIcon isActive={isActive} viewBox="0 0 24 24">
    <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5z" />
  </NavIcon>
);

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // 탭 데이터
  const tabs: Array<{ name: TabType; icon: React.FC<{ isActive: boolean }>; path: string }> = [
    { name: '홈', icon: HomeIcon, path: '/' },
    { name: '보관소', icon: StorageIcon, path: '/storage' },
    { name: '채팅', icon: ChatIcon, path: '/chat/list' },
    { name: '마이페이지', icon: MyPageIcon, path: '/mypage' },
  ];

  // 탭 클릭 핸들러
  const handleTabClick = (tab: TabType, path: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      if (!isAuthenticated && path !== '/') {
        navigate('/login');
        return;
      }
      navigate(path);
    }
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
