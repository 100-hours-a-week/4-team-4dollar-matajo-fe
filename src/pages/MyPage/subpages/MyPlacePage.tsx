import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3835FD',
  primaryLight: '#5E5CFD',
  tagBackground: '#F5F5F5',
  tagBlueText: '#5E5CFD',
  tagGrayText: '#616161',
  textDark: '#000000',
  textGray: '#868686',
  borderColor: '#EFEFEF',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트 - 중앙 정렬 추가
const Container = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: calc(100vh - 166px);
  background: white;
  overflow-y: auto;
  padding-bottom: 40px;
  padding-top: 10px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 거래 아이템 카드 - 중앙 정렬 수정
const TradeItemCard = styled.div`
  width: 90%;
  max-width: 340px;
  margin: 10px auto;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid ${THEME.borderColor};
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

// 토글 컴포넌트 - 중앙 정렬
const ToggleContainer = styled.div`
  width: 238px;
  height: 40px;
  position: relative;
  background: rgba(56.26, 53.49, 252.61, 0.8);
  overflow: hidden;
  border-radius: 15px;
  margin: 15px auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ToggleText = styled.span`
  color: white;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 18.84px;
  letter-spacing: 0.28px;
  word-wrap: break-word;
`;

interface MyPlaceProps {
  onBack?: () => void;
}

// 거래 아이템 타입 정의
interface TradeItem {
  id: number;
  title: string;
  location: string;
  isPublic: boolean;
  imageUrl: string;
}

const MyPlace: React.FC<MyPlaceProps> = ({ onBack }) => {
  // 추가: useNavigate 훅 사용
  const navigate = useNavigate();

  // 추가: 뒤로가기 핸들러 함수
  const handleBack = () => {
    navigate('/mypage'); // MyPage로 이동
  };

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

  // 토글 버튼 클릭 핸들러
  const handleToggleClick = () => {
    // 토글 기능 구현
    console.log('토글 버튼 클릭됨');
  };

  return (
    <>
      <Header title="내 보관소" showBackButton={true} onBack={handleBack} />

      <Container>
        {/* 토글 버튼 */}
        <ToggleContainer onClick={handleToggleClick}>
          <ToggleText>보관소가 비공개 되었습니다.</ToggleText>
        </ToggleContainer>

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

export default MyPlace;
