import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ko } from 'date-fns/locale/ko';
import { format, differenceInDays } from 'date-fns';
import Toast from '../../components/common/Toast';

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
  width: 260px;
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
  margin: 10px 5px;
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
    text-align: center;

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

// 로딩 인디케이터
const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid ${THEME.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// 로딩 버튼 컨테이너
const ButtonWithSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  float: right;
`;

interface TradeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: TradeData) => void;
  chatroomId: number;
}

export interface TradeData {
  itemName: string;
  itemTypes: string[];
  category: string;
  startDate: string;
  endDate: string;
  storagePeriod: number;
  price: number;
  // 서버 전송용 필드 추가
  product_name?: string;
  start_date?: string;
  trade_price?: number;
  message?: string;
}

const TradeConfirmModal: React.FC<TradeConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chatroomId,
}) => {
  const [itemName, setItemName] = useState<string>('');
  const [selectedItemType, setSelectedItemType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() + 7)),
  );
  const [storagePeriod, setStoragePeriod] = useState<number>(7);
  const [price, setPrice] = useState<string>('10000');
  const [message, setMessage] = useState<string>('');

  // 유효성 검사 상태
  const [itemNameError, setItemNameError] = useState<string>('');
  const [dateError, setDateError] = useState<string>('');
  const [priceError, setPriceError] = useState<string>('');

  // 로딩 상태
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 토스트 상태
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // 카테고리 목록
  const itemTypes = ['식물', '전자기기', '가전', '스포츠', '식품', '의류', '서적', '취미', '가구'];

  // 토스트 메시지 표시 함수
  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    // 3초 후 자동으로 숨김
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 보관 기간 계산
  const calculateStoragePeriod = (start: Date, end: Date) => {
    return differenceInDays(end, start) + 1; // 종료일도 포함
  };

  // 시작일 변경 핸들러
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      if (endDate && date > endDate) {
        setEndDate(date);
        setStoragePeriod(1);
      } else if (endDate) {
        setStoragePeriod(calculateStoragePeriod(date, endDate));
      }
      setDateError('');
    }
  };

  // 종료일 변경 핸들러
  const handleEndDateChange = (date: Date | null) => {
    if (date && startDate) {
      if (date < startDate) {
        setDateError('종료일은 시작일 이후여야 합니다');
        return;
      }
      setEndDate(date);
      setStoragePeriod(calculateStoragePeriod(startDate, date));
      setDateError('');
    }
  };

  // 카테고리 선택 핸들러
  const selectItemType = (itemType: string) => {
    setSelectedItemType(itemType === selectedItemType ? '' : itemType);
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    let isValid = true;

    // 상품명 검사
    if (!itemName.trim()) {
      setItemNameError('상품명을 입력해주세요');
      isValid = false;
    } else {
      setItemNameError('');
    }

    // 날짜 검사
    if (!startDate || !endDate) {
      setDateError('날짜를 모두 선택해주세요');
      isValid = false;
    } else if (endDate < startDate) {
      setDateError('종료일은 시작일 이후여야 합니다');
      isValid = false;
    } else {
      setDateError('');
    }

    // 가격 검사
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      setPriceError('유효한 가격을 입력해주세요');
      isValid = false;
    } else {
      setPriceError('');
    }

    return isValid;
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TradeData 형식으로 변환하여 콜백 호출
      const tradeData: TradeData = {
        itemName,
        itemTypes: selectedItemType ? [selectedItemType] : [],
        category: selectedItemType || '기타',
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : '',
        storagePeriod,
        price: Number(price),
      };

      // 성공 시 토스트 메시지 표시 및 콜백 호출
      displayToast('거래 정보가 등록되었습니다');
      onConfirm(tradeData);

      // 잠시 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('거래 정보 등록 오류:', error);
      displayToast('거래 정보 등록 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalOverlay>
        <ModalContainer>
          <Title>거래 정보 작성</Title>
          <CloseButton onClick={onClose} />

          <Label>보관할 물품</Label>
          <Input
            type="text"
            value={itemName}
            maxLength={15}
            onChange={e => {
              const newValue = e.target.value;
              setItemName(newValue);

              if (newValue.length > 15) {
                setItemNameError('보관할 물품은 최대 15글자까지 입력 가능합니다.');
              } else {
                setItemNameError('');
              }
            }}
            placeholder="물품명을 입력해주세요"
          />
          {itemNameError && <HelperText>{itemNameError}</HelperText>}

          <Label>물품 유형</Label>
          <TagContainer>
            {itemTypes.map(type => (
              <TagButton
                key={type}
                isSelected={type === selectedItemType}
                onClick={() => selectItemType(type)}
              >
                {type}
              </TagButton>
            ))}
          </TagContainer>

          <Label>보관 날짜</Label>
          <DateInputContainer>
            <StyledDatePickerContainer>
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                dateFormat="yyyy.MM.dd"
                locale={ko}
                minDate={new Date()}
              />
            </StyledDatePickerContainer>
            <span style={{ margin: '0 5px' }}>~</span>
            <StyledDatePickerContainer>
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                dateFormat="yyyy.MM.dd"
                locale={ko}
                minDate={startDate ? startDate : undefined}
              />
            </StyledDatePickerContainer>
          </DateInputContainer>
          {dateError && <HelperText>{dateError}</HelperText>}

          <StoragePeriodDisplay>보관 기간: {storagePeriod}일</StoragePeriodDisplay>

          <Label>보관 가격</Label>
          <PriceContainer>
            <PriceInput
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="가격을 입력해주세요"
            />
            <WonText>원</WonText>
          </PriceContainer>
          {priceError && <HelperText>{priceError}</HelperText>}

          {/* <Label>추가 메시지 (선택)</Label>
          <Input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="보관 시 참고할 내용이 있다면 입력해주세요"
          /> */}

          {isLoading ? (
            <ButtonWithSpinner>
              <LoadingSpinner />
              <CompleteButton disabled>처리 중...</CompleteButton>
            </ButtonWithSpinner>
          ) : (
            <CompleteButton onClick={handleSubmit}>완료</CompleteButton>
          )}
        </ModalContainer>
      </ModalOverlay>

      {/* 토스트 메시지 */}
      <Toast message={toastMessage} visible={showToast} onClose={() => setShowToast(false)} />
    </>
  );
};

export default TradeConfirmModal;
