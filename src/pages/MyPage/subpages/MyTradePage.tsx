import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getMyTrades, TradeItem as TradeItemType } from '../../../services/api/modules/trades';
import { TradeItem } from '../../../components/common/TradeItem';
import { ROUTES } from '../../../constants/routes';

const Content = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #616161;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const NoDataIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
`;

const MyTrade: React.FC = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<TradeItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await getMyTrades();
        setTrades(response || []);
      } catch (err: any) {
        console.error('거래 내역 조회 실패:', err);
        if (
          err.message === '인증 토큰이 없습니다.' ||
          err.message === '인증이 만료되었습니다. 다시 로그인해주세요.'
        ) {
          setError('로그인이 필요합니다. 다시 로그인해주세요.');
          navigate('/login');
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
      <Content>
        <div>로딩 중...</div>
      </Content>
    );
  }

  if (error) {
    return (
      <Content>
        <div>{error}</div>
      </Content>
    );
  }

  if (trades.length === 0) {
    return (
      <Content>
        <NoDataMessage>
          <NoDataIcon>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="#616161"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H16"
                stroke="#616161"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 16H12"
                stroke="#616161"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </NoDataIcon>
          아직 거래 내역이 없습니다
        </NoDataMessage>
      </Content>
    );
  }

  return (
    <Content>
      {trades.map(trade => (
        <TradeItem
          key={trade.trade_id}
          trade={trade}
          onClick={() => handleTradeItemClick(trade.trade_id)}
        />
      ))}
    </Content>
  );
};

export default MyTrade;
