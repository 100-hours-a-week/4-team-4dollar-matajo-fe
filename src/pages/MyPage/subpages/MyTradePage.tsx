import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getMyTrades } from '../../../services/api/modules/trades';
import { TradeItem } from '../../../services/api/modules/trades';
import { ROUTES } from '../../../constants/routes';
import { checkAndRefreshToken } from '../../../utils/api/authUtils';

const Container = styled.div`
  width: 100%;
  max-width: 375px;
  height: 100vh;
  position: relative;
  background: white;
  overflow-x: hidden;
  padding-top: 22px;
  margin: 0 auto;
`;

const Title = styled.span`
  color: #464646;
  font-size: 15px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.02px;
  margin-left: 40px;
`;

const TradeCard = styled.div`
  width: 90%;
  height: 100px;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 1px #e0e0e0 solid;
  padding: 16px;
  margin-bottom: 20px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0px);
  }
`;

const TradeTitle = styled.span`
  color: #616161;
  font-size: 18px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.02px;
  display: inline-block;
`;

const TradeStatus = styled.span`
  color: rgba(56.26, 53.49, 252.61, 0.8);
  font-size: 13px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.01px;
  display: block;
  margin-bottom: 4px;
`;

const TradeInfo = styled.span`
  color: #c0bdbd;
  font-size: 12px;
  font-family: Noto Sans KR;
  font-weight: 500;
  letter-spacing: 0.01px;
  display: block;
  margin-top: 4px;
`;

const TradeAmount = styled.span`
  color: #292929;
  font-size: 15px;
  font-family: Noto Sans KR;
  font-weight: 500;
  letter-spacing: 0.02px;
  position: absolute;
  bottom: 16px;
  right: 16px;
`;

const Divider = styled.div`
  width: 294px;
  height: 1px;
  background: #dcdcdc;
  margin: 16px auto;
`;

const BottomNav = styled.div`
  width: 375px;
  height: 76px;
  padding: 16px;
  background: #f5f5ff;
  border-top: 1px #f5f5ff solid;
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: space-between;
`;

const NavItem = styled.div`
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const NavText = styled.span<{ active?: boolean }>`
  color: ${props => (props.active ? '#3835FD' : '#61646B')};
  font-size: 12px;
  font-family: Noto Sans KR;
  font-weight: 350;
  line-height: 16px;
  letter-spacing: 0.6px;
`;

// 모달 스타일 컴포넌트 추가
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  width: 320px;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
  &:hover {
    color: #333;
  }
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 16px;
  color: #333;
  font-weight: 700;
`;

const DetailItem = styled.div`
  margin-bottom: 12px;
`;

const DetailLabel = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const MyTrade: React.FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_INTERVAL = 500; // 0.5초 간격으로 요청 제한

  // 선택된 거래와 모달 상태 추가
  const [selectedTrade, setSelectedTrade] = useState<TradeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 요청 간격 제한 확인
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_INTERVAL) {
      return;
    }
    lastRequestTimeRef.current = now;

    const fetchTrades = async () => {
      try {
        // 토큰 재발급 시도
        const isTokenValid = await checkAndRefreshToken();

        // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
        if (!isTokenValid) {
          setError('로그인이 필요합니다. 다시 로그인해주세요.');
          navigate('/login', { replace: true });
          return;
        }

        const response = await getMyTrades();
        setTrades(response || []);
      } catch (err: any) {
        console.error('거래 내역 조회 실패:', err);

        // 기존 에러 처리 로직 유지
        if (
          err.message === '인증 토큰이 없습니다.' ||
          err.message === '인증이 만료되었습니다. 다시 로그인해주세요.'
        ) {
          setError('로그인이 필요합니다. 다시 로그인해주세요.');
          navigate('/login', { replace: true });
        } else {
          setError('거래 내역을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [navigate]);

  const handleTradeItemClick = (tradeId: number) => {
    // navigate(`/${ROUTES.MYPAGE}/${ROUTES.MYTRADE}/${tradeId}`);
    console.log(`거래 ID ${tradeId} 항목 클릭됨`);
    // 페이지 이동 없이 처리

    // 선택된 거래 찾기
    const trade = trades.find(t => t.trade_id === tradeId);
    if (trade) {
      setSelectedTrade(trade);
      setIsModalOpen(true);
    }
  };

  // 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrade(null);
  };

  if (loading) {
    return (
      <Container>
        <div>로딩 중...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div>{error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <div style={{ marginBottom: '20px' }}>
        {trades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            거래 내역이 없습니다.
          </div>
        ) : (
          trades.map(trade => (
            <TradeCard key={trade.trade_id} onClick={() => handleTradeItemClick(trade.trade_id)}>
              <div>
                <TradeStatus>{trade.keeper_status ? '맡아줬어요' : '보관했어요'}</TradeStatus>
                <div>
                  <TradeTitle>{trade.product_name}</TradeTitle>
                </div>
              </div>
              <TradeInfo>
                {trade.post_address} | {trade.start_date}~
                {
                  new Date(
                    new Date(trade.start_date).getTime() +
                      trade.storage_period * 24 * 60 * 60 * 1000,
                  )
                    .toISOString()
                    .split('T')[0]
                }
              </TradeInfo>
              <TradeAmount>총 {trade.trade_price.toLocaleString()}원</TradeAmount>
            </TradeCard>
          ))
        )}
      </div>

      {/* 거래 상세 정보 모달 */}
      {isModalOpen && selectedTrade && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={closeModal}>&times;</CloseButton>
            <ModalTitle>거래 상세 정보</ModalTitle>

            <DetailItem>
              <DetailLabel>거래 유형</DetailLabel>
              <DetailValue>{selectedTrade.keeper_status ? '맡아줬어요' : '보관했어요'}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>보관 물품</DetailLabel>
              <DetailValue>{selectedTrade.product_name}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>보관 장소</DetailLabel>
              <DetailValue>{selectedTrade.post_address}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>거래 일자</DetailLabel>
              <DetailValue>{selectedTrade.trade_date}</DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>보관 기간</DetailLabel>
              <DetailValue>
                {selectedTrade.start_date} ~{' '}
                {
                  new Date(
                    new Date(selectedTrade.start_date).getTime() +
                      selectedTrade.storage_period * 24 * 60 * 60 * 1000,
                  )
                    .toISOString()
                    .split('T')[0]
                }
                ({selectedTrade.storage_period}일)
              </DetailValue>
            </DetailItem>

            <DetailItem>
              <DetailLabel>거래 금액</DetailLabel>
              <DetailValue style={{ color: '#3835FD', fontWeight: '700' }}>
                총 {selectedTrade.trade_price.toLocaleString()}원
              </DetailValue>
            </DetailItem>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default MyTrade;
