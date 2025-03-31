import React from 'react';
import styled from 'styled-components';
import { TradeItem as TradeItemType } from '../../services/api/modules/trades';

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

interface TradeItemProps {
  trade: TradeItemType;
  onClick: () => void;
}

export const TradeItem: React.FC<TradeItemProps> = ({ trade, onClick }) => {
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
    <TradeItemCard onClick={onClick}>
      <TradeImage>
        <ImagePlaceholder>
          장소
          <br />
          이미지
        </ImagePlaceholder>
      </TradeImage>

      <TradeInfo>
        <StatusTag isPublic={trade.keeper_status}>
          {trade.keeper_status ? '공개' : '비공개'}
        </StatusTag>
        <TradeTitle>{trade.product_name}</TradeTitle>
        <TradeLocation>{trade.post_address}</TradeLocation>
      </TradeInfo>

      <ArrowIcon>{renderArrowIcon()}</ArrowIcon>
    </TradeItemCard>
  );
};
