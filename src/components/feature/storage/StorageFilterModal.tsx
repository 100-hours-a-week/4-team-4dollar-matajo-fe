import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#8966EF',
  background: '#FFFFFF',
  tagActive: 'rgba(58, 0, 229, 0.60)',
  tagBorder: '#868686',
  textDark: '#000000',
  textGray: '#868686',
  buttonBorder: 'rgba(137, 102, 239, 0.20)',
};

// 모달 컨테이너
const ModalContainer = styled.div`
  width: 375px;
  max-height: 640px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${THEME.background};
  border-radius: 10px;
  z-index: 1000;
  padding-bottom: 70px; // 하단 버튼 영역 높이
  overflow-y: auto;
`;

// 모달 오버레이 (배경)
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

// 모달 헤더
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-left: 130px;
  border-bottom: 1px solid #f0f0f0;
`;

// 모달 제목
const ModalTitle = styled.h2`
  color: ${THEME.textDark};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 900;
  margin: 0;
  align-items: center;
`;

// 닫기 버튼
const CloseButton = styled.div`
  width: 24px;
  height: 24px;
  cursor: pointer;
  transform: rotate(-45deg);
  position: relative;

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

// 모달 컨텐츠
const ModalContent = styled.div`
  padding: 10px 10px;
`;

// 섹션 제목
const SectionTitle = styled.h3`
  color: ${THEME.textDark};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  margin: 20px 0 15px 0;
`;

// 태그 컨테이너
const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
`;

// 태그 버튼
const TagButton = styled.button<{ isSelected: boolean }>`
  height: 37px;
  padding: 0 15px;
  border-radius: 31px;
  border: 0.5px solid ${props => (props.isSelected ? THEME.primary : THEME.tagBorder)};
  background: ${props => (props.isSelected ? THEME.tagActive : 'transparent')};
  color: ${props => (props.isSelected ? 'white' : THEME.textGray)};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  white-space: nowrap;
  cursor: pointer;
`;

// 위치 선택 컨테이너
const LocationContainer = styled.div`
  display: flex;
  gap: 14px;
  margin-bottom: 20px;
`;

// 위치 옵션 버튼
const LocationOptionButton = styled.button<{ isSelected: boolean }>`
  width: 163px;
  height: 47px;
  border-radius: 10px;
  border: 1px solid ${props => (props.isSelected ? THEME.primary : '#D9D9D9')};
  background: ${props => (props.isSelected ? THEME.background : THEME.background)};
  display: flex;
  align-items: center;
  padding-left: 15px;
  position: relative;
  cursor: pointer;
`;

// 아이콘 이미지 컨테이너
const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 위치 옵션 텍스트
const LocationOptionText = styled.span<{ isSelected: boolean }>`
  color: ${props => (props.isSelected ? THEME.textDark : THEME.textGray)};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
`;

// 하단 버튼 영역
const ButtonContainer = styled.div`
  width: 355px;
  height: 50px;
  position: absolute;
  bottom: 0;
  left: 0;
  background: white;
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
  border-top: 1px solid rgba(136, 139, 144, 0.2);
`;

// 초기화 버튼
const ResetButton = styled.button`
  width: 100px;
  height: 49px;
  background: white;
  border-radius: 11px;
  border: 1px solid ${THEME.buttonBorder};
  color: ${THEME.textDark};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  cursor: pointer;
`;

// 필터링 결과 보기 버튼
const ApplyButton = styled.button`
  width: 240px;
  height: 49px;
  background: ${THEME.primary};
  border-radius: 11px;
  border: none;
  color: white;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  cursor: pointer;
`;

// 필터 유형 정의
type FilterType = '전체' | '보관위치' | '보관방식' | '물건유형' | '보관기간' | '귀중품';

// 필터 옵션 타입 정의
export interface FilterOptions {
  storageLocation: '실내' | '실외' | '';
  itemTypes: string[];
  storageTypes: string[];
  durationOptions: string[];
  isValuableSelected: boolean;
}

interface StorageFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilter: (options: FilterOptions) => void;
  initialFilters?: FilterOptions;
  currentFilter?: FilterType; // 현재 선택된 필터 카테고리
}

const StorageFilterModal: React.FC<StorageFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilter,
  initialFilters,
  currentFilter = '전체',
}) => {
  // 초기 필터 상태 설정
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      storageLocation: '',
      itemTypes: [],
      storageTypes: [],
      durationOptions: [],
      isValuableSelected: false,
    },
  );

  // initialFilters가 변경될 때 filters 상태 업데이트
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // 모달이 열릴 때 currentFilter에 따라 해당 섹션으로 스크롤
  useEffect(() => {
    if (isOpen && currentFilter !== '전체') {
      const sectionElement = document.getElementById(`section-${currentFilter}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isOpen, currentFilter]);

  // 아이템 유형 옵션
  const itemTypes = ['식물', '전자기기', '가전', '스포츠', '식품', '의류', '서적', '취미', '가구'];

  // 보관 방식 옵션
  const storageTypes = ['상온보관', '냉장보관', '냉동보관'];

  // 보관 기간 옵션
  const durationOptions = ['일주일 이내', '한달 이내', '3개월 이상'];

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  // 위치 선택 핸들러
  const handleLocationSelect = (location: '실내' | '실외') => {
    setFilters(prev => ({
      ...prev,
      storageLocation: prev.storageLocation === location ? '' : location,
    }));
  };

  // 아이템 유형 토글 핸들러
  const toggleItemType = (itemType: string) => {
    setFilters(prev => ({
      ...prev,
      itemTypes: prev.itemTypes.includes(itemType)
        ? prev.itemTypes.filter(type => type !== itemType)
        : [...prev.itemTypes, itemType],
    }));
  };

  // 보관 방식 토글 핸들러
  const toggleStorageType = (storageType: string) => {
    setFilters(prev => ({
      ...prev,
      storageTypes: prev.storageTypes.includes(storageType)
        ? prev.storageTypes.filter(type => type !== storageType)
        : [...prev.storageTypes, storageType],
    }));
  };

  // 보관 기간 토글 핸들러
  const toggleDuration = (duration: string) => {
    setFilters(prev => ({
      ...prev,
      durationOptions: prev.durationOptions.includes(duration)
        ? prev.durationOptions.filter(d => d !== duration)
        : [...prev.durationOptions, duration],
    }));
  };

  // 귀중품 토글 핸들러
  const toggleValuable = () => {
    setFilters(prev => ({
      ...prev,
      isValuableSelected: !prev.isValuableSelected,
    }));
  };

  // 필터 초기화 핸들러
  const handleReset = () => {
    setFilters({
      storageLocation: '',
      itemTypes: [],
      storageTypes: [],
      durationOptions: [],
      isValuableSelected: false,
    });
  };

  // 필터 적용 핸들러
  const handleApplyFilter = () => {
    onApplyFilter(filters);
  };

  // 모달 외부 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 현재 선택된 필터에 맞는 모달 타이틀 생성
  const getModalTitle = () => {
    switch (currentFilter) {
      case '보관위치':
        return '보관 위치';
      case '보관방식':
        return '보관 방식';
      case '물건유형':
        return '물건 유형';
      case '보관기간':
        return '보관 기간';
      case '귀중품':
        return '귀중품';
      default:
        return '필터 선택';
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>보관 방식</ModalTitle>
          <CloseButton onClick={onClose} />
        </ModalHeader>

        <ModalContent>
          {/* 보관 위치 선택 */}
          <SectionTitle>보관 위치</SectionTitle>
          <LocationContainer>
            <LocationOptionButton
              isSelected={filters.storageLocation === '실내'}
              onClick={() => handleLocationSelect('실내')}
            >
              <IconContainer>
                <img src="https://placehold.co/24x24" alt="실내 아이콘" />
              </IconContainer>
              <LocationOptionText isSelected={filters.storageLocation === '실내'}>
                실내
              </LocationOptionText>
            </LocationOptionButton>
            <LocationOptionButton
              isSelected={filters.storageLocation === '실외'}
              onClick={() => handleLocationSelect('실외')}
            >
              <IconContainer>
                <img src="https://placehold.co/21x21" alt="실외 아이콘" />
              </IconContainer>
              <LocationOptionText isSelected={filters.storageLocation === '실외'}>
                실외
              </LocationOptionText>
            </LocationOptionButton>
          </LocationContainer>

          {/* 물건 유형 선택 */}
          <SectionTitle>물건 유형</SectionTitle>
          <TagContainer>
            {itemTypes.map(itemType => (
              <TagButton
                key={itemType}
                isSelected={filters.itemTypes.includes(itemType)}
                onClick={() => toggleItemType(itemType)}
              >
                {itemType}
              </TagButton>
            ))}
          </TagContainer>

          {/* 보관 방식 선택 */}
          <SectionTitle>보관 방식</SectionTitle>
          <TagContainer>
            {storageTypes.map(storageType => (
              <TagButton
                key={storageType}
                isSelected={filters.storageTypes.includes(storageType)}
                onClick={() => toggleStorageType(storageType)}
              >
                {storageType}
              </TagButton>
            ))}
          </TagContainer>

          {/* 보관 기간 선택 */}
          <SectionTitle>보관 기간</SectionTitle>
          <TagContainer>
            {durationOptions.map(duration => (
              <TagButton
                key={duration}
                isSelected={filters.durationOptions.includes(duration)}
                onClick={() => toggleDuration(duration)}
              >
                {duration}
              </TagButton>
            ))}
          </TagContainer>

          {/* 귀중품 선택 */}
          <SectionTitle>귀중품</SectionTitle>
          <TagContainer>
            <TagButton isSelected={filters.isValuableSelected} onClick={toggleValuable}>
              귀중품
            </TagButton>
          </TagContainer>
        </ModalContent>

        {/* 하단 버튼 */}
        <ButtonContainer>
          <ResetButton onClick={handleReset}>초기화</ResetButton>
          <ApplyButton onClick={handleApplyFilter}>필터링 결과 보기</ApplyButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default StorageFilterModal;
