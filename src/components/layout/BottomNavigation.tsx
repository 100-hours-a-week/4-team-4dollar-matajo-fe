import React from 'react';
import styled from 'styled-components';

// 테마 상수 - 실제로는 공통 테마 파일에서 import
const THEME = {
  primary: '#3835FD',
  background: '#F5F5FF',
};

// 스타일 정의
const FixedNavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: ${THEME.background};
`;

const NavContainer = styled.div`
  width: 375px;
  height: 76px;
  padding: 16px 16px 34px 16px;
  background: ${THEME.background};
  overflow: hidden;
  border-top: 1px #efeff0 solid;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 32px;
`;

const NavItem = styled.div<{ isActive?: boolean }>`
  width: 60px;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const NavIcon = styled.div`
  width: 28px;
  height: 28px;
  position: relative;
`;

const NavText = styled.div<{ isActive?: boolean }>`
  text-align: center;
  color: ${props => (props.isActive ? THEME.primary : '#61646B')};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  line-height: 16px;
  letter-spacing: 0.6px;
  word-wrap: break-word;
  padding: 2px 8px 4px 8px;
`;

// 네비게이션 아이템 타입
type NavItemType = '홈' | '보관소' | '채팅' | '마이페이지';

// Props 타입 정의
interface BottomNavigationProps {
  activeTab: NavItemType;
  onTabChange?: (tab: NavItemType) => void;
}

// 하단 네비게이션 컴포넌트
const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  // 탭 클릭 핸들러
  const handleTabClick = (tab: NavItemType) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // 각 아이콘의 렌더링 - 실제로는 SVG나 아이콘 컴포넌트를 사용하는 것이 좋음
  const renderHomeIcon = () => (
    <div style={{ width: 28, height: 28, left: 0, top: 0, position: 'absolute' }}>
      <div
        style={{
          width: 23.92,
          height: 25.09,
          left: 2.33,
          top: 1.17,
          position: 'absolute',
          background: 'black',
        }}
      />
    </div>
  );

  const renderBoardIcon = () => (
    <div style={{ width: 28, height: 28, left: 0, top: 0, position: 'absolute' }}>
      <div
        style={{
          width: 22.72,
          height: 22.72,
          left: 2.33,
          top: 2.33,
          position: 'absolute',
          background: 'black',
        }}
      />
      <div
        style={{
          width: 5.86,
          height: 5.85,
          left: 20.11,
          top: 20.66,
          position: 'absolute',
          background: '#61646B',
        }}
      />
    </div>
  );

  const renderChatIcon = () => (
    <div style={{ width: 28, height: 28, left: 0, top: 0, position: 'absolute' }}>
      <div
        style={{
          width: 21.58,
          height: 20.24,
          left: 3.5,
          top: 1.17,
          position: 'absolute',
          background: 'black',
        }}
      />
      <div
        style={{
          width: 7.43,
          height: 3.08,
          left: 10.52,
          top: 23.17,
          position: 'absolute',
          background: '#61646B',
        }}
      />
    </div>
  );

  const renderProfileIcon = () => (
    <div style={{ width: 28, height: 28, left: 0, top: 0, position: 'absolute' }}>
      <div
        style={{
          width: 18.48,
          height: 8.6,
          left: 4.67,
          top: 16.91,
          position: 'absolute',
          background: 'black',
        }}
      />
      <div
        style={{
          width: 12.39,
          height: 12.39,
          left: 7.71,
          top: 2.33,
          position: 'absolute',
          background: 'black',
        }}
      />
    </div>
  );

  return (
    <FixedNavContainer>
      <NavContainer>
        <NavItem isActive={activeTab === '홈'} onClick={() => handleTabClick('홈')}>
          <NavIcon>{renderHomeIcon()}</NavIcon>
          <NavText isActive={activeTab === '홈'}>홈</NavText>
        </NavItem>

        <NavItem isActive={activeTab === '보관소'} onClick={() => handleTabClick('보관소')}>
          <NavIcon>{renderBoardIcon()}</NavIcon>
          <NavText isActive={activeTab === '보관소'}>보관소</NavText>
        </NavItem>

        <NavItem isActive={activeTab === '채팅'} onClick={() => handleTabClick('채팅')}>
          <NavIcon>{renderChatIcon()}</NavIcon>
          <NavText isActive={activeTab === '채팅'}>채팅</NavText>
        </NavItem>

        <NavItem isActive={activeTab === '마이페이지'} onClick={() => handleTabClick('마이페이지')}>
          <NavIcon>{renderProfileIcon()}</NavIcon>
          <NavText isActive={activeTab === '마이페이지'}>마이페이지</NavText>
        </NavItem>
      </NavContainer>
    </FixedNavContainer>
  );
};

export default BottomNavigation;
