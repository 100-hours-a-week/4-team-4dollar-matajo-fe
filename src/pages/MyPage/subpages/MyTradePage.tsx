import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getMyTrades } from '../../../services/api/modules/trades';
import { TradeItem } from '../../../services/api/modules/trades';
import { ROUTES } from '../../../constants/routes';

const Container = styled.div`
  width: 375px;
  height: 812px;
  position: relative;
  background: white;
  overflow: hidden;
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
  width: 326px;
  height: 128px;
  left: 23px;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 1px #e0e0e0 solid;
  padding: 16px;
  margin-bottom: 20px;
  position: relative;
`;

const TradeTitle = styled.span`
  color: #616161;
  font-size: 18px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.02px;
`;

const TradeStatus = styled.span`
  color: rgba(56.26, 53.49, 252.61, 0.8);
  font-size: 14px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.01px;
  margin-left: 8px;
`;

const TradeId = styled.span`
  color: #c0bdbd;
  font-size: 10px;
  font-family: Noto Sans KR;
  font-weight: 700;
  letter-spacing: 0.01px;
  display: block;
  margin-top: 4px;
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
  font-size: 16px;
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
      <StatusBar />
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.7988 20.6092C16.2848 21.0701 15.4945 21.0271 15.0336 20.5131C12.4485 17.6301 10.7578 16.0397 7.98988 13.4359C7.79646 13.2539 7.59778 13.067 7.39317 12.8744C7.13362 12.6301 6.99074 12.2865 7.00047 11.9302C7.01019 11.5739 7.17158 11.2386 7.44406 11.0088C11.0727 7.94809 12.9883 6.27701 15.696 3.39422C16.1687 2.89102 16.9597 2.86625 17.4629 3.33888C17.9661 3.81152 17.9909 4.60259 17.5183 5.10578C15.5067 7.24742 13.0846 10.6182 10.9997 12.4286C12.9543 14.2819 14.7665 16.4704 16.8949 18.8441C17.3558 19.3581 17.3128 20.1483 16.7988 20.6092Z"
              fill="#212121"
            />
          </svg>
        </BackButton>
        <Title>내 거래 내역</Title>
      </Header>

      <div style={{ marginTop: '87px', marginBottom: '76px' }}>
        {trades.map(trade => (
          <TradeCard key={trade.trade_id} onClick={() => handleTradeItemClick(trade.trade_id)}>
            <div>
              <TradeTitle>{trade.product_name}</TradeTitle>
              <TradeStatus>{trade.keeper_status ? '맡아줬어요' : '보관했어요'}</TradeStatus>
            </div>
            <TradeId>타조 {trade.trade_id}</TradeId>
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

      <BottomNav>
        <NavItem>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.0028 17.8391C17.4075 17.8391 18.5508 18.9743 18.5508 20.3696V23.9583C18.5508 24.2581 18.7912 24.4985 19.0992 24.5055H21.3228C23.0752 24.5055 24.4997 23.0985 24.4997 21.3695V11.1915C24.4915 10.5965 24.208 10.0365 23.7215 9.66431L16.0297 3.52997C14.9972 2.71214 13.5528 2.71214 12.5168 3.53231L4.87751 9.66197C4.37234 10.0458 4.08884 10.6058 4.08301 11.2113V21.3695C4.08301 23.0985 5.50751 24.5055 7.25984 24.5055H9.50451C9.82067 24.5055 10.0773 24.2546 10.0773 23.9466C10.0773 23.879 10.0855 23.8113 10.0995 23.7471V20.3696C10.0995 18.9825 11.2358 17.8485 12.63 17.8391H16.0028Z"
              fill="#61646B"
            />
          </svg>
          <NavText active>홈</NavText>
        </NavItem>
        <NavItem>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.6952 4.08398C8.39501 4.08398 4.08301 8.39482 4.08301 13.695C4.08301 18.9952 8.39501 23.3071 13.6952 23.3071C18.9942 23.3071 23.3062 18.9952 23.3062 13.695C23.3062 8.39482 18.9942 4.08398 13.6952 4.08398Z"
              fill="#61646B"
            />
          </svg>
          <NavText>게시판</NavText>
        </NavItem>
        <NavItem>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.2882 2.91602C10.2107 2.91602 7.36868 6.11035 7.36868 8.97685C7.36868 11.4023 6.69552 12.5235 6.10052 13.5128C5.62335 14.3074 5.24652 14.935 5.24652 16.2989C5.44135 18.4992 6.89385 19.6553 14.2882 19.6553C21.6417 19.6553 23.1397 18.4479 23.3333 16.223C23.3298 14.935 22.953 14.3074 22.4758 13.5128C21.8808 12.5235 21.2077 11.4023 21.2077 8.97685C21.2077 6.11035 18.3657 2.91602 14.2882 2.91602Z"
              fill="#61646B"
            />
          </svg>
          <NavText>채팅</NavText>
        </NavItem>
        <NavItem>
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.9082 18.6621C8.93699 18.6621 6.41699 19.5161 6.41699 21.2019C6.41699 22.9029 8.93699 23.7651 13.9082 23.7651C18.8782 23.7651 21.397 22.9111 21.397 21.2253C21.397 19.5243 18.8782 18.6621 13.9082 18.6621Z"
              fill="#3835FD"
            />
          </svg>
          <NavText active>마이페이지</NavText>
        </NavItem>
      </BottomNav>
    </Container>
  );
};

export default MyTrade;
