import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import {
  DaumAddressData,
  convertKakaoToDaumAddress as autoConvertAddress,
} from '../../services/KakaoMapService';
import { getStorageDetail, updateStorage } from '../../services/api/modules/place';
import { convertTagsToStrings } from '../../services/domain/tag/TagMappingService';

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
const InputField = styled.input<{ isError: boolean }>`
  width: 321px;
  height: 40px;
  border-radius: 15px;
  border: 0.5px solid ${props => (props.isError ? THEME.redText : THEME.primary)};
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
const HelperText = styled.div<{ visible: boolean }>`
  color: ${THEME.redText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 350;
  letter-spacing: 0.01px;
  margin-bottom: 3px;
  display: ${props => (props.visible ? 'block' : 'none')};
`;

// 텍스트 영역
const TextArea = styled.textarea<{ isError: boolean }>`
  width: 321px;
  height: 171px;
  border-radius: 15px;
  border: 0.5px solid ${props => (props.isError ? THEME.redText : THEME.primary)};
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
  postId: string;
  postAddress: string;
  postTitle: string;
  postContent: string;
  preferPrice: string;
  postTags: string[];
  postAddressData?: DaumAddressData;
  storageLocation: '실내' | '실외';
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
  mainImage: string | null;
  detailImages: string[];
}

// API 응답 데이터 인터페이스
interface StorageDetailResponse {
  postId: string | number;
  postImages?: string[];
  postTitle: string;
  postTags: string[];
  preferPrice: number;
  postContent: string;
  postAddress: string;
  nickname: string;
  hiddenStatus: boolean;
  // 지도 표시를 위한 필드 (API에서 제공되지 않는 경우 기본값 사용)
  latitude?: number;
  longitude?: number;
}

// 편집 단계 열거형
enum EditStep {
  BASIC_INFO = 1,
  OPTIONS = 2,
  IMAGES = 3,
}

const EditStorage: React.FC = () => {
  // 라우터 관련 훅
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  // 토스트 상태
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 현재 단계 상태
  const [currentStep, setCurrentStep] = useState<EditStep>(EditStep.BASIC_INFO);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 보관소 데이터 상태
  const [storageData, setStorageData] = useState<StorageData>({
    postId: '',
    postAddress: '',
    postTitle: '',
    postContent: '',
    preferPrice: '',
    postTags: [],
    storageLocation: '실내',
    selectedItemTypes: [],
    selectedStorageTypes: [],
    selectedDurationOptions: [],
    isValuableSelected: false,
    mainImage: null,
    detailImages: [],
  });

  // 파일 입력 참조
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const detailImagesInputRef = useRef<HTMLInputElement>(null);

  // 원본 파일 객체
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);

  // 에러 상태
  const [errors, setErrors] = useState({
    postAddress: '',
    postTitle: '',
    postContent: '',
    preferPrice: '',
    storageLocation: '',
    itemTypes: '',
    storageTypes: '',
    durationOptions: '',
    mainImage: '',
  });

  // 모달 상태 관리
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // 글자수 제한
  const DESCRIPTION_MAX_LENGTH = 15;
  const DETAILS_MAX_LENGTH = 500;

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // 보관소 상세 정보 조회 (API 호출)
  useEffect(() => {
    const fetchStorageDetail = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await getStorageDetail(id);
        if (response.data.success) {
          const detail: StorageDetailResponse = response.data.data;

          // 태그에서 보관 위치, 물건 유형, 보관 방식, 보관 기간, 귀중품 유무 추출
          const storageLocation = detail.postTags.includes('실내') ? '실내' : '실외';
          const selectedItemTypes = itemTypes.filter(type => detail.postTags.includes(type));
          const selectedStorageTypes = storageTypes.filter(type => detail.postTags.includes(type));
          const selectedDurationOptions = durationOptions.filter(duration =>
            detail.postTags.includes(duration),
          );
          const isValuableSelected = detail.postTags.includes('귀중품');

          // 데이터 설정
          setStorageData({
            postId: detail.postId.toString(),
            postAddress: detail.postAddress,
            postTitle: detail.postTitle,
            postContent: detail.postContent,
            preferPrice: detail.preferPrice.toString(),
            postTags: detail.postTags,
            storageLocation,
            selectedItemTypes,
            selectedStorageTypes,
            selectedDurationOptions,
            isValuableSelected,
            mainImage:
              detail.postImages && detail.postImages.length > 0 ? detail.postImages[0] : null,
            detailImages:
              detail.postImages && detail.postImages.length > 1 ? detail.postImages.slice(1) : [],
          });
        } else {
          showToast('보관소 정보를 가져오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('보관소 상세 정보 조회 오류:', error);
        showToast('보관소 정보를 가져오는데 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageDetail();
  }, [id]);

  // 다음 단계로 이동하는 함수
  const goToNextStep = () => {
    switch (currentStep) {
      case EditStep.BASIC_INFO: {
        const newErrors = {
          postAddress: !storageData.postAddress.trim() ? '주소를 입력해주세요.' : '',
          postTitle: !storageData.postTitle.trim() ? '공간 한줄 소개를 입력해주세요.' : '',
          postContent: !storageData.postContent.trim() ? '내용을 입력해주세요.' : '',
          preferPrice:
            !storageData.preferPrice || isNaN(Number(storageData.preferPrice))
              ? '유효한 가격을 입력해주세요.'
              : '',
        };

        setErrors(prev => ({ ...prev, ...newErrors }));

        // 에러가 없으면 다음 단계로
        if (!Object.values(newErrors).some(error => error)) {
          setCurrentStep(EditStep.OPTIONS);
        } else {
          showToast('필수 입력 항목을 확인해주세요.');
        }
        break;
      }

      case EditStep.OPTIONS: {
        const newErrors = {
          storageLocation: !storageData.storageLocation ? '보관 위치를 선택해주세요.' : '',
          itemTypes:
            storageData.selectedItemTypes.length === 0 ? '물건 유형을 하나 이상 선택해주세요.' : '',
          storageTypes:
            storageData.selectedStorageTypes.length === 0
              ? '보관 방식을 하나 이상 선택해주세요.'
              : '',
          durationOptions:
            storageData.selectedDurationOptions.length === 0
              ? '보관 기간을 하나 이상 선택해주세요.'
              : '',
        };

        setErrors(prev => ({ ...prev, ...newErrors }));

        // 에러가 없으면 다음 단계로
        if (!Object.values(newErrors).some(error => error)) {
          setCurrentStep(EditStep.IMAGES);
        } else {
          showToast('필수 항목을 선택해주세요.');
        }
        break;
      }

      case EditStep.IMAGES: {
        const newErrors = {
          mainImage: !storageData.mainImage ? '대표 이미지를 업로드해주세요.' : '',
        };

        setErrors(prev => ({ ...prev, ...newErrors }));

        // 에러가 없으면 완료
        if (!Object.values(newErrors).some(error => error)) {
          setIsUpdateModalOpen(true);
        } else {
          showToast('대표 이미지를 업로드해주세요.');
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
      navigate(-1); // 첫 단계에서 뒤로가기는 이전 페이지로 이동
    }
  };

  // 주소 필드 클릭 핸들러
  const handleAddressClick = () => {
    navigate('/search-address', { state: { returnTo: `/edit-storage/${id}` } });
  };

  // 주소 변경 핸들러
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStorageData(prev => ({ ...prev, postAddress: e.target.value }));
    setErrors(prev => ({ ...prev, postAddress: '' }));
  };

  // 설명 변경 핸들러
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= DESCRIPTION_MAX_LENGTH) {
      setStorageData(prev => ({ ...prev, postTitle: e.target.value }));
      setErrors(prev => ({ ...prev, postTitle: '' }));
    }
  };

  // 상세 내용 변경 핸들러
  const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= DETAILS_MAX_LENGTH) {
      setStorageData(prev => ({ ...prev, postContent: e.target.value }));
      setErrors(prev => ({ ...prev, postContent: '' }));
    }
  };

  // 가격 변경 핸들러
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하도록
    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
    setStorageData(prev => ({ ...prev, preferPrice: onlyNums }));
    setErrors(prev => ({ ...prev, preferPrice: '' }));
  };

  // 위치 선택 핸들러
  const handleLocationSelect = (locationType: '실내' | '실외') => {
    setStorageData(prev => ({ ...prev, storageLocation: locationType }));
    setErrors(prev => ({ ...prev, storageLocation: '' }));
  };

  // 아이템 유형 토글 핸들러
  const toggleItemType = (itemType: string) => {
    setStorageData(prev => ({
      ...prev,
      selectedItemTypes: prev.selectedItemTypes.includes(itemType)
        ? prev.selectedItemTypes.filter(type => type !== itemType)
        : [...prev.selectedItemTypes, itemType],
    }));
    setErrors(prev => ({ ...prev, itemTypes: '' }));
  };

  // 보관 방식 토글 핸들러
  const toggleStorageType = (storageType: string) => {
    setStorageData(prev => ({
      ...prev,
      selectedStorageTypes: prev.selectedStorageTypes.includes(storageType)
        ? prev.selectedStorageTypes.filter(type => type !== storageType)
        : [...prev.selectedStorageTypes, storageType],
    }));
    setErrors(prev => ({ ...prev, storageTypes: '' }));
  };

  // 보관 기간 토글 핸들러
  const toggleDuration = (duration: string) => {
    setStorageData(prev => ({
      ...prev,
      selectedDurationOptions: prev.selectedDurationOptions.includes(duration)
        ? prev.selectedDurationOptions.filter(d => d !== duration)
        : [...prev.selectedDurationOptions, duration],
    }));
    setErrors(prev => ({ ...prev, durationOptions: '' }));
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
  const handleDetailImagesUpload = () => {
    if (detailImagesInputRef.current) {
      detailImagesInputRef.current.click();
    }
  };

  // 메인 이미지 변경 핸들러
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 원본 파일 저장
      setMainImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setStorageData(prev => ({ ...prev, mainImage: reader.result as string }));
        setErrors(prev => ({ ...prev, mainImage: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 서브 이미지 변경 핸들러
  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // 최대 4개까지만 허용
      const remainingSlots = 4 - storageData.detailImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      if (filesToProcess.length > 0) {
        // 원본 파일 저장
        setDetailImageFiles(prev => [...prev, ...filesToProcess]);

        const newImages = [...storageData.detailImages];
        let processed = 0;

        filesToProcess.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            processed++;

            if (processed === filesToProcess.length) {
              setStorageData(prev => ({
                ...prev,
                detailImages: newImages,
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
    setMainImageFile(null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
  };

  // 서브 이미지 삭제 핸들러
  const handleDeleteDetailImage = (index: number) => {
    setStorageData(prev => ({
      ...prev,
      detailImages: prev.detailImages.filter((_, i) => i !== index),
    }));
    setDetailImageFiles(prev => prev.filter((_, i) => i !== index));
    if (detailImagesInputRef.current) {
      detailImagesInputRef.current.value = '';
    }
  };

  // 업데이트 확인 핸들러
  const handleUpdateConfirm = async () => {
    try {
      setIsLoading(true);

      // FormData 생성
      const formData = new FormData();

      // postData 객체 생성
      const postData = {
        post_title: storageData.postTitle,
        post_content: storageData.postContent,
        post_address: storageData.postAddress,
        prefer_price: Number(storageData.preferPrice),
        post_tags: [
          storageData.storageLocation,
          ...storageData.selectedItemTypes,
          ...storageData.selectedStorageTypes,
          ...storageData.selectedDurationOptions,
          ...(storageData.isValuableSelected ? ['귀중품'] : []),
        ],
      };

      // postData를 FormData에 추가
      formData.append('postData', JSON.stringify(postData));

      // 메인 이미지 추가
      if (mainImageFile) {
        formData.append('mainImage', mainImageFile);
      }

      // 상세 이미지 추가
      detailImageFiles.forEach((file, index) => {
        formData.append('detailImage', file);
      });

      // API 호출
      const response = await updateStorage(storageData.postId, formData);

      if (response.data.success) {
        showToast('보관소가 성공적으로 수정되었습니다.');
        navigate(`/storage/${storageData.postId}`);
      } else {
        showToast('보관소 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('보관소 수정 오류:', error);
      showToast('보관소 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setIsUpdateModalOpen(false);
    }
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
            {/* 주소 입력 - 읽기 전용 및 클릭 시 주소 검색 페이지로 이동 */}
            <InputLabel>
              주소를 입력해 주세요 <RequiredMark>*</RequiredMark>
            </InputLabel>
            <HelperText visible={!!errors.postAddress}>
              {errors.postAddress || '헬퍼 텍스트입니다.'}
            </HelperText>
            <InputField
              type="text"
              name="postAddress"
              value={storageData.postAddress}
              onChange={handleAddressChange}
              placeholder="주소를 입력해주세요"
              isError={!!errors.postAddress}
              readOnly={true} // 읽기 전용으로 설정
              onClick={handleAddressClick} // 클릭 시 주소 검색 페이지로 이동
            />

            {/* 한줄 소개 */}
            <InputLabel>
              공간 한줄 소개 <RequiredMark>*</RequiredMark>
            </InputLabel>
            <HelperText visible={!!errors.postTitle}>
              {errors.postTitle || '헬퍼 텍스트입니다.'}
            </HelperText>
            <InputField
              type="text"
              name="postTitle"
              value={storageData.postTitle}
              onChange={handleDescriptionChange}
              placeholder="공간을 한줄로 작성해주세요 (최대 15글자)"
              maxLength={DESCRIPTION_MAX_LENGTH}
              isError={!!errors.postTitle}
            />

            {/* 상세 내용 */}
            <InputLabel>
              내용을 입력해주세요 <RequiredMark>*</RequiredMark>
            </InputLabel>
            <HelperText visible={!!errors.postContent}>
              {errors.postContent || '헬퍼 텍스트입니다.'}
            </HelperText>
            <TextArea
              name="postContent"
              value={storageData.postContent}
              onChange={handleDetailsChange}
              placeholder="장소에 대한 설명을 자세히 입력해주세요.
              보관 장소 설명 (보관장소 크기, 환경)
              유의사항 (보관기간, 보관 시 주의해야할 점)
              보관이 안되는 품목 (ex. 귀중품, 가구)
              기타 (자율적으로 하고 싶은말)
              *최대 500글자까지 입력 가능합니다*"
              maxLength={DETAILS_MAX_LENGTH}
              isError={!!errors.postContent}
            />

            {/* 가격 입력 */}
            <InputLabel>
              희망 가격 입력 <RequiredMark>*</RequiredMark>
            </InputLabel>
            <HelperText visible={!!errors.preferPrice}>
              {errors.preferPrice || '헬퍼 텍스트입니다.'}
            </HelperText>
            <InputField
              type="text"
              name="preferPrice"
              value={storageData.preferPrice}
              onChange={handlePriceChange}
              placeholder="가격을 입력해주세요 (숫자만 입력해주세요)"
              isError={!!errors.preferPrice}
            />
          </FormContainer>
        )}

        {/* 단계 2: 옵션 설정 */}
        {currentStep === EditStep.OPTIONS && (
          <>
            {/* 보관 위치 선택 */}
            <SectionTitle>보관 위치</SectionTitle>
            {!!errors.storageLocation && (
              <HelperText visible={!!errors.storageLocation} style={{ marginLeft: '25px' }}>
                {errors.storageLocation || '헬퍼 텍스트입니다.'}
              </HelperText>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
              <LocationOptionButton
                isSelected={storageData.storageLocation === '실내'}
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
                      d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18Z"
                      fill={storageData.storageLocation === '실내' ? '#5E5CFD' : '#868686'}
                    />
                    <path
                      d="M7 12H9V16H7V12Z"
                      fill={storageData.storageLocation === '실내' ? '#5E5CFD' : '#868686'}
                    />
                    <path
                      d="M11 8H13V16H11V8Z"
                      fill={storageData.storageLocation === '실내' ? '#5E5CFD' : '#868686'}
                    />
                    <path
                      d="M15 10H17V16H15V10Z"
                      fill={storageData.storageLocation === '실내' ? '#5E5CFD' : '#868686'}
                    />
                  </svg>
                </IconContainer>
                <LocationOptionText>실내</LocationOptionText>
              </LocationOptionButton>
              <LocationOptionButton
                isSelected={storageData.storageLocation === '실외'}
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
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                      fill={storageData.storageLocation === '실외' ? '#5E5CFD' : '#868686'}
                    />
                    <path
                      d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
                      fill={storageData.storageLocation === '실외' ? '#5E5CFD' : '#868686'}
                    />
                    <path
                      d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"
                      fill={storageData.storageLocation === '실외' ? '#5E5CFD' : '#868686'}
                    />
                  </svg>
                </IconContainer>
                <LocationOptionText>실외</LocationOptionText>
              </LocationOptionButton>
            </div>

            {/* 물건 유형 선택 */}
            <SectionTitle>물건 유형</SectionTitle>
            {!!errors.itemTypes && (
              <HelperText visible={!!errors.itemTypes} style={{ marginLeft: '25px' }}>
                {errors.itemTypes || '헬퍼 텍스트입니다.'}
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
            {!!errors.storageTypes && (
              <HelperText visible={!!errors.storageTypes} style={{ marginLeft: '25px' }}>
                {errors.storageTypes || '헬퍼 텍스트입니다.'}
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
            {!!errors.durationOptions && (
              <HelperText visible={!!errors.durationOptions} style={{ marginLeft: '25px' }}>
                {errors.durationOptions || '헬퍼 텍스트입니다.'}
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
            <HelperText visible={!!errors.mainImage}>
              {errors.mainImage || '헬퍼 텍스트입니다.'}
            </HelperText>

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
              {storageData.detailImages.length > 0 ? (
                <SubImagesScrollContainer>
                  {storageData.detailImages.map((img, index) => (
                    <SubImageItem key={index}>
                      <SubImage src={img} alt={`추가 이미지 ${index + 1}`} />
                      <DeleteImageButton onClick={() => handleDeleteDetailImage(index)}>
                        ×
                      </DeleteImageButton>
                    </SubImageItem>
                  ))}
                  {storageData.detailImages.length < 4 && (
                    <SubImageItem
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: THEME.lightGray,
                      }}
                      onClick={handleDetailImagesUpload}
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
                  <UploadButton onClick={handleDetailImagesUpload}>파일 업로드</UploadButton>
                </>
              )}
            </SubImageUploadArea>

            {/* 숨겨진 파일 업로드 입력 필드 (다중 선택) */}
            <input
              type="file"
              ref={detailImagesInputRef}
              onChange={handleDetailImagesChange}
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
