import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { getMyTrades, TradeItem } from '../../../services/api/modules/user';
import moment from 'moment';
import { ROUTES } from '../../../constants/routes';

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

// 트랜잭션 카드 스타일 - 중앙 정렬 개선
const TransactionCard = styled.div`
  width: 300px;
  height: 130px;
  margin: 15px auto;
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

// 로딩 컴포넌트
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${THEME.lightGrayText};
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

// 에러 메시지 컴포넌트
const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: red;
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

// 데이터 없음 메시지
const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${THEME.lightGrayText};
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

interface MyTradeProps {
  onBack?: () => void;
}

// 메인 컴포넌트
const MyTrade: React.FC<MyTradeProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 거래 내역 데이터 조회
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyTrades();
        setTrades(data);
      } catch (err) {
        console.error('거래 내역 조회 실패:', err);
        setError('거래 내역을 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // 뒤로가기 핸들러 함수 - MyPage로 이동
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/${ROUTES.MYPAGE}`);
    }
  };

  // 날짜 형식 변환 - '2025-03-18' -> '2025.03.18'
  const formatDate = (dateString: string) => {
    return dateString.replace(/-/g, '.');
  };

  // 보관 기간 계산 - 시작일 + 보관 기간으로 종료일 계산
  const calculateEndDate = (startDate: string, storagePeriod: number) => {
    return moment(startDate).add(storagePeriod, 'days').format('YYYY.MM.DD');
  };

  // 금액 포맷 함수
  const formatAmount = (amount: number) => {
    return `총 ${amount.toLocaleString()}원`;
  };

  // 현재 사용자 ID 가져오기
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');

  return (
    <>
      {/* 페이지 헤더 - onBack prop을 handleBackClick으로 설정 */}
      <Header title="내 거래 내역" showBackButton={true} onBack={handleBackClick} />

      <Container>
        {loading ? (
          <LoadingContainer>거래 내역을 불러오는 중...</LoadingContainer>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : trades.length === 0 ? (
          <NoDataMessage>거래 내역이 없습니다.</NoDataMessage>
        ) : (
          // 거래 내역 목록
          trades.map(trade => {
            // 타입 결정 - 보관자(keeper)면 '맡아줬어요', 아니면 '보관했어요'
            const isKeeper = trade.keeperStatus;
            const endDate = calculateEndDate(trade.startDate, trade.storagePeriod);

            return (
              <TransactionCard key={trade.tradeId}>
                <CardHeader>
                  <TransactionType isDeposit={isKeeper}>
                    {isKeeper ? '맡아줬어요' : '보관했어요'}
                  </TransactionType>
                  <ItemName>{trade.productName}</ItemName>
                </CardHeader>

                <CardContent>
                  <UserInfo>타조 {trade.userId}</UserInfo>
                  <LocationDate>
                    {trade.postAddress} | {formatDate(trade.startDate)} ~ {endDate}
                  </LocationDate>
                </CardContent>

                <Divider />

                <TotalAmount>{formatAmount(trade.tradePrice)}</TotalAmount>
              </TransactionCard>
            );
          })
        )}
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </>
  );
};

export default MyTrade;
