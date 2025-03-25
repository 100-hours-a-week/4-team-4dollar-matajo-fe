import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale/ko';
import { format, differenceInDays } from 'date-fns';

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

// 태그 버튼 - 수정: 선택 로직을 단일 선택으로 변경
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
  margin: 10px 30px;
`;

// 스타일된 DatePicker 컨테이너
const StyledDatePickerContainer = styled.div`
  width: 116px;
  height: 24px;
  position: relative;

  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container {
    width: 100%;
  }

  input {
    width: 100%;
    height: 24px;
    border-radius: 15px;
    border: 0.5px solid ${THEME.primary};
    padding: 0 10px;
    font-size: 10px;
    color: ${THEME.textDark};
    font-family: 'Noto Sans KR';
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: ${THEME.primary};
    }
  }

  .react-datepicker {
    font-family: 'Noto Sans KR';
    font-size: 0.8rem;
  }

  .react-datepicker__day--selected {
    background-color: ${THEME.primary};
  }
`;

// 스토리지 기간 표시
const StoragePeriodDisplay = styled.div`
  margin: 5px 0 10px;
  color: ${THEME.textDark};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  text-align: right;
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
  category: string;
  startDate: string;
  endDate: string;
  storagePeriod: number;
  price: number;
}

const TradeConfirmModal: React.FC<TradeConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  // 기본 날짜 설정 (오늘부터 30일 후)
  const today = new Date();
  const defaultEndDate = new Date();
  defaultEndDate.setDate(today.getDate() + 30);

  // 폼 상태 관리
  const [itemName, setItemName] = useState('');
  // 수정: 단일 아이템 유형 선택을 위해 string[]에서 string으로 변경
  const [selectedItemType, setSelectedItemType] = useState<string>('');
  const [startDateObj, setStartDateObj] = useState<Date>(today);
  const [endDateObj, setEndDateObj] = useState<Date>(defaultEndDate);
  const [price, setPrice] = useState('10000');
  const [storagePeriod, setStoragePeriod] = useState(30);

  // 유효성 검사 상태
  const [errors, setErrors] = useState({
    itemName: false,
    itemType: false,
    dates: false,
    price: false,
  });

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 날짜가 변경될 때마다 보관 기간 계산
  const calculateStoragePeriod = (start: Date, end: Date) => {
    const days = differenceInDays(end, start);
    return Math.max(1, days); // 최소 1일
  };

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;

    setStartDateObj(date);
    // 종료일이 시작일보다 빠르면 종료일을 시작일로 설정
    if (date > endDateObj) {
      setEndDateObj(date);
    }
    // 보관 기간 업데이트
    setStoragePeriod(calculateStoragePeriod(date, endDateObj));
  };

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;

    // 시작일보다 빠른 날짜 선택 방지
    if (date < startDateObj) return;

    setEndDateObj(date);
    // 보관 기간 업데이트
    setStoragePeriod(calculateStoragePeriod(startDateObj, date));
  };

  // 태그 선택 핸들러 - 수정: 단일 선택으로 변경
  const selectItemType = (itemType: string) => {
    setSelectedItemType(itemType);
    // 에러 상태 업데이트
    if (errors.itemType) {
      setErrors(prev => ({ ...prev, itemType: false }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 유효성 검사
    const newErrors = {
      itemName: !itemName.trim(),
      itemType: !selectedItemType,
      dates: !startDateObj || !endDateObj,
      price: !price || isNaN(Number(price)) || Number(price) <= 0,
    };

    setErrors(newErrors);

    // 에러가 있으면 제출 중단
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    // 날짜 형식 변환 (YYYY-MM-DD)
    const formattedStartDate = format(startDateObj, 'yyyy-MM-dd');
    const formattedEndDate = format(endDateObj, 'yyyy-MM-dd');

    // 데이터 전송 - 단일 선택이지만 API 호환성을 위해 배열로 변환
    onConfirm({
      itemName,
      itemTypes: [selectedItemType], // 배열로 변환하여 전달
      category: selectedItemType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      storagePeriod: storagePeriod,
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
        {errors.itemName && <HelperText>물건 이름을 입력해주세요</HelperText>}
        <Input
          type="text"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          placeholder="물건 이름을 입력해주세요"
        />

        {/* 물건 유형 선택 - 수정: 단일 선택으로 변경 */}
        <Label>물건의 유형을 선택해주세요</Label>
        {errors.itemType && <HelperText>물건 유형을 선택해주세요</HelperText>}
        <TagContainer>
          {itemTypes.map(type => (
            <TagButton
              key={type}
              isSelected={selectedItemType === type}
              onClick={() => selectItemType(type)}
            >
              {type}
            </TagButton>
          ))}
        </TagContainer>

        {/* 보관 기간 설정 */}
        <Label>보관 기간을 설정해주세요</Label>
        {errors.dates && <HelperText>시작일과 종료일을 선택해주세요</HelperText>}
        <DateInputContainer>
          <StyledDatePickerContainer>
            <DatePicker
              selected={startDateObj}
              onChange={handleStartDateChange}
              dateFormat="yyyy-MM-dd"
              locale={ko}
              minDate={today}
              placeholderText="시작일"
            />
          </StyledDatePickerContainer>
          <StyledDatePickerContainer>
            <DatePicker
              selected={endDateObj}
              onChange={handleEndDateChange}
              dateFormat="yyyy-MM-dd"
              locale={ko}
              minDate={startDateObj}
              placeholderText="종료일"
            />
          </StyledDatePickerContainer>
        </DateInputContainer>

        {/* 보관 기간 표시 */}
        <StoragePeriodDisplay>총 보관 기간: {storagePeriod}일</StoragePeriodDisplay>

        {/* 거래 가격 설정 */}
        <Label>최종 가격을 작성해주세요</Label>
        {errors.price && <HelperText>유효한 가격을 입력해주세요</HelperText>}
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
