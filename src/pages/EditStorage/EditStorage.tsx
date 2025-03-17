import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#5E5CFD',
  background: '#F5F5FF',
  lightGray: '#EFEFEF',
  darkText: '#464646',
  redText: '#FF5050',
  grayText: '#6F6F6F',
  darkGrayText: '#505050',
  borderColor: '#D9D9D9',
  white: '#FFFFFF',
};

// 모달관련 스타일 컴포넌트트
const GrayText = styled.span`
  color: #5b5a5d;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  line-height: 19.21px;
  word-wrap: break-word;
`;

const HighlightText = styled.span`
  color: #010048;
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  line-height: 19.21px;
  word-wrap: break-word;
`;

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 375px;
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 116px;
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
const ProgressFill = styled.div<{ step: number }>`
  width: ${props => props.step * 111}px; /* 각 단계별 너비 (1/3, 2/3, 3/3) */
  height: 12px;
  background: ${THEME.primary};
  border-top-left-radius: 7px;
  border-bottom-left-radius: 7px;
  ${props => props.step === 3 && 'border-radius: 7px;'}/* 마지막 단계에서는 모서리 모두 둥글게 */
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

// 폼 컨테이너
const FormContainer = styled.div`
  padding: 0 10px;
  margin-top: 30px;
`;

// 입력 필드 레이블
const InputLabel = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  color: ${THEME.grayText};
`;

// 필수 표시 (*)
const RequiredMark = styled.span`
  color: ${THEME.redText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
`;

// 입력 필드
const InputField = styled.input`
  width: 321px;
  height: 40px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  padding: 0 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 헬퍼 텍스트
const HelperText = styled.div`
  color: ${THEME.redText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
  margin-bottom: 3px;
`;

// 텍스트 영역
const TextArea = styled.textarea`
  width: 321px;
  height: 171px;
  border-radius: 15px;
  border: 0.5px solid ${THEME.primary};
  padding: 15px;
  margin-bottom: 18px;
  font-size: 14px;
  font-family: 'Noto Sans KR';
  resize: none;
  &:focus {
    outline: none;
    border-color: ${THEME.primary};
  }
`;

// 다음 버튼
const NextButton = styled.button`
  width: 349px;
  height: 47px;
  position: absolute;
  left: 13px;
  bottom: 30px;
  background: ${THEME.primary};
  border-radius: 15px;
  border: none;
  color: ${THEME.white};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: pointer;
`;

// 섹션 제목
const SectionTitle = styled.h3`
  color: ${THEME.darkText};
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

// 이미지 업로드 영역 (대표 이미지)
const MainImageUploadArea = styled.div`
  width: 320px;
  height: 200px;
  background: ${THEME.lightGray};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
  position: relative;
  overflow: hidden;
`;

// 이미지 업로드 영역 (추가 이미지)
const SubImageUploadArea = styled.div`
  width: 320px;
  height: 154px;
  background: ${THEME.lightGray};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
  position: relative;
  overflow: hidden;
`;

// 이미지 업로드 안내 텍스트
const UploadGuideText = styled.div`
  color: ${THEME.darkGrayText};
  font-size: 13.6px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  text-align: center;
  line-height: 1.5;
`;

// 업로드 버튼
const UploadButton = styled.button`
  background: transparent;
  border: none;
  color: ${THEME.darkGrayText};
  font-size: 10px;
  font-family: 'Actor', sans-serif;
  font-weight: 400;
  letter-spacing: 0.01px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 10px;

  &::before {
    content: '';
    width: 55px;
    height: 1px;
    background-color: ${THEME.grayText};
    margin-right: 8px;
  }

  &::after {
    content: '';
    width: 55px;
    height: 1px;
    background-color: ${THEME.grayText};
    margin-left: 8px;
  }
`;

// 업로드된 이미지 표시 영역
const UploadedImageContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// 업로드된 메인 이미지
const UploadedMainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 업로드된 서브 이미지 스크롤 컨테이너
const SubImagesScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

// 업로드된 서브 이미지 아이템
const SubImageItem = styled.div`
  min-width: 150px;
  height: 100%;
  position: relative;
  margin-right: 10px;
  flex-shrink: 0;
`;

// 서브 이미지
const SubImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

// 이미지 삭제 버튼
const DeleteImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
`;

// 완료 버튼
const CompleteButton = styled.button`
  width: 349px;
  height: 47px;
  position: absolute;
  left: 13px;
  bottom: 30px;
  background: ${THEME.primary};
  border-radius: 15px;
  border: none;
  color: ${THEME.white};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
  cursor: pointer;
`;

// 아이템 유형 옵션
const itemTypes = ['식물', '전자기기', '가전', '스포츠', '식품', '의류', '서적', '취미', '가구'];

// 보관 방식 옵션
const storageTypes = ['냉장보관', '냉동보관', '상온보관'];

// 보관 기간 옵션
const durationOptions = ['일주일 이내', '한달 이내', '3개월 이상'];

// 귀중품 옵션
const valuableOptions = ['귀중품'];

// 보관소 데이터 타입 정의
interface StorageData {
  id: string;
  address: string;
  description: string;
  details: string;
  price: string;
  storageLocation: '실내' | '실외';
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
  mainImage: string | null;
  subImages: string[];
}

enum EditStep {
  BASIC_INFO = 1,
  OPTIONS = 2,
  IMAGES = 3,
}

const EditStorage: React.FC = () => {
  // 라우터 관련 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 단계 상태
  const [currentStep, setCurrentStep] = useState<EditStep>(EditStep.BASIC_INFO);

  // 보관소 데이터 상태
  const [storageData, setStorageData] = useState<StorageData>({
    id: '',
    address: '',
    description: '',
    details: '',
    price: '',
    storageLocation: '실내',
    selectedItemTypes: [],
    selectedStorageTypes: [],
    selectedDurationOptions: [],
    isValuableSelected: false,
    mainImage: null,
    subImages: [],
  });

  // 파일 입력 참조
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const subImagesInputRef = useRef<HTMLInputElement>(null);

  // 에러 상태
  const [errors, setErrors] = useState({
    address: false,
    description: false,
    details: false,
    price: false,
    storageLocation: false,
    itemTypes: false,
    storageTypes: false,
    durationOptions: false,
    mainImage: false,
  });

  // 모달 상태 관리
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // 글자수 제한
  const DESCRIPTION_MAX_LENGTH = 15;
  const DETAILS_MAX_LENGTH = 500;

  // 더미 데이터 로드 및 초기 데이터 설정 (실제로는 API 호출)
  useEffect(() => {
    // 여기서는 StorageDetail에서 데이터를 전달받았다고 가정합니다
    // 실제로는 location.state를 사용하거나 API 호출을 통해 데이터를 가져옵니다
    const dummyData: StorageData = {
      id: '123',
      address: '제주특별자치도 제주시 월성로',
      description: '제주시청 근처 큰 방 입니다',
      details:
        '첫째가 독립해서 공간이 남네요. 잡화 보관해 드립니다. 근처 거주하시는 분 보관 가능합니다. 장기간 등록시 할인해드려요~^^ 냄새나는 물건은 받지 않겠습니다',
      price: '10000',
      storageLocation: '실내',
      selectedItemTypes: ['의류', '전자기기'],
      selectedStorageTypes: ['상온보관'],
      selectedDurationOptions: ['한달 이내'],
      isValuableSelected: false,
      mainImage: 'https://placehold.co/400x300',
      subImages: ['https://placehold.co/200x150', 'https://placehold.co/200x150'],
    };

    setStorageData(dummyData);
  }, []);

  // 다음 단계로 이동하는 함수
  const goToNextStep = () => {
    switch (currentStep) {
      case EditStep.BASIC_INFO: {
        const step1Errors = {
          address: !storageData.address.trim(),
          description: !storageData.description.trim(),
          details: !storageData.details.trim(),
          price: !storageData.price || isNaN(Number(storageData.price)),
        };

        setErrors(prev => ({ ...prev, ...step1Errors }));

        // 에러가 없으면 다음 단계로
        if (!Object.values(step1Errors).some(error => error)) {
          setCurrentStep(EditStep.OPTIONS);
        }
        break;
      }

      case EditStep.OPTIONS: {
        const step2Errors = {
          storageLocation: !storageData.storageLocation,
          itemTypes: storageData.selectedItemTypes.length === 0,
          storageTypes: storageData.selectedStorageTypes.length === 0,
          durationOptions: storageData.selectedDurationOptions.length === 0,
        };

        setErrors(prev => ({ ...prev, ...step2Errors }));

        // 에러가 없으면 다음 단계로
        if (!Object.values(step2Errors).some(error => error)) {
          setCurrentStep(EditStep.IMAGES);
        }
        break;
      }

      case EditStep.IMAGES: {
        const step3Errors = {
          mainImage: !storageData.mainImage,
        };

        setErrors(prev => ({ ...prev, ...step3Errors }));

        // 에러가 없으면 완료
        if (!Object.values(step3Errors).some(error => error)) {
          setIsUpdateModalOpen(true);
        }
        break;
      }
    }
  };

  // 이전 단계로 이동하는 함수
  const goToPreviousStep = () => {
    if (currentStep > EditStep.BASIC_INFO) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1); // 첫 단계에서 뒤로가기는 보관소 상세 페이지로 이동
    }
  };

  // 주소 변경 핸들러
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStorageData(prev => ({ ...prev, address: e.target.value }));
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: false }));
    }
  };

  // 설명 변경 핸들러
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= DESCRIPTION_MAX_LENGTH) {
      setStorageData(prev => ({ ...prev, description: e.target.value }));
      if (errors.description) {
        setErrors(prev => ({ ...prev, description: false }));
      }
    }
  };

  // 상세 내용 변경 핸들러
  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= DETAILS_MAX_LENGTH) {
      setStorageData(prev => ({ ...prev, details: e.target.value }));
      if (errors.details) {
        setErrors(prev => ({ ...prev, details: false }));
      }
    }
  };

  // 가격 변경 핸들러
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하도록
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    setStorageData(prev => ({ ...prev, price: onlyNums }));
    if (errors.price) {
      setErrors(prev => ({ ...prev, price: false }));
    }
  };

  // 위치 선택 핸들러
  const handleLocationSelect = (locationType: '실내' | '실외') => {
    setStorageData(prev => ({ ...prev, storageLocation: locationType }));
    if (errors.storageLocation) {
      setErrors(prev => ({ ...prev, storageLocation: false }));
    }
  };

  // 아이템 유형 토글 핸들러
  const toggleItemType = (itemType: string) => {
    setStorageData(prev => ({
      ...prev,
      selectedItemTypes: prev.selectedItemTypes.includes(itemType)
        ? prev.selectedItemTypes.filter(type => type !== itemType)
        : [...prev.selectedItemTypes, itemType],
    }));
    if (errors.itemTypes) {
      setErrors(prev => ({ ...prev, itemTypes: false }));
    }
  };

  // 보관 방식 토글 핸들러
  const toggleStorageType = (storageType: string) => {
    setStorageData(prev => ({
      ...prev,
      selectedStorageTypes: prev.selectedStorageTypes.includes(storageType)
        ? prev.selectedStorageTypes.filter(type => type !== storageType)
        : [...prev.selectedStorageTypes, storageType],
    }));
    if (errors.storageTypes) {
      setErrors(prev => ({ ...prev, storageTypes: false }));
    }
  };

  // 보관 기간 토글 핸들러
  const toggleDuration = (duration: string) => {
    setStorageData(prev => ({
      ...prev,
      selectedDurationOptions: prev.selectedDurationOptions.includes(duration)
        ? prev.selectedDurationOptions.filter(d => d !== duration)
        : [...prev.selectedDurationOptions, duration],
    }));
    if (errors.durationOptions) {
      setErrors(prev => ({ ...prev, durationOptions: false }));
    }
  };

  // 귀중품 토글 핸들러
  const toggleValuable = () => {
    setStorageData(prev => ({
      ...prev,
      isValuableSelected: !prev.isValuableSelected,
    }));
  };

  // 메인 이미지 업로드 핸들러
  const handleMainImageUpload = () => {
    if (mainImageInputRef.current) {
      mainImageInputRef.current.click();
    }
  };

  // 서브 이미지 업로드 핸들러
  const handleSubImagesUpload = () => {
    if (subImagesInputRef.current) {
      subImagesInputRef.current.click();
    }
  };

  // 메인 이미지 변경 핸들러
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStorageData(prev => ({ ...prev, mainImage: reader.result as string }));
        if (errors.mainImage) {
          setErrors(prev => ({ ...prev, mainImage: false }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 서브 이미지 변경 핸들러
  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // 최대 4개까지만 허용
      const remainingSlots = 4 - storageData.subImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      if (filesToProcess.length > 0) {
        const newImages: string[] = [];
        let processed = 0;

        filesToProcess.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            processed++;

            if (processed === filesToProcess.length) {
              setStorageData(prev => ({
                ...prev,
                subImages: [...prev.subImages, ...newImages],
              }));
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  // 메인 이미지 삭제 핸들러
  const handleDeleteMainImage = () => {
    setStorageData(prev => ({ ...prev, mainImage: null }));
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
  };

  // 서브 이미지 삭제 핸들러
  const handleDeleteSubImage = (index: number) => {
    setStorageData(prev => ({
      ...prev,
      subImages: prev.subImages.filter((_, i) => i !== index),
    }));
    if (subImagesInputRef.current) {
      subImagesInputRef.current.value = '';
    }
  };

  // 업데이트 확인 핸들러
  const handleUpdateConfirm = () => {
    // 여기서 API 호출을 통해 DB를 업데이트합니다
    console.log('보관소 정보가 업데이트됐습니다:', storageData);

    // API 호출 예시 (실제로는 구현해야 함)
    // updateStorage(storageData)
    //   .then(() => {
    //     navigate(`/storagedetail/${storageData.id}`);
    //   })
    //   .catch(error => {
    //     console.error('업데이트 오류:', error);
    //   });

    // 테스트용 코드
    setTimeout(() => {
      navigate(`/storagedetail`);
    }, 1000);
  };

  // 모달 내용 컴포넌트 - 업데이트 확인
  const updateContent = (
    <>
      <HighlightText>보관소 정보</HighlightText>
      <GrayText>가 수정되었습니다!</GrayText>
    </>
  );

  return (
    <>
      {/* 상단 헤더 */}
      <Header title="보관소 수정" showBackButton={true} onBack={goToPreviousStep} />

      <Container>
        {/* 프로그레스 바 */}
        <ProgressContainer>
          <ProgressBackground>
            <ProgressFill step={currentStep} />
          </ProgressBackground>
          <ProgressText>{currentStep}/3</ProgressText>
        </ProgressContainer>

        {/* 단계 1: 기본 정보 */}
        {currentStep === EditStep.BASIC_INFO && (
          <FormContainer>
            {/* 주소 입력 */}
            <InputLabel>
              주소를 입력해 주세요 <RequiredMark>*</RequiredMark>
            </InputLabel>
            {errors.address && <HelperText>주소는 필수 입력 항목입니다.</HelperText>}
            <InputField
              type="text"
              value={storageData.address}
              onChange={handleAddressChange}
              placeholder="주소를 입력해주세요"
            />

            {/* 한줄 소개 */}
            <InputLabel>
              공간 한줄 소개 <RequiredMark>*</RequiredMark>
            </InputLabel>
            {errors.description && <HelperText>한줄 소개는 필수 입력 항목입니다.</HelperText>}
            <InputField
              type="text"
              value={storageData.description}
              onChange={handleDescriptionChange}
              placeholder="공간을 한줄로 작성해주세요 (최대 15글자)"
              maxLength={DESCRIPTION_MAX_LENGTH}
            />

            {/* 상세 내용 */}
            <InputLabel>
              내용을 입력해주세요 <RequiredMark>*</RequiredMark>
            </InputLabel>
            {errors.details && <HelperText>상세 내용은 필수 입력 항목입니다.</HelperText>}
            <TextArea
              value={storageData.details}
              onChange={handleDetailsChange}
              placeholder="장소에 대한 설명을 자세히 입력해주세요.
          보관 장소 설명 (보관장소 크기, 환경)
          유의사항 (보관기간, 보관 시 주의해야할 점)
          보관이 안되는 품목 (ex. 귀중품, 가구)
          기타 (자율적으로 하고 싶은말)
          *최대 500글자까지 입력 가능합니다*"
              maxLength={DETAILS_MAX_LENGTH}
            />

            {/* 가격 입력 */}
            <InputLabel>
              희망 가격 입력 <RequiredMark>*</RequiredMark>
            </InputLabel>
            {errors.price && <HelperText>가격은 필수 입력 항목입니다.</HelperText>}
            <InputField
              type="text"
              value={storageData.price}
              onChange={handlePriceChange}
              placeholder="가격을 입력해주세요 (숫자만 입력해주세요)"
            />
          </FormContainer>
        )}

        {/* 단계 2: 옵션 설정 */}
        {currentStep === EditStep.OPTIONS && (
          <>
            {/* 보관 위치 선택 */}
            <SectionTitle>보관 위치</SectionTitle>
            {errors.storageLocation && (
              <HelperText style={{ marginLeft: '25px' }}>보관 위치를 선택해주세요.</HelperText>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <LocationOptionButton
                isSelected={storageData.storageLocation === '실내'}
                onClick={() => handleLocationSelect('실내')}
              >
                <IconContainer>
                  <img src="https://placehold.co/24x24" alt="실내 아이콘" />
                </IconContainer>
                <LocationOptionText>실내</LocationOptionText>
              </LocationOptionButton>
              <LocationOptionButton
                isSelected={storageData.storageLocation === '실외'}
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
            {errors.itemTypes && (
              <HelperText style={{ marginLeft: '25px' }}>
                물건 유형을 하나 이상 선택해주세요.
              </HelperText>
            )}
            <OptionGroupContainer>
              {itemTypes.map(itemType => (
                <TagButton
                  key={itemType}
                  isSelected={storageData.selectedItemTypes.includes(itemType)}
                  onClick={() => toggleItemType(itemType)}
                >
                  {itemType}
                </TagButton>
              ))}
            </OptionGroupContainer>

            {/* 보관 방식 선택 */}
            <SectionTitle>보관 방식</SectionTitle>
            {errors.storageTypes && (
              <HelperText style={{ marginLeft: '25px' }}>
                보관 방식을 하나 이상 선택해주세요.
              </HelperText>
            )}
            <OptionGroupContainer>
              {storageTypes.map(storageType => (
                <TagButton
                  key={storageType}
                  isSelected={storageData.selectedStorageTypes.includes(storageType)}
                  onClick={() => toggleStorageType(storageType)}
                >
                  {storageType}
                </TagButton>
              ))}
            </OptionGroupContainer>

            {/* 보관 기간 선택 */}
            <SectionTitle>보관 기간</SectionTitle>
            {errors.durationOptions && (
              <HelperText style={{ marginLeft: '25px' }}>
                보관 기간을 하나 이상 선택해주세요.
              </HelperText>
            )}
            <OptionGroupContainer>
              {durationOptions.map(duration => (
                <TagButton
                  key={duration}
                  isSelected={storageData.selectedDurationOptions.includes(duration)}
                  onClick={() => toggleDuration(duration)}
                >
                  {duration}
                </TagButton>
              ))}
            </OptionGroupContainer>

            {/* 귀중품 선택 */}
            <SectionTitle>귀중품</SectionTitle>
            <OptionGroupContainer>
              <TagButton isSelected={storageData.isValuableSelected} onClick={toggleValuable}>
                귀중품
              </TagButton>
            </OptionGroupContainer>
          </>
        )}

        {/* 단계 3: 이미지 업로드 */}
        {currentStep === EditStep.IMAGES && (
          <FormContainer>
            {/* 대표 이미지 업로드 */}
            <InputLabel>
              대표이미지 <RequiredMark>*</RequiredMark>
            </InputLabel>
            {errors.mainImage && <HelperText>대표 이미지를 업로드해주세요.</HelperText>}

            <MainImageUploadArea>
              {storageData.mainImage ? (
                <UploadedImageContainer>
                  <UploadedMainImage src={storageData.mainImage} alt="대표 이미지" />
                  <DeleteImageButton onClick={handleDeleteMainImage}>×</DeleteImageButton>
                </UploadedImageContainer>
              ) : (
                <>
                  <UploadGuideText>
                    이미지를 업로드해주세요
                    <br />
                    (필수)
                  </UploadGuideText>
                  <UploadButton onClick={handleMainImageUpload}>파일 업로드</UploadButton>
                </>
              )}
            </MainImageUploadArea>

            {/* 숨겨진 파일 업로드 입력 필드 */}
            <input
              type="file"
              ref={mainImageInputRef}
              onChange={handleMainImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* 추가 이미지 업로드 */}
            <InputLabel>이미지</InputLabel>

            <SubImageUploadArea>
              {storageData.subImages.length > 0 ? (
                <SubImagesScrollContainer>
                  {storageData.subImages.map((img, index) => (
                    <SubImageItem key={index}>
                      <SubImage src={img} alt={`추가 이미지 ${index + 1}`} />
                      <DeleteImageButton onClick={() => handleDeleteSubImage(index)}>
                        ×
                      </DeleteImageButton>
                    </SubImageItem>
                  ))}
                  {storageData.subImages.length < 4 && (
                    <SubImageItem
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: THEME.lightGray,
                      }}
                      onClick={handleSubImagesUpload}
                    >
                      <UploadGuideText>추가 이미지</UploadGuideText>
                      <div style={{ fontSize: '24px', marginTop: '10px' }}>+</div>
                    </SubImageItem>
                  )}
                </SubImagesScrollContainer>
              ) : (
                <>
                  <UploadGuideText>
                    이미지를 업로드해주세요
                    <br />
                    (선택사항)
                  </UploadGuideText>
                  <UploadButton onClick={handleSubImagesUpload}>파일 업로드</UploadButton>
                </>
              )}
            </SubImageUploadArea>

            {/* 숨겨진 파일 업로드 입력 필드 (다중 선택) */}
            <input
              type="file"
              ref={subImagesInputRef}
              onChange={handleSubImagesChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
          </FormContainer>
        )}

        {/* 다음/완료 버튼 */}
        {currentStep === EditStep.IMAGES ? (
          <CompleteButton onClick={goToNextStep}>수정 완료</CompleteButton>
        ) : (
          <NextButton onClick={goToNextStep}>다음</NextButton>
        )}

        {/* 업데이트 확인 모달 */}
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          content={updateContent}
          cancelText="취소"
          confirmText="확인"
          onCancel={() => setIsUpdateModalOpen(false)}
          onConfirm={handleUpdateConfirm}
        />
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </>
  );
};

export default EditStorage;
