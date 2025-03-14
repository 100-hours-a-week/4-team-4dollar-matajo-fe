import React from 'react';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';

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

// 반복적으로 사용되는 스타일 컴포넌트 통합
const TransactionCard = styled.div<{ top: number }>`
  width: 326px;
  height: 150px;
  position: absolute;
  left: 23px;
  top: ${props => props.top}px;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 1px ${THEME.borderColor} solid;
`;

const TransactionType = styled.span<{ isDeposit?: boolean; top: number; left: number }>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  color: ${props => (props.isDeposit ? THEME.primaryAlpha : THEME.darkText)};
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const ItemName = styled.span<{ top: number; left: number }>`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  color: ${THEME.darkText};
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const UserInfo = styled.div<{ top: number }>`
  position: absolute;
  left: 43px;
  top: ${props => props.top}px;
  color: ${THEME.lightGrayText};
  font-size: 17px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const LocationDate = styled.div<{ top: number }>`
  position: absolute;
  left: 42px;
  top: ${props => props.top}px;
  color: ${THEME.lightGrayText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
  word-wrap: break-word;
`;

const TotalAmount = styled.div<{ top: number }>`
  position: absolute;
  left: 42px;
  top: ${props => props.top}px;
  width: 297px;
  text-align: right;
  color: ${THEME.blackText};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.02px;
  word-wrap: break-word;
`;

const Divider = styled.div<{ top: number }>`
  width: 294px;
  height: 0;
  position: absolute;
  left: 43px;
  top: ${props => props.top}px;
  outline: 1px ${THEME.dividerColor} solid;
  outline-offset: -0.5px;
`;

const BackButton = styled.div`
  width: 24px;
  height: 24px;
  position: absolute;
  left: 12px;
  top: 33px;
  z-index: 10;
`;

const BackArrow = styled.div`
  width: 10.86px;
  height: 17.93px;
  position: absolute;
  left: 7px;
  top: 3px;
  background: #212121;
`;

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  height: 812px;
  position: relative;
  background: white;
  overflow: hidden;
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

// 메인 컴포넌트
const MyTrade: React.FC = () => {
  const onBackClick = () => {
    console.log('Back button clicked');
    // 실제 구현에서는 라우터 history를 이용한 뒤로가기 기능 구현
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
  ];

  // 금액 포맷 함수
  const formatAmount = (amount: number) => {
    return `총 ${amount.toLocaleString()}원`;
  };

  return (
    <Container>
      {/* 페이지 헤더 */}
      <Header title="내 거래 내역" />
      {/* 뒤로가기 버튼 */}
      <BackButton onClick={onBackClick}>
        <BackArrow />
      </BackButton>
      {/* 거래 내역 목록 */}
      {transactions.map((item, index) => {
        const baseTop = 87 + index * 162;
        return (
          <React.Fragment key={item.id}>
            <TransactionCard top={baseTop} />
            {/* 거래 타입에 따른 내용 */}
            {item.type === 'deposited' && (
              <>
                <TransactionType top={baseTop + 29} left={42} isDeposit={true}>
                  맡아줬어요
                </TransactionType>
                <ItemName top={baseTop + 29} left={133}>
                  {item.itemName}
                </ItemName>
              </>
            )}
            {item.type === 'stored' && (
              <>
                <TransactionType top={baseTop + 29} left={43} isDeposit={true}>
                  보관했어요
                </TransactionType>
                <ItemName top={baseTop + 29} left={134}>
                  {item.itemName}
                </ItemName>
              </>
            )}
            <UserInfo top={baseTop + 55}>{item.userCode}</UserInfo>
            <LocationDate top={baseTop + 77}>
              {item.location} | {item.period}
            </LocationDate>
            <Divider top={baseTop + 102} />
            <TotalAmount top={baseTop + 112}>{formatAmount(item.amount)}</TotalAmount>
          </React.Fragment>
        );
      })}

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </Container>
  );
};

export default MyTrade;
