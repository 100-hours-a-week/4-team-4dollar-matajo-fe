import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import { ROUTES } from '../../../constants/routes';
import { getMyStorages } from '../../../services/api/modules/storage';

// 스타일 상수
const THEME = {
  primary: '#3835FD',
  primaryLight: '#5E5CFD',
  tagBackground: '#F5F5F5',
  tagBlueText: 'rgba(56.26, 53.49, 252.61, 0.80)',
  tagGrayText: '#616161',
  textDark: '#616161',
  textGray: '#C0BDBD',
  borderColor: '#E0E0E0',
  white: '#FFFFFF',
  background: '#F5F5FF',
};

const Container = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: 100vh;
  background: white;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
`;

const HeaderBackground = styled.div`
  width: 100%;
  height: 47px;
  background: ${THEME.background};
  border-bottom: 1px solid #efeff0;
`;

const Content = styled.div`
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TradeItemCard = styled.div`
  width: 326px;
  height: 96px;
  margin: 8px 0;
  border-radius: 10px;
  border: 1px solid ${THEME.borderColor};
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

const TradeImage = styled.div`
  width: 69px;
  height: 66px;
  margin: 15px;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  color: ${THEME.textGray};
  text-align: center;
  line-height: 1.2;
`;

const StatusTag = styled.div<{ isPublic: boolean }>`
  display: inline-block;
  width: 45px;
  height: 17px;
  padding: 0 5px;
  background: transparent;
  color: ${props => (props.isPublic ? THEME.tagBlueText : THEME.tagGrayText)};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  border: 1px ${props => (props.isPublic ? THEME.tagBlueText : THEME.tagGrayText)} solid;
  border-radius: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
`;

const TradeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-right: 30px;
`;

const TradeTitle = styled.div`
  color: ${THEME.textDark};
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  margin-bottom: 4px;
`;

const TradeLocation = styled.div`
  color: ${THEME.textGray};
  font-size: 13px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
`;

const ArrowIcon = styled.div`
  position: absolute;
  right: 16px;
  width: 14px;
  height: 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${THEME.textGray};
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: red;
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${THEME.textGray};
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

interface StorageItem {
  trade_id: number;
  keeper_status: boolean;
  trade_name: string;
  user_id: number;
  post_address: string;
  trade_date: string;
  start_date: string;
  storage_period: number;
  trade_price: number;
}

interface MyPlaceProps {
  onBack?: () => void;
}

const MyPlace: React.FC<MyPlaceProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorages = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyStorages();
        console.log('내 보관소 목록:', data);
        setTrades(data);
      } catch (err) {
        console.error('내 보관소 목록 조회 실패:', err);
        setError('보관소 목록을 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    fetchStorages();
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/${ROUTES.MYPAGE}`);
    }
  };

  const handleTradeItemClick = (id: number) => {
    navigate(`/trade/${id}`);
    console.log(`거래 ${id} 클릭됨, 거래 내역 상세 페이지로 이동`);
  };

  const renderArrowIcon = () => (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.399932 17.1076L9.4541 9.85097L0.233178 2.80748L0.200439 0L13.0968 9.85097L0.433661 20L0.399932 17.1076Z"
        fill="#BBBBBB"
        fillOpacity="0.8"
      />
    </svg>
  );

  return (
    <Container>
      <Header title="내 보관소" showBackButton={true} onBack={handleBack} />
      <HeaderBackground />

      <Content>
        {loading ? (
          <LoadingContainer>보관소 목록을 불러오는 중...</LoadingContainer>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : trades.length === 0 ? (
          <NoDataMessage>등록된 보관소가 없습니다.</NoDataMessage>
        ) : (
          trades.map((storage, index) => (
            <TradeItemCard
              key={storage.trade_id}
              onClick={() => handleTradeItemClick(storage.trade_id)}
            >
              <TradeImage>
                {storage.trade_name && (
                  <ImagePlaceholder>
                    장소
                    <br />
                    이미지
                  </ImagePlaceholder>
                )}
              </TradeImage>

              <TradeInfo>
                <StatusTag isPublic={storage.keeper_status}>
                  {storage.keeper_status ? '공개' : '비공개'}
                </StatusTag>
                <TradeTitle>{storage.trade_name}</TradeTitle>
                <TradeLocation>{storage.post_address}</TradeLocation>
              </TradeInfo>

              <ArrowIcon>{renderArrowIcon()}</ArrowIcon>
            </TradeItemCard>
          ))
        )}
      </Content>

      <BottomNavigation activeTab="마이페이지" />
    </Container>
  );
};

export default MyPlace;
