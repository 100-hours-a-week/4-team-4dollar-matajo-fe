import React, { useState } from 'react';
import styled from 'styled-components';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  errorRed: '#FF0000',
  textDark: '#555555',
  textGray: '#868686',
  white: '#FFFFFF',
};

// 모달 배경 (반투명 배경)
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

// 모달 컨테이너
const ModalContainer = styled.div`
  width: 300px;
  background: white;
  border-radius: 10.25px;
  padding: 20px;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

// 닫기 버튼
const CloseButton = styled.div`
  width: 24px;
  height: 24px;
  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  transform: rotate(-45deg);

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: #222222;
  }

  &::before {
    width: 24px;
    height: 2px;
    top: 11px;
    left: 0;
  }

  &::after {
    width: 2px;
    height: 24px;
    top: 0;
    left: 11px;
  }
`;

// 제목
const Title = styled.h2`
  color: ${THEME.primary};
  font-size: 20px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.02px;
  margin-bottom: 20px;
`;

// 레이블
const Label = styled.div`
  color: ${THEME.textDark};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.01px;
  margin-bottom: 5px;
`;

// 에러 헬퍼 텍스트
const HelperText = styled.div`
  color: ${THEME.errorRed};
  font-size: 8px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.01px;
  margin-bottom: 5px;
`;

// 입력 필드
const Input = styled.input`
  width: 280px;
  height: 24px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  padding: 0 10px;
  margin-bottom: 10px;
  font-size: 12px;
  font-family: 'Noto Sans KR';

  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 태그 컨테이너
const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 10px 0;
`;

// 태그 버튼
const TagButton = styled.button<{ isSelected: boolean }>`
  height: 24.85px;
  padding: 0 10px;
  border-radius: 31px;
  border: 0.5px solid ${props => (props.isSelected ? THEME.primary : THEME.textGray)};
  background: ${props => (props.isSelected ? THEME.primary : 'transparent')};
  color: ${props => (props.isSelected ? THEME.white : THEME.textGray)};
  font-size: 11px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  white-space: nowrap;
  cursor: pointer;
`;

// 날짜 입력 컨테이너
const DateInputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
`;

// 날짜 입력 필드
const DateInput = styled.input`
  width: 116px;
  height: 24px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  padding: 0 10px;
  font-size: 10px;
  color: ${THEME.textDark};
  font-family: 'Noto Sans KR';

  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 텍스트가 있는 날짜 컨테이너
const DateWithText = styled.div`
  width: 116px;
  height: 24px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: ${THEME.textDark};
  font-family: 'Noto Sans KR';
`;

// 가격 입력 컨테이너
const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

// 가격 입력 필드
const PriceInput = styled.input`
  width: 264px;
  height: 24px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  padding: 0 10px;
  font-size: 10px;
  font-family: 'Noto Sans KR';

  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 원 텍스트
const WonText = styled.span`
  color: ${THEME.textDark};
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.01px;
  margin-left: 5px;
`;

// 완료 버튼
const CompleteButton = styled.button`
  width: 116px;
  height: 33px;
  background: ${THEME.primary};
  border-radius: 15px;
  border: none;
  color: white;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: pointer;
  margin-top: 10px;
  float: right;
`;

// 아이템 유형 옵션
const itemTypes = ['식물', '전자기기', '가전', '스포츠', '식품', '의류', '서적', '취미', '가구'];

interface TradeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: TradeData) => void;
}

export interface TradeData {
  itemName: string;
  itemTypes: string[];
  startDate: string;
  endDate: string;
  price: number;
}

const TradeConfirmModal: React.FC<TradeConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  // 폼 상태 관리
  const [itemName, setItemName] = useState('');
  const [selectedItemTypes, setSelectedItemTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('2025.00.00');
  const [endDate, setEndDate] = useState('2025.00.00');
  const [price, setPrice] = useState('10000');

  // 유효성 검사 상태
  const [errors, setErrors] = useState({
    itemName: false,
    itemTypes: false,
    dates: false,
    price: false,
  });

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 태그 토글 핸들러
  const toggleItemType = (itemType: string) => {
    setSelectedItemTypes(prev =>
      prev.includes(itemType) ? prev.filter(type => type !== itemType) : [...prev, itemType],
    );
    // 에러 상태 업데이트
    if (errors.itemTypes) {
      setErrors(prev => ({ ...prev, itemTypes: false }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 유효성 검사
    const newErrors = {
      itemName: !itemName.trim(),
      itemTypes: selectedItemTypes.length === 0,
      dates: !startDate || !endDate,
      price: !price || isNaN(Number(price)) || Number(price) <= 0,
    };

    setErrors(newErrors);

    // 에러가 있으면 제출 중단
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    // 데이터 전송
    onConfirm({
      itemName,
      itemTypes: selectedItemTypes,
      startDate,
      endDate,
      price: Number(price),
    });

    // 모달 닫기
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} />

        <Title>거래 정보 작성</Title>

        {/* 물건 이름 입력 */}
        <Label>물건의 이름을 작성해주세요</Label>
        {errors.itemName && <HelperText>헬퍼텍스트입니다</HelperText>}
        <Input
          type="text"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          placeholder="물건 이름을 입력해주세요"
        />

        {/* 물건 유형 선택 */}
        <Label>물건의 유형을 선택해주세요</Label>
        {errors.itemTypes && <HelperText>헬퍼텍스트입니다</HelperText>}
        <TagContainer>
          {itemTypes.map(type => (
            <TagButton
              key={type}
              isSelected={selectedItemTypes.includes(type)}
              onClick={() => toggleItemType(type)}
            >
              {type}
            </TagButton>
          ))}
        </TagContainer>

        {/* 보관 기간 설정 */}
        <Label>보관 기간을 설정해주세요</Label>
        {errors.dates && <HelperText>헬퍼텍스트입니다</HelperText>}
        <DateInputContainer>
          <DateInput
            type="text"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            placeholder="YYYY.MM.DD"
          />
          <DateInput
            type="text"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            placeholder="YYYY.MM.DD"
          />
        </DateInputContainer>

        {/* 거래 가격 설정 */}
        <Label>최종 가격을 작성해주세요</Label>
        {errors.price && <HelperText>헬퍼텍스트입니다</HelperText>}
        <PriceContainer>
          <PriceInput
            type="text"
            value={price}
            onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <WonText>원</WonText>
        </PriceContainer>

        {/* 완료 버튼 */}
        <CompleteButton onClick={handleSubmit}>작성 완료</CompleteButton>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TradeConfirmModal;
