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

// MainContent 스타일
const MainContent = styled.main`
  flex: 1;
  padding: 47px 0 60px 0; // 헤더(47px)와 네비게이션(60px) 높이만큼 패딩
  width: 100%;
  max-width: 375px;
  margin: 0 auto;
  overflow-y: auto; // 스크롤이 필요할 경우 MainContent 내부에서만 스크롤 되도록 함
  position: relative; // 위치 지정
`;

// 네비게이션 메뉴 매핑 - routes/index.tsx와 일치하도록 수정
const tabPathMap = {
  홈: '/',
  보관소: '/storage', // '/storagelist'에서 '/storage'로 수정
  채팅: '/chat/list', // '/chat'에서 '/chat/list'로 수정
  마이페이지: '/mypage',
};

// 경로에 따른 헤더 제목 매핑 - 실제 라우트와 일치하도록 수정
const pathTitleMap: { [key: string]: string } = {
  '/': '홈',
  '/storage': '보관소', // '/storagelist'에서 '/storage'로 수정
  '/storagedetail': '보관소 상세',
  '/chat/list': '채팅', // '/chat'에서 '/chat/list'로 수정
  '/chat': '채팅',
  '/mypage': '마이페이지',
  '/login': '로그인',
  '/myplace': '내 공간',
  '/mytrade': '거래내역',
  '/registration/step1': '회원가입 (1/3)',
  '/registration/step2': '회원가입 (2/3)',
  '/registration/step3': '회원가입 (3/3)',
  '/editstorage': '보관소 등록', // 보관소 등록 페이지 추가
};

// 네비게이션이 표시되지 않는 경로 목록
const noNavPaths = [
  '/login',
  '/registration/step1',
  '/registration/step2',
  '/registration/step3',
  '/chat/', // 채팅 상세 페이지에서 네비바 숨기기 (앞부분만 매칭)
];

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'홈' | '보관소' | '채팅' | '마이페이지'>('홈');
  const [pageTitle, setPageTitle] = useState('홈');
  const [showNav, setShowNav] = useState(true);

  // 경로 변경시 탭 및 타이틀 업데이트
  useEffect(() => {
    const path = location.pathname;

    // 경로의 첫 번째 부분을 추출 (예: '/chat/123' -> '/chat')
    const basePath = '/' + path.split('/')[1];

    // 상세 페이지 경로 처리 (storagedetail/:id 와 같은 패턴)
    const isDetailPath = path.includes('/storagedetail/');

    // 현재 경로에 해당하는 타이틀 설정
    let title = pathTitleMap[path] || pathTitleMap[basePath];

    // 상세 페이지의 경우 기본 타이틀 사용
    if (isDetailPath) {
      title = '보관소 상세';
    } else if (path.match(/^\/chat\/\d+$/)) {
      title = '채팅';
    }

    setPageTitle(title || '마타조');

    // 네비게이션 표시 여부 결정
    const shouldShowNav = !noNavPaths.some(
      noNavPath => path === noNavPath || (noNavPath.endsWith('/') && path.startsWith(noNavPath)),
    );
    setShowNav(shouldShowNav);

    // 현재 경로에 해당하는 활성 탭 설정
    if (path === '/') {
      setActiveTab('홈');
    } else if (path.startsWith('/storage') || path.startsWith('/storagedetail')) {
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
          location.pathname.startsWith('/storagedetail/') || location.pathname === '/mytrade'
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
