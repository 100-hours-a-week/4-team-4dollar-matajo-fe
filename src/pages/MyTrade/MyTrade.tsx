import React from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';

// 테마 컬러 상수 정의 - 향후 별도 파일로 분리 가능
const THEME = {
  primary: '#3835FD',
  primaryLight: '#605EFD',
  primaryAlpha: 'rgba(56.26, 53.49, 252.61, 0.80)',
  background: '#F5F5FF',
  darkText: '#616161',
  lightGrayText: '#C0BDBD',
  blackText: '#292929',
  borderColor: '#E0E0E0',
  dividerColor: '#DCDCDC',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  height: calc(100vh - 166px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: auto;
  padding-bottom: 40px;
  padding-top: 10px;
`;

// 트랜잭션 카드 스타일 - 절대 위치 제거
const TransactionCard = styled.div`
  width: 300px;
  height: 130px;
  margin: 15px;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 2px ${THEME.borderColor} solid;
  position: relative;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

// 상단 정보 영역
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
`;

const TransactionType = styled.span<{ isDeposit?: boolean }>`
  color: ${props => (props.isDeposit ? THEME.primaryAlpha : THEME.darkText)};
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  margin-right: 10px;
`;

const ItemName = styled.span`
  color: ${THEME.darkText};
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
`;

// 중간 정보 영역
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const UserInfo = styled.div`
  color: ${THEME.lightGrayText};
  font-size: 17px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
`;

const LocationDate = styled.div`
  color: ${THEME.lightGrayText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
  margin-bottom: 6px;
`;

// 구분선
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${THEME.dividerColor};
  margin: 8px 0;
`;

// 하단 금액 정보
const TotalAmount = styled.div`
  width: 100%;
  text-align: right;
  color: ${THEME.blackText};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.02px;
`;

// 트랜잭션 항목 타입 정의
interface TransactionItem {
  id: number;
  type: 'deposited' | 'stored'; // 맡아줬어요 or 보관했어요
  itemName: string;
  userCode: string;
  location: string;
  period: string;
  amount: number;
}

interface MyTradeProps {
  onBack?: () => void;
}

// 메인 컴포넌트
const MyTrade: React.FC<MyTradeProps> = ({ onBack }) => {
  const navigate = useNavigate();

  // 뒤로가기 핸들러 함수 - MyPage로 이동
  const handleBackClick = () => {
    navigate('/mypage');
  };

  // 더미 데이터
  const transactions: TransactionItem[] = [
    {
      id: 1,
      type: 'deposited',
      itemName: '농구공',
      userCode: '타조 20229',
      location: '서울시 성동구',
      period: '2024.09.14.~2025.03.02',
      amount: 20000,
    },
    {
      id: 2,
      type: 'stored',
      itemName: '노트북',
      userCode: '타조 23229',
      location: '서울시 중랑구',
      period: '2024.09.14.~2025.03.02',
      amount: 70000,
    },
    {
      id: 3,
      type: 'deposited',
      itemName: '농구공',
      userCode: '타조 20229',
      location: '서울시 성동구',
      period: '2024.09.14.~2025.03.02',
      amount: 20000,
    },
    {
      id: 4,
      type: 'stored',
      itemName: '노트북',
      userCode: '타조 23229',
      location: '서울시 중랑구',
      period: '2024.09.14.~2025.03.02',
      amount: 70000,
    },
  ];

  // 금액 포맷 함수
  const formatAmount = (amount: number) => {
    return `총 ${amount.toLocaleString()}원`;
  };

  return (
    <>
      {/* 페이지 헤더 - onBack prop을 handleBackClick으로 설정 */}
      <Header title="내 거래 내역" showBackButton={true} onBack={handleBackClick} />

      <Container>
        {/* 거래 내역 목록 */}
        {transactions.map(item => (
          <TransactionCard key={item.id}>
            <CardHeader>
              <TransactionType isDeposit={true}>
                {item.type === 'deposited' ? '맡아줬어요' : '보관했어요'}
              </TransactionType>
              <ItemName>{item.itemName}</ItemName>
            </CardHeader>

            <CardContent>
              <UserInfo>{item.userCode}</UserInfo>
              <LocationDate>
                {item.location} | {item.period}
              </LocationDate>
            </CardContent>

            <Divider />

            <TotalAmount>{formatAmount(item.amount)}</TotalAmount>
          </TransactionCard>
        ))}
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </>
  );
};

export default MyTrade;
