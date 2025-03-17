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
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100;
  background: ${THEME.background};
  display: flex;
  justify-content: center;
`;

const NavContainer = styled.div`
  width: 375px;
  height: 60px;
  padding: 16px 0px 0px;
  background: ${THEME.background};
  overflow: hidden;
  border-top: 1px #efeff0 solid;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
`;

const NavItem = styled.div<{ isActive?: boolean }>`
  width: 70px;
  padding: 0 3px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
  cursor: pointer;
`;

const NavIcon = styled.div<{ isActive?: boolean }>`
  width: 28px;
  height: 28px;
  position: relative;
`;

const NavText = styled.div<{ isActive?: boolean }>`
  text-align: center;
  width: 60px;
  color: ${props => (props.isActive ? THEME.primary : '#61646B')};
  font-size: 11px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  line-height: 16px;
  letter-spacing: 0.6px;
  word-wrap: break-word;
  padding: 4px 0px;
`;

// SVG 아이콘 컴포넌트
const HomeIcon = styled.div<{ isActive?: boolean }>`
  width: 23.92px;
  height: 25.09px;
  left: 2.33px;
  top: 1.17px;
  position: absolute;
  background: ${props => (props.isActive ? THEME.primary : '#61646B')};
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='26' fill='none'%3E%3Cpath fill='%23000' d='m23.217 10.523-2.916-2.525V3.5a.591.591 0 0 0-.583-.6h-2.333a.591.591 0 0 0-.584.6v1.68l-4.3-3.721a1.167 1.167 0 0 0-1.533 0L.285 10.523a.597.597 0 0 0-.049.835l1.015 1.236a.58.58 0 0 0 .823.051L11.92 4.04l9.846 8.606a.58.58 0 0 0 .823-.051l1.015-1.236a.597.597 0 0 0-.385-.835Zm-11.3 1.67v9.3a.591.591 0 0 0 .583.6h3.5a.591.591 0 0 0 .583-.6v-5.4h3.5v5.4a.591.591 0 0 0 .584.6h3.5a.591.591 0 0 0 .583-.6v-9.3L11.92 4.04l-10.003 8.153v9.3a.591.591 0 0 0 .583.6h3.5a.591.591 0 0 0 .584-.6v-5.4h3.5v5.4a.591.591 0 0 0 .583.6'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='26' fill='none'%3E%3Cpath fill='%23000' d='m23.217 10.523-2.916-2.525V3.5a.591.591 0 0 0-.583-.6h-2.333a.591.591 0 0 0-.584.6v1.68l-4.3-3.721a1.167 1.167 0 0 0-1.533 0L.285 10.523a.597.597 0 0 0-.049.835l1.015 1.236a.58.58 0 0 0 .823.051L11.92 4.04l9.846 8.606a.58.58 0 0 0 .823-.051l1.015-1.236a.597.597 0 0 0-.385-.835Zm-11.3 1.67v9.3a.591.591 0 0 0 .583.6h3.5a.591.591 0 0 0 .583-.6v-5.4h3.5v5.4a.591.591 0 0 0 .584.6h3.5a.591.591 0 0 0 .583-.6v-9.3L11.92 4.04l-10.003 8.153v9.3a.591.591 0 0 0 .583.6h3.5a.591.591 0 0 0 .584-.6v-5.4h3.5v5.4a.591.591 0 0 0 .583.6'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
`;

const StorageIcon = styled.div<{ isActive?: boolean }>`
  width: 22.72px;
  height: 22.72px;
  left: 2.33px;
  top: 2.33px;
  position: absolute;
  background: ${props => (props.isActive ? THEME.primary : '#61646B')};
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='23' height='23' fill='none'%3E%3Cpath fill='%23000' d='M20.392 2.333H8.975a1.424 1.424 0 0 0-1.017.425L2.758 8.017a1.424 1.424 0 0 0-.425 1.025v10.333c0 .781.642 1.423 1.422 1.423h16.637a1.422 1.422 0 0 0 1.422-1.423V3.756a1.422 1.422 0 0 0-1.422-1.423ZM8.975 10.083a1.417 1.417 0 0 1-1.417-1.423V3.756h12.834v14.197H3.755v-7.042h3.803a1.424 1.424 0 0 0 1.417-1.423v.595Zm0-2.042V4.664L6.639 8.041h2.336Z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='23' height='23' fill='none'%3E%3Cpath fill='%23000' d='M20.392 2.333H8.975a1.424 1.424 0 0 0-1.017.425L2.758 8.017a1.424 1.424 0 0 0-.425 1.025v10.333c0 .781.642 1.423 1.422 1.423h16.637a1.422 1.422 0 0 0 1.422-1.423V3.756a1.422 1.422 0 0 0-1.422-1.423ZM8.975 10.083a1.417 1.417 0 0 1-1.417-1.423V3.756h12.834v14.197H3.755v-7.042h3.803a1.424 1.424 0 0 0 1.417-1.423v.595Zm0-2.042V4.664L6.639 8.041h2.336Z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
`;

const ChatIcon = styled.div<{ isActive?: boolean }>`
  width: 21.58px;
  height: 20.24px;
  left: 3.5px;
  top: 1.17px;
  position: absolute;
  background: ${props => (props.isActive ? THEME.primary : '#61646B')};
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='23' fill='none'%3E%3Cpath fill='%23000' d='M19.25 1.167H3.5c-1.925 0-3.5 1.58-3.5 3.5v10.5c0 1.92 1.575 3.5 3.5 3.5h5.25l3.5 3.5 3.5-3.5h3.5c1.925 0 3.5-1.58 3.5-3.5v-10.5c0-1.92-1.575-3.5-3.5-3.5Zm1.75 14c0 .962-.788 1.75-1.75 1.75h-4.08l-1.92 1.925-1.925-1.925H3.5c-.963 0-1.75-.788-1.75-1.75v-10.5c0-.962.787-1.75 1.75-1.75h15.75c.962 0 1.75.788 1.75 1.75v10.5Zm-7-5.833v-1.75h-7v1.75h7Zm3.5-3.5v-1.75h-10.5v1.75h10.5Z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='23' fill='none'%3E%3Cpath fill='%23000' d='M19.25 1.167H3.5c-1.925 0-3.5 1.58-3.5 3.5v10.5c0 1.92 1.575 3.5 3.5 3.5h5.25l3.5 3.5 3.5-3.5h3.5c1.925 0 3.5-1.58 3.5-3.5v-10.5c0-1.92-1.575-3.5-3.5-3.5Zm1.75 14c0 .962-.788 1.75-1.75 1.75h-4.08l-1.92 1.925-1.925-1.925H3.5c-.963 0-1.75-.788-1.75-1.75v-10.5c0-.962.787-1.75 1.75-1.75h15.75c.962 0 1.75.788 1.75 1.75v10.5Zm-7-5.833v-1.75h-7v1.75h7Zm3.5-3.5v-1.75h-10.5v1.75h10.5Z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
`;

const ProfileIcon = styled.div<{ isActive?: boolean }>`
  width: 18.48px;
  height: 23px;
  left: 4.67px;
  top: 2.33px;
  position: absolute;
  background: ${props => (props.isActive ? THEME.primary : '#61646B')};
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='19' height='23' fill='none'%3E%3Cpath fill='%23000' d='M9.333 10.083c2.35 0 4.25-1.905 4.25-4.25 0-2.345-1.9-4.25-4.25-4.25-2.35 0-4.25 1.905-4.25 4.25 0 2.345 1.9 4.25 4.25 4.25Zm0-6.791c1.4 0 2.542 1.141 2.542 2.541 0 1.4-1.142 2.542-2.542 2.542-1.4 0-2.541-1.142-2.541-2.542 0-1.4 1.141-2.541 2.541-2.541Zm0 9.333c-2.833 0-8.5 1.425-8.5 4.25v2.542h17v-2.542c0-2.825-5.667-4.25-8.5-4.25Zm0 1.708c3.184 0 5.892 1.283 6.792 2.542H2.542c.891-1.26 3.608-2.542 6.791-2.542Z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='19' height='23' fill='none'%3E%3Cpath fill='%23000' d='M9.333 10.083c2.35 0 4.25-1.905 4.25-4.25 0-2.345-1.9-4.25-4.25-4.25-2.35 0-4.25 1.905-4.25 4.25 0 2.345 1.9 4.25 4.25 4.25Zm0-6.791c1.4 0 2.542 1.141 2.542 2.541 0 1.4-1.142 2.542-2.542 2.542-1.4 0-2.541-1.142-2.541-2.542 0-1.4 1.141-2.541 2.541-2.541Zm0 9.333c-2.833 0-8.5 1.425-8.5 4.25v2.542h17v-2.542c0-2.825-5.667-4.25-8.5-4.25Zm0 1.708c3.184 0 5.892 1.283 6.792 2.542H2.542c.891-1.26 3.608-2.542 6.791-2.542Z'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
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

  return (
    <FixedNavContainer>
      <NavContainer>
        <NavItem isActive={activeTab === '홈'} onClick={() => handleTabClick('홈')}>
          <NavIcon>
            <HomeIcon isActive={activeTab === '홈'} />
          </NavIcon>
          <NavText isActive={activeTab === '홈'}>홈</NavText>
        </NavItem>

        <NavItem isActive={activeTab === '보관소'} onClick={() => handleTabClick('보관소')}>
          <NavIcon>
            <StorageIcon isActive={activeTab === '보관소'} />
          </NavIcon>
          <NavText isActive={activeTab === '보관소'}>보관소</NavText>
        </NavItem>

        <NavItem isActive={activeTab === '채팅'} onClick={() => handleTabClick('채팅')}>
          <NavIcon>
            <ChatIcon isActive={activeTab === '채팅'} />
          </NavIcon>
          <NavText isActive={activeTab === '채팅'}>채팅</NavText>
        </NavItem>

        <NavItem isActive={activeTab === '마이페이지'} onClick={() => handleTabClick('마이페이지')}>
          <NavIcon>
            <ProfileIcon isActive={activeTab === '마이페이지'} />
          </NavIcon>
          <NavText isActive={activeTab === '마이페이지'}>마이페이지</NavText>
        </NavItem>
      </NavContainer>
    </FixedNavContainer>
  );
};

export default BottomNavigation;
