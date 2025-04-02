import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Toast from '../../components/common/Toast';
import { ROUTES } from '../../constants/routes';
import { DaumAddressData } from '../../services/KakaoMapService';
import { convertTagsToStrings } from '../../services/domain/tag/TagMappingService';
import client from '../../services/api/client';
import type { AxiosError } from 'axios';

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

// 전체 페이지 레이아웃 컨테이너
const RegistrationContainer = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #f5f5ff;
  padding: 0;
  position: relative;
`;

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  height: calc(100vh - 166px);
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 106px;
  padding-top: 47px;
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
  width: 232px;
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

// 폼 데이터 타입 정의
interface FormData {
  postId: string;
  postAddress: string;
  postTitle: string;
  postContent: string;
  preferPrice: string;
  postAddressData?: DaumAddressData;
  storageLocation: '실내' | '실외' | '';
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
  postTags?: string[];
}

interface ErrorResponse {
  message?: string;
  success?: boolean;
}

// API 응답 타입 정의
interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    post_id: number;
    post_title: string;
    post_content: string;
    post_address: string;
    post_address_data: DaumAddressData;
    prefer_price: number;
    post_tags: string[];
  };
}

const EditStorageDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계에서 전달받은 데이터
  const previousData = location.state as FormData;

  // 폼 상태 관리
  const [formData, setFormData] = useState<FormData>({
    ...previousData,
    storageLocation: previousData?.storageLocation || '',
    selectedItemTypes: previousData?.selectedItemTypes || [],
    selectedStorageTypes: previousData?.selectedStorageTypes || [],
    selectedDurationOptions: previousData?.selectedDurationOptions || [],
    isValuableSelected: previousData?.isValuableSelected || false,
  });

  // 토스트 상태
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // API에서 데이터 가져오기
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        console.log('Fetching post data for ID:', id);

        const response = await client.get(`/api/posts/${id}`);

        console.log('API Response:', response.data);

        if (response.data.success) {
          const postData = response.data.data;

          // API 응답 데이터를 폼 데이터로 변환
          const newFormData: FormData = {
            postId: postData.post_id.toString(),
            postAddress: postData.post_address,
            postTitle: postData.post_title,
            postContent: postData.post_content,
            preferPrice: postData.prefer_price.toString(),
            postAddressData: postData.post_address_data,
            storageLocation: '', // 태그에서 추출
            selectedItemTypes: [], // 태그에서 추출
            selectedStorageTypes: [], // 태그에서 추출
            selectedDurationOptions: [], // 태그에서 추출
            isValuableSelected: false, // 태그에서 추출
            postTags: postData.post_tags,
          };

          // 태그 데이터 처리
          if (postData.post_tags && postData.post_tags.length > 0) {
            console.log('Processing tags:', postData.post_tags);
            const tags = postData.post_tags;

            // 보관 위치 태그 처리
            if (tags.includes('실내')) {
              newFormData.storageLocation = '실내';
            } else if (tags.includes('실외')) {
              newFormData.storageLocation = '실외';
            }

            // 물건 유형 태그 처리
            newFormData.selectedItemTypes = tags.filter((tag: string) => itemTypes.includes(tag));

            // 보관 방식 태그 처리
            newFormData.selectedStorageTypes = tags.filter((tag: string) =>
              storageTypes.includes(tag),
            );

            // 보관 기간 태그 처리
            newFormData.selectedDurationOptions = tags.filter((tag: string) =>
              durationOptions.includes(tag),
            );

            // 귀중품 태그 처리
            newFormData.isValuableSelected = tags.includes('귀중품');
          }

          console.log('Processed form data:', newFormData);
          setFormData(newFormData);
        } else {
          showToast(response.data.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
        const axiosError = error as AxiosError<ErrorResponse>;
        if (axiosError.response) {
          console.error('Error response:', axiosError.response.data);
          showToast(axiosError.response.data?.message || '데이터를 불러오는데 실패했습니다.');
        } else {
          showToast('데이터를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPostData();
    }
  }, [id]);

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('storage_edit_details');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
        }));
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  // 상태 변경시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('storage_edit_details', JSON.stringify(formData));
  }, [formData]);

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // 위치 선택 핸들러
  const handleLocationSelect = (locationType: '실내' | '실외') => {
    setFormData(prev => ({ ...prev, storageLocation: locationType }));
  };

  // 아이템 유형 토글 핸들러
  const toggleItemType = (itemType: string) => {
    setFormData(prev => ({
      ...prev,
      selectedItemTypes: prev.selectedItemTypes.includes(itemType)
        ? prev.selectedItemTypes.filter(type => type !== itemType)
        : [...prev.selectedItemTypes, itemType],
    }));
  };

  // 보관 방식 토글 핸들러
  const toggleStorageType = (storageType: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStorageTypes: prev.selectedStorageTypes.includes(storageType)
        ? prev.selectedStorageTypes.filter(type => type !== storageType)
        : [...prev.selectedStorageTypes, storageType],
    }));
  };

  // 보관 기간 토글 핸들러
  const toggleDuration = (duration: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDurationOptions: prev.selectedDurationOptions.includes(duration)
        ? prev.selectedDurationOptions.filter(d => d !== duration)
        : [...prev.selectedDurationOptions, duration],
    }));
  };

  // 귀중품 토글 핸들러
  const toggleValuable = () => {
    setFormData(prev => ({ ...prev, isValuableSelected: !prev.isValuableSelected }));
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(ROUTES.STORAGE_EDIT.replace(':id', id || ''));
  };

  // 다음 단계로 이동
  const handleNext = async () => {
    // 필수 입력값 검증
    if (!formData.storageLocation) {
      showToast('보관 위치를 선택해주세요.');
      return;
    }

    if (formData.selectedItemTypes.length === 0) {
      showToast('물건 유형을 하나 이상 선택해주세요.');
      return;
    }

    if (formData.selectedStorageTypes.length === 0) {
      showToast('보관 방식을 하나 이상 선택해주세요.');
      return;
    }

    if (formData.selectedDurationOptions.length === 0) {
      showToast('보관 기간을 하나 이상 선택해주세요.');
      return;
    }

    // 태그 문자열 리스트로 변환
    const tagStrings = convertTagsToStrings({
      storageLocation: formData.storageLocation,
      selectedItemTypes: formData.selectedItemTypes,
      selectedStorageTypes: formData.selectedStorageTypes,
      selectedDurationOptions: formData.selectedDurationOptions,
      isValuableSelected: formData.isValuableSelected,
    });

    // 이미지 페이지로 이동 (서버 저장 없이)
    navigate(ROUTES.STORAGE_EDIT_IMAGES.replace(':id', id || ''), {
      state: { ...formData, postTags: tagStrings },
    });
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <>
      {/* 상단 헤더 */}
      <Header title="보관소 수정" showBackButton={true} onBack={handleBack} />

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
              isSelected={formData.storageLocation === '실내'}
              onClick={() => handleLocationSelect('실내')}
            >
              <IconContainer>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke={formData.storageLocation === '실내' ? THEME.primary : THEME.grayText}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke={formData.storageLocation === '실내' ? THEME.primary : THEME.grayText}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconContainer>
              <LocationOptionText>실내</LocationOptionText>
            </LocationOptionButton>
            <LocationOptionButton
              isSelected={formData.storageLocation === '실외'}
              onClick={() => handleLocationSelect('실외')}
            >
              <IconContainer>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke={formData.storageLocation === '실외' ? THEME.primary : THEME.grayText}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke={formData.storageLocation === '실외' ? THEME.primary : THEME.grayText}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 9L12 2L21 9"
                    stroke={formData.storageLocation === '실외' ? THEME.primary : THEME.grayText}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 9H21"
                    stroke={formData.storageLocation === '실외' ? THEME.primary : THEME.grayText}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
                isSelected={formData.selectedItemTypes.includes(itemType)}
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
                isSelected={formData.selectedStorageTypes.includes(storageType)}
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
                isSelected={formData.selectedDurationOptions.includes(duration)}
                onClick={() => toggleDuration(duration)}
              >
                {duration}
              </TagButton>
            ))}
          </OptionGroupContainer>

          {/* 귀중품 선택 */}
          <SectionTitle>귀중품</SectionTitle>
          <OptionGroupContainer>
            <TagButton isSelected={formData.isValuableSelected} onClick={toggleValuable}>
              귀중품
            </TagButton>
          </OptionGroupContainer>

          {/* 다음 버튼 */}
          <NextButton onClick={handleNext}>다음</NextButton>
        </Container>
      </RegistrationContainer>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />

      {/* 토스트 메시지 */}
      {toastVisible && <Toast message={toastMessage} visible={toastVisible} />}
    </>
  );
};

export default EditStorageDetails;
