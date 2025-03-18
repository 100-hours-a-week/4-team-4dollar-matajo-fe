import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3835FD',
  primaryLight: '#5E5CFD',
  background: '#FFFFFF',
  cardBorder: '#EFEFEF',
  tagBackground: '#F5F5FF',
  tagBlueText: '#5E5CFD',
  tagGrayText: '#616161',
  textDark: '#000000',
  textGray: '#868686',
  borderColor: '#EFEFEF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  height: calc(100vh - 76px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: ${THEME.background};
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 76px; /* 하단 네비게이션 높이만큼 마진 */
  padding-top: 47px; /* 헤더 높이만큼 패딩 */
`;

// 거래 아이템 카드
const TradeItemCard = styled.div`
  width: calc(100% - 48px);
  margin: 8px;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid ${THEME.cardBorder};
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

// 거래 이미지
const TradeImage = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
`;

// 태그 스타일
const StatusTag = styled.div<{ isPublic: boolean }>`
  display: inline-block;
  width: fit-content;
  padding: 2px 8px;
  background: ${THEME.tagBackground};
  color: ${props => (props.isPublic ? THEME.tagBlueText : THEME.tagGrayText)};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  border: 1px ${props => (props.isPublic ? THEME.tagBlueText : THEME.tagGrayText)} solid;
  font-weight: 500;
  border-radius: 10px;
  margin-bottom: 8px;
`;

// 거래 정보 컨테이너
const TradeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// 거래 제목
const TradeTitle = styled.div`
  color: ${THEME.textDark};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  margin-bottom: 4px;
`;

// 거래 위치
const TradeLocation = styled.div`
  color: ${THEME.textGray};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
`;

// 오른쪽 화살표 아이콘
const ArrowIcon = styled.div`
  width: 8px;
  height: 16px;
  position: absolute;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-top: 2px solid ${THEME.textGray};
    border-right: 2px solid ${THEME.textGray};
    transform: rotate(45deg);
  }
`;

// 거래 아이템 타입 정의
interface TradeItem {
  id: number;
  title: string;
  location: string;
  isPublic: boolean;
  imageUrl: string;
}

const MyTrade: React.FC = () => {
  const navigate = useNavigate();

  // 더미 거래 데이터
  const tradeItems: TradeItem[] = [
    {
      id: 1,
      title: '마곡 냉동창고',
      location: '동두천시 생연동',
      isPublic: false,
      imageUrl: 'https://placehold.co/64x64',
    },
    {
      id: 2,
      title: '마곡 냉동창고',
      location: '동두천시 생연동',
      isPublic: true,
      imageUrl: 'https://placehold.co/64x64',
    },
    {
      id: 3,
      title: '마곡 냉동창고',
      location: '동두천시 생연동',
      isPublic: true,
      imageUrl: 'https://placehold.co/64x64',
    },
    {
      id: 4,
      title: '마곡 냉동창고',
      location: '동두천시 생연동',
      isPublic: false,
      imageUrl: 'https://placehold.co/64x64',
    },
  ];

  // 보관소 상세 페이지로 이동하는 함수
  const handleTradeItemClick = (id: number) => {
    // navigate(`/storagedetail/${id}`);
    // 또는
    // navigate('/storagedetail', { state: { id } });
    console.log(`거래 아이템 ${id} 클릭됨, 상세 페이지로 이동`);
  };

  return (
    <>
      <Header title="내 보관소" showBackButton={true} />

      <Container>
        {tradeItems.map(item => (
          <TradeItemCard key={item.id} onClick={() => handleTradeItemClick(item.id)}>
            <TradeImage>
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </TradeImage>

            <TradeInfo>
              <StatusTag isPublic={item.isPublic}>{item.isPublic ? '공개' : '비공개'}</StatusTag>
              <TradeTitle>{item.title}</TradeTitle>
              <TradeLocation>{item.location}</TradeLocation>
            </TradeInfo>

            <ArrowIcon />
          </TradeItemCard>
        ))}
      </Container>

      <BottomNavigation activeTab="마이페이지" />
    </>
  );
};

export default MyTrade;
