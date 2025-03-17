import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import BottomNavigation from './BottomNavigation';

// 스타일 컴포넌트
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  background-color: #f5f5ff;
  position: relative;
`;

// LayoutContainer는 수정할 필요 없음

// MainContent를 수정해야 함
const MainContent = styled.main`
  flex: 1;
  padding: 47px 0 60px 0; // 헤더(47px)와 네비게이션(60px) 높이만큼 패딩
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  overflow-y: auto; // 스크롤이 필요할 경우 MainContent 내부에서만 스크롤 되도록 함
  position: relative; // 위치 지정
`;

// 네비게이션 메뉴 매핑
const tabPathMap = {
  홈: '/',
  보관소: '/storagelist',
  채팅: '/chat',
  마이페이지: '/mypage',
};

// 경로에 따른 헤더 제목 매핑
const pathTitleMap: { [key: string]: string } = {
  '/': '홈',
  '/storagelist': '보관소',
  '/storagedetail': '보관소 상세',
  '/chat': '채팅',
  '/mypage': '마이페이지',
  '/login': '로그인',
  '/myplace': '내 공간',
  '/mytrade': '거래내역',
  '/registration/step1': '회원가입 (1/3)',
  '/registration/step2': '회원가입 (2/3)',
  '/registration/step3': '회원가입 (3/3)',
};

// 네비게이션이 표시되지 않는 경로 목록
const noNavPaths = ['/login', '/registration/step1', '/registration/step2', '/registration/step3'];

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'홈' | '보관소' | '채팅' | '마이페이지'>('홈');
  const [pageTitle, setPageTitle] = useState('홈');
  const [showNav, setShowNav] = useState(true);

  // 경로 변경시 탭 및 타이틀 업데이트
  useEffect(() => {
    const path = location.pathname;

    // 현재 경로에 해당하는 타이틀 설정
    const title = pathTitleMap[path] || '마타조';
    setPageTitle(title);

    // 네비게이션 표시 여부 결정
    const shouldShowNav = !noNavPaths.some(noNavPath => path.startsWith(noNavPath));
    setShowNav(shouldShowNav);

    // 현재 경로에 해당하는 활성 탭 설정
    if (path === '/') {
      setActiveTab('홈');
    } else if (path.startsWith('/storagelist') || path.startsWith('/storagedetail')) {
      setActiveTab('보관소');
    } else if (path.startsWith('/chat')) {
      setActiveTab('채팅');
    } else if (
      path.startsWith('/mypage') ||
      path.startsWith('/myplace') ||
      path.startsWith('/mytrade')
    ) {
      setActiveTab('마이페이지');
    }
  }, [location.pathname]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: '홈' | '보관소' | '채팅' | '마이페이지') => {
    setActiveTab(tab);
    navigate(tabPathMap[tab]);
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <LayoutContainer>
      <Header
        title={pageTitle}
        showBackButton={location.pathname !== '/'}
        onBack={handleBack}
        showOptionButton={
          location.pathname === '/storagedetail' || location.pathname === '/mytrade'
        }
        dropdownOptions={[
          {
            id: 'edit',
            label: '수정하기',
            icon: '✏️',
            onClick: () => console.log('수정하기 클릭'),
          },
          {
            id: 'delete',
            label: '삭제하기',
            icon: '🗑️',
            color: '#ff4b4b',
            onClick: () => console.log('삭제하기 클릭'),
          },
        ]}
      />

      <MainContent>
        <Outlet />
      </MainContent>

      {showNav && <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />}
    </LayoutContainer>
  );
};

export default MainLayout;
