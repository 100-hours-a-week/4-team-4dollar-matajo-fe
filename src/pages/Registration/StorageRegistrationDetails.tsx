import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import { convertTagsToStrings } from '../../services/domain/tag/TagMappingService';
import { DaumAddressData } from '../../services/KakaoMapService';

const RegistrationContainer = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #f5f5ff;
  padding: 0;
  position: relative;
`;

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  background: '#F5F5FF',
  lightGray: '#EFEFEF',
  darkText: '#464646',
  redText: '#FF5050',
  grayText: '#868686',
  borderColor: '#D9D9D9',
  white: '#FFFFFF',
  black: '#000000',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  height: calc(100vh - 166px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 106px;
  padding-top: 47px; /* 헤더 높이만큼 패딩 */
`;

// 프로그레스 바 컨테이너
const ProgressContainer = styled.div`
  margin: 20px 22px;
  position: relative;
`;

// 프로그레스 배경
const ProgressBackground = styled.div`
  width: 332px;
  height: 12px;
  background: ${THEME.lightGray};
  border-radius: 7px;
`;

// 프로그레스 완료 부분
const ProgressFill = styled.div`
  width: 232px; /* 2/3 진행 */
  height: 12px;
  background: ${THEME.primary};
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
`;

// 프로그레스 텍스트
const ProgressText = styled.span`
  position: absolute;
  right: 0;
  top: -15px;
  color: ${THEME.primary};
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  letter-spacing: 0.25px;
`;

// 섹션 제목
const SectionTitle = styled.h3`
  color: ${THEME.black};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  margin: 30px 0 15px 25px;
`;

// 옵션 그룹 컨테이너
const OptionGroupContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 0 15px;
  gap: 10px;
`;

// 옵션 버튼 (위치 선택)
const LocationOptionButton = styled.button<{ isSelected: boolean }>`
  width: 163px;
  height: 47px;
  border-radius: 10px;
  border: 1px solid ${props => (props.isSelected ? THEME.primary : THEME.borderColor)};
  background: ${props => (props.isSelected ? THEME.background : THEME.white)};
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
const LocationOptionText = styled.span`
  color: ${THEME.grayText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
`;

// 태그 버튼
const TagButton = styled.button<{ isSelected: boolean }>`
  height: 37px;
  padding: 0 15px;
  border-radius: 31px;
  border: 0.5px solid ${props => (props.isSelected ? THEME.primary : THEME.grayText)};
  background: ${props => (props.isSelected ? THEME.background : THEME.white)};
  color: ${props => (props.isSelected ? THEME.primary : THEME.grayText)};
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  white-space: nowrap;
  cursor: pointer;
`;

// 다음 버튼
const NextButton = styled.button`
  width: 349px;
  height: 47px;
  position: relative;
  left: 13px;
  margin-top: 30px;
  background: ${THEME.primary};
  border-radius: 15px;
  border: none;
  color: ${THEME.white};
  font-size: 15px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  cursor: pointer;
`;

// 아이템 유형 옵션
const itemTypes = ['식물', '전자기기', '가전', '스포츠', '식품', '의류', '서적', '취미', '가구'];

// 보관 방식 옵션
const storageTypes = ['냉장보관', '냉동보관', '상온보관'];

// 보관 기간 옵션
const durationOptions = ['일주일 이내', '한달 이내', '3개월 이상'];

// 이전 단계에서 전달받는 데이터 타입 정의
interface Step1FormData {
  postTitle: string;
  postContent: string;
  postAddressData?: DaumAddressData; // DaumAddressData 타입 추가
  preferPrice: string;
}

const Registration2: React.FC = () => {
  // 라우터 관련 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계에서 전달받은 데이터
  const [prevFormData, setPrevFormData] = useState<Step1FormData | null>(null);

  // 폼 상태 관리
  const [storageLocation, setStorageLocation] = useState<'실내' | '실외' | ''>('');
  const [selectedItemTypes, setSelectedItemTypes] = useState<string[]>([]);
  const [selectedStorageTypes, setSelectedStorageTypes] = useState<string[]>([]);
  const [selectedDurationOptions, setSelectedDurationOptions] = useState<string[]>([]);
  const [isValuableSelected, setIsValuableSelected] = useState(false);

  // 첫 렌더링 체크 (useEffect 첫 실행시 저장 방지)
  const [isInitialRender, setIsInitialRender] = useState(true);

  // 이전 단계 데이터 로드
  useEffect(() => {
    if (location.state) {
      setPrevFormData(location.state as Step1FormData);
      console.log('이전 단계 데이터 로드됨:', location.state);
    }
  }, [location.state]);

  // 폼 데이터 불러오기 (로컬 스토리지)
  useEffect(() => {
    const savedData = localStorage.getItem('storage_register_details');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setStorageLocation(parsedData.storageLocation || '');
        setSelectedItemTypes(parsedData.selectedItemTypes || []);
        setSelectedStorageTypes(parsedData.selectedStorageTypes || []);
        setSelectedDurationOptions(parsedData.selectedDurationOptions || []);
        setIsValuableSelected(parsedData.isValuableSelected || false);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }

    // 초기 렌더링 완료 표시
    setIsInitialRender(false);
  }, []);

  // 상태 변경시 로컬 스토리지에 저장
  useEffect(() => {
    // 초기 렌더링 시에는 저장하지 않음
    if (isInitialRender) return;

    saveToLocalStorage();
  }, [
    storageLocation,
    selectedItemTypes,
    selectedStorageTypes,
    selectedDurationOptions,
    isValuableSelected,
  ]);

  // 로컬스토리지에 데이터 저장하는 함수
  const saveToLocalStorage = () => {
    const dataToSave = {
      storageLocation,
      selectedItemTypes,
      selectedStorageTypes,
      selectedDurationOptions,
      isValuableSelected,
    };

    localStorage.setItem('storage_register_details', JSON.stringify(dataToSave));
  };

  // 위치 선택 핸들러
  const handleLocationSelect = (locationType: '실내' | '실외') => {
    setStorageLocation(locationType);
    // useState는 비동기적으로 동작하므로 saveToLocalStorage를 여기서 호출하지 않음
    // useEffect에서 처리됨
  };

  // 아이템 유형 토글 핸들러
  const toggleItemType = (itemType: string) => {
    setSelectedItemTypes(prev =>
      prev.includes(itemType) ? prev.filter(type => type !== itemType) : [...prev, itemType],
    );
    // useEffect에서 처리됨
  };

  // 보관 방식 토글 핸들러
  const toggleStorageType = (storageType: string) => {
    setSelectedStorageTypes(prev =>
      prev.includes(storageType)
        ? prev.filter(type => type !== storageType)
        : [...prev, storageType],
    );
    // useEffect에서 처리됨
  };

  // 보관 기간 토글 핸들러
  const toggleDuration = (duration: string) => {
    setSelectedDurationOptions(prev =>
      prev.includes(duration) ? prev.filter(d => d !== duration) : [...prev, duration],
    );
    // useEffect에서 처리됨
  };

  // 귀중품 토글 핸들러
  const toggleValuable = () => {
    setIsValuableSelected(prev => !prev);
    // useEffect에서 처리됨
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    // 변경 사항은 로컬 스토리지에 자동 저장 상태이므로 바로 이전 페이지로 이동
    navigate('/storage/register');
  };

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 필수 입력값 검증
    if (!storageLocation) {
      alert('보관 위치를 선택해주세요.');
      return;
    }

    if (selectedItemTypes.length === 0) {
      alert('물건 유형을 하나 이상 선택해주세요.');
      return;
    }

    if (selectedStorageTypes.length === 0) {
      alert('보관 방식을 하나 이상 선택해주세요.');
      return;
    }

    if (selectedDurationOptions.length === 0) {
      alert('보관 기간을 하나 이상 선택해주세요.');
      return;
    }

    // 태그 문자열 리스트로 변환
    const tagStrings = convertTagsToStrings({
      storageLocation,
      selectedItemTypes,
      selectedStorageTypes,
      selectedDurationOptions,
      isValuableSelected,
    });

    // 이전 단계 데이터와 현재 단계 데이터 병합
    const step2Data = {
      storageLocation,
      selectedItemTypes,
      selectedStorageTypes,
      selectedDurationOptions,
      isValuableSelected,
      postTags: tagStrings, // 문자열 태그 배열로 저장
    };

    // 모든 단계 데이터 통합
    const combinedData = {
      ...prevFormData,
      ...step2Data,
    };

    // 다음 단계로 이동
    console.log('다음 단계로 이동, 통합 데이터:', combinedData);
    console.log('태그 문자열 배열:', tagStrings);
    navigate('/storage/register/images', { state: combinedData });
  };

  return (
    <>
      {/* 상단 헤더 */}
      <Header title="보관소 등록" showBackButton={true} onBack={handleBack} />

      <RegistrationContainer>
        <Container>
          {/* 프로그레스 바 */}
          <ProgressContainer>
            <ProgressBackground>
              <ProgressFill />
            </ProgressBackground>
            <ProgressText>2/3</ProgressText>
          </ProgressContainer>

          {/* 보관 위치 선택 */}
          <SectionTitle>보관 위치</SectionTitle>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            <LocationOptionButton
              isSelected={storageLocation === '실내'}
              onClick={() => handleLocationSelect('실내')}
            >
              <IconContainer>
                <img src="https://placehold.co/24x24" alt="실내 아이콘" />
              </IconContainer>
              <LocationOptionText>실내</LocationOptionText>
            </LocationOptionButton>
            <LocationOptionButton
              isSelected={storageLocation === '실외'}
              onClick={() => handleLocationSelect('실외')}
            >
              <IconContainer>
                <img src="https://placehold.co/21x21" alt="실외 아이콘" />
              </IconContainer>
              <LocationOptionText>실외</LocationOptionText>
            </LocationOptionButton>
          </div>

          {/* 물건 유형 선택 */}
          <SectionTitle>물건 유형</SectionTitle>
          <OptionGroupContainer>
            {itemTypes.map(itemType => (
              <TagButton
                key={itemType}
                isSelected={selectedItemTypes.includes(itemType)}
                onClick={() => toggleItemType(itemType)}
              >
                {itemType}
              </TagButton>
            ))}
          </OptionGroupContainer>

          {/* 보관 방식 선택 */}
          <SectionTitle>보관 방식</SectionTitle>
          <OptionGroupContainer>
            {storageTypes.map(storageType => (
              <TagButton
                key={storageType}
                isSelected={selectedStorageTypes.includes(storageType)}
                onClick={() => toggleStorageType(storageType)}
              >
                {storageType}
              </TagButton>
            ))}
          </OptionGroupContainer>

          {/* 보관 기간 선택 */}
          <SectionTitle>보관 기간</SectionTitle>
          <OptionGroupContainer>
            {durationOptions.map(duration => (
              <TagButton
                key={duration}
                isSelected={selectedDurationOptions.includes(duration)}
                onClick={() => toggleDuration(duration)}
              >
                {duration}
              </TagButton>
            ))}
          </OptionGroupContainer>

          {/* 귀중품 선택 */}
          <SectionTitle>귀중품</SectionTitle>
          <OptionGroupContainer>
            <TagButton isSelected={isValuableSelected} onClick={toggleValuable}>
              귀중품
            </TagButton>
          </OptionGroupContainer>

          {/* 다음 버튼 */}
          <NextButton onClick={handleSubmit}>다음</NextButton>
        </Container>
      </RegistrationContainer>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </>
  );
};

export default Registration2;
