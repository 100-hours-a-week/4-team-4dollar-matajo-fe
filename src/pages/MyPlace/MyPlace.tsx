import React from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

// 테마 컬러 상수 정의 - 향후 별도 파일로 분리 가능
const THEME = {
  primary: '#3835FD',
  background: '#F5F5FF',
  primaryTransparent: 'rgba(56.26, 53.49, 252.61, 0.80)',
  grayText: '#616161',
  lightGrayText: '#C0BDBD',
  grayTransparent: 'rgba(97, 97, 97, 0.80)',
  borderColor: '#E0E0E0',
  white: '#FFFFFF',
};

// 반복적으로 사용되는 스타일 컴포넌트 통합
const StorageCard = styled.div<{ top: number }>`
  width: 326px;
  height: 96px;
  position: absolute;
  left: 23px;
  top: ${props => props.top}px;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 1px ${THEME.borderColor} solid;
`;

const StorageImage = styled.img<{ top: number }>`
  width: 69px;
  height: 66px;
  position: absolute;
  left: 262px;
  top: ${props => props.top}px;
  border-radius: 2px;
`;

const StorageName = styled.div<{ top: number }>`
  position: absolute;
  left: 43px;
  top: ${props => props.top}px;
  color: ${THEME.grayText};
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const StorageLocation = styled.div<{ top: number }>`
  position: absolute;
  left: 42px;
  top: ${props => props.top}px;
  color: ${THEME.lightGrayText};
  font-size: 13px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const VisibilityTag = styled.div<{ top: number; isPublic: boolean }>`
  width: 55px;
  height: 32px;
  position: absolute;
  left: 38px;
  top: ${props => props.top}px;
  text-align: center;
  color: ${props => (props.isPublic ? THEME.primaryTransparent : THEME.grayTransparent)};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const VisibilityBorder = styled.div<{ top: number; isPublic: boolean }>`
  width: 45px;
  height: 17px;
  position: absolute;
  left: 43px;
  top: ${props => props.top}px;
  border-radius: 21px;
  border: 1px ${props => (props.isPublic ? THEME.primaryTransparent : THEME.grayTransparent)} solid;
`;

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  height: 812px;
  position: relative;
  background: white;
  overflow: hidden;
`;

// 보관소 항목 타입 정의
interface StorageItem {
  id: number;
  name: string;
  location: string;
  isPublic: boolean;
  imageUrl: string;
}

// 메인 컴포넌트
const MyPlace: React.FC = () => {
  // 더미 데이터
  const storageItems: StorageItem[] = [
    {
      id: 1,
      name: '마곡 냉동창고',
      location: '동두천시 생연동',
      isPublic: true,
      imageUrl: 'https://placehold.co/69x66',
    },
    {
      id: 2,
      name: '마곡 냉동창고',
      location: '동두천시 생연동',
      isPublic: true,
      imageUrl: 'https://placehold.co/69x66',
    },
    {
      id: 3,
      name: '연동 돈가스집 옆',
      location: '반박시 니말맞동',
      isPublic: false,
      imageUrl: 'https://placehold.co/69x66',
    },
    {
      id: 4,
      name: '연동 돈가스집 옆',
      location: '반박시 니말맞동',
      isPublic: false,
      imageUrl: 'https://placehold.co/69x66',
    },
  ];

  return (
    <Container>
      {/* 페이지 헤더 */}
      <Header title="내 보관소" />

      {/* 보관소 목록 */}
      {storageItems.map((item, index) => {
        const baseTop = 87 + index * 114;
        return (
          <React.Fragment key={item.id}>
            <StorageCard top={baseTop} />
            <StorageImage src={item.imageUrl} top={baseTop + 15} />
            <StorageName top={baseTop + (index === 2 ? 38 : 37)}>{item.name}</StorageName>
            <VisibilityTag top={baseTop + 18} isPublic={item.isPublic}>
              {item.isPublic ? '공개' : '비공개'}
            </VisibilityTag>
            <StorageLocation top={baseTop + 60}>{item.location}</StorageLocation>
            <VisibilityBorder top={baseTop + 17} isPublic={item.isPublic} />
          </React.Fragment>
        );
      })}

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </Container>
  );
};

export default MyPlace;
