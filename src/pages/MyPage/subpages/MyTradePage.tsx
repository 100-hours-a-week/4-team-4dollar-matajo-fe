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

const StatusBar = styled.div`
  width: 375px;
  height: 25px;
  left: 0px;
  top: 0px;
  position: absolute;
  background: #f5f5f5;
`;

const Header = styled.div`
  width: 373px;
  height: 47px;
  left: 0px;
  top: 22px;
  position: absolute;
  background: #f5f5ff;
  display: flex;
  align-items: center;
  padding: 0 12px;
`;

const BackButton = styled.div`
  left: 12px;
  top: 33px;
  position: absolute;
  cursor: pointer;
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
  width: 293px;
  height: 95px;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 1px #e0e0e0 solid;
  padding: 16px;
  margin-bottom: 20px;
  position: relative;
  margin-left: auto;
  margin-right: auto;
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

const TradeId = styled.span`
  color: #c0bdbd;
  font-size: 10px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.01px;
  display: inline-block;
  margin-left: 8px;
  vertical-align: middle;
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

const MyTrade: React.FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_INTERVAL = 500; // 0.5초 간격으로 요청 제한

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
    navigate(`/${ROUTES.MYPAGE}/${ROUTES.MYTRADE}/${tradeId}`);
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
        {trades.map(trade => (
          <TradeCard key={trade.trade_id} onClick={() => handleTradeItemClick(trade.trade_id)}>
            <div>
              <TradeStatus>{trade.keeper_status ? '맡아줬어요' : '보관했어요'}</TradeStatus>
              <div>
                <TradeTitle>{trade.product_name}</TradeTitle>
                <TradeId>타조 {trade.trade_id}</TradeId>
              </div>
            </div>
            <TradeInfo>
              {trade.post_address} | {trade.start_date}~
              {
                new Date(
                  new Date(trade.start_date).getTime() + trade.storage_period * 24 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split('T')[0]
              }
            </TradeInfo>
            <TradeAmount>총 {trade.trade_price.toLocaleString()}원</TradeAmount>
          </TradeCard>
        ))}
      </div>
    </Container>
  );
};

export default MyTrade;
