import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import {
  registerStorage,
  base64ToFile,
  StorageRegistrationRequest,
} from '../../services/api/modules/storage';
import { DaumAddressData } from '../../services/KakaoMapService';
import { ROUTES } from '../../constants/routes';
import {
  ImageData,
  StorageData,
  uploadImage,
  uploadMultipleImages,
  getPresignedUrl,
  uploadImageWithPresignedUrl,
  moveImages,
} from '../../services/api/modules/image';

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
  grayText: '#6F6F6F',
  darkGrayText: '#505050',
  borderColor: '#D9D9D9',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  max-width: 480px;
  height: calc(100vh - 70px); /* 네비게이션 바 높이 제외 */
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

// 프로그레스 완료 부분 (3/3 = 100%)
const ProgressFill = styled.div`
  width: 332px;
  height: 12px;
  background: ${THEME.primary};
  border-radius: 7px;
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
  padding: 0 25px;
  margin-top: 20px;
`;

// 섹션 레이블
const SectionLabel = styled.div`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
`;

// 레이블 텍스트
const LabelText = styled.span`
  color: ${THEME.grayText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
`;

// 필수 표시
const RequiredMark = styled.span`
  color: ${THEME.redText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  letter-spacing: 0.01px;
  margin-left: 4px;
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
const DetailImageUploadArea = styled.div`
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
const DetailImagesScrollContainer = styled.div`
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
const DetailImageItem = styled.div`
  min-width: 150px;
  height: 100%;
  position: relative;
  margin-right: 10px;
  flex-shrink: 0;
`;

// 서브 이미지
const DetailImage = styled.img`
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
  width: 325px;
  height: 47px;
  position: relative;
  margin-top: 30px;
  margin-left: 25px;
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

// 로딩 오버레이
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid ${THEME.lightGray};
  border-top: 5px solid ${THEME.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// 이전 단계에서 전달받는 데이터 타입
interface CombinedFormData {
  // Registration1 데이터
  postTitle: string;
  postContent: string;
  preferPrice: string;
  postAddress: string;
  postAddressData?: DaumAddressData;

  // Registration2 데이터
  storageLocation: '실내' | '실외';
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
  postTags: string[]; // 태그 문자열 배열로 변경

  // 이미지 관련 데이터 (선택적)
  mainImage?: string | null;
  detailImages?: string[];
  mainImageFile?: File | null;
  detailImageFiles?: File[];
}

const Registration3: React.FC = () => {
  // 라우터 관련 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 상태 체크
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.log('로그인되지 않은 상태입니다. 로그인 페이지로 이동합니다.');
      navigate(ROUTES.LOGIN);
      return;
    }
  }, [navigate]);

  // 이전 단계에서 전달받은 데이터
  const [prevFormData, setPrevFormData] = useState<CombinedFormData | null>(null);

  // 파일 입력 참조
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const detailImagesInputRef = useRef<HTMLInputElement>(null);

  // 이미지 상태 관리 (메모리에서만 관리)
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [detailImages, setDetailImages] = useState<string[]>([]);

  // 원본 파일 객체
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);

  // 모달 상태 관리
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 토스트 상태
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 첫 렌더링 체크 (useEffect 첫 실행시 저장 방지)
  const [isInitialRender, setIsInitialRender] = useState(true);

  // post_id를 저장할 state 추가
  const [postId, setPostId] = useState<string | null>(null);

  // 이미지 데이터 상태 관리
  const [mainImageData, setMainImageData] = useState<ImageData | null>(null);
  const [detailImageData, setDetailImageData] = useState<ImageData[]>([]);

  // 이전 단계 데이터 로드
  useEffect(() => {
    if (location.state) {
      const state = location.state as CombinedFormData;
      // 이미지 관련 데이터 제외하고 저장
      const { mainImage, detailImages, mainImageFile, detailImageFiles, ...rest } = state;
      setPrevFormData(rest);
      console.log('이전 단계 데이터 로드됨:', rest);
    }
  }, [location.state]);

  // 로컬 스토리지에서 이미지 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('storage_register_images');
    if (savedData) {
      try {
        const parsedData: StorageData = JSON.parse(savedData);
        if (parsedData.mainImage) {
          setMainImageData(parsedData.mainImage);
          setMainImage(parsedData.mainImage.image_url);
        }
        if (parsedData.detailImages) {
          setDetailImageData(parsedData.detailImages);
          setDetailImages(parsedData.detailImages.map(img => img.image_url));
        }
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
    setIsInitialRender(false);
  }, []);

  // 이미지 상태 변경 시 로컬 스토리지에 자동 저장
  useEffect(() => {
    if (isInitialRender) return;

    const dataToSave: StorageData = {
      mainImage: mainImageData,
      detailImages: detailImageData,
    };

    try {
      localStorage.setItem('storage_register_images', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('로컬 스토리지 저장 오류:', error);
      showToast('저장 중 문제가 발생했습니다.');
    }
  }, [mainImageData, detailImageData]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
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

  const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_SINGLE_FILE_SIZE = 1 * 1024 * 1024; // 1MB

  // 대표 이미지(mainImageFile) + 서브 이미지(detailImageFiles) 용량 총합 구하기
  const getTotalUploadedSize = () => {
    let total = 0;
    if (mainImageFile) {
      total += mainImageFile.size;
    }
    detailImageFiles.forEach(file => {
      total += file.size;
    });
    return total;
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // presigned URL 요청
      const presignedUrlResponse = await getPresignedUrl(file.name, file.type, 'post');

      // S3에 이미지 업로드
      await uploadImageWithPresignedUrl(presignedUrlResponse.data.presigned_url, file);

      // 이미지 데이터 저장
      setMainImageData({
        image_url: presignedUrlResponse.data.image_url,
        temp_key: presignedUrlResponse.data.temp_key,
      });

      // 미리보기용 이미지 URL 설정
      setMainImage(presignedUrlResponse.data.image_url);
      setMainImageFile(file);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showToast('이미지 업로드에 실패했습니다.');
    }
  };

  const handleDetailImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 최대 4장까지 가능
    const remainingSlots = 4 - detailImageData.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    try {
      const newImageData: ImageData[] = [];
      const newImages: string[] = [];
      const newFiles: File[] = [];

      for (const file of filesToProcess) {
        // presigned URL 요청
        const presignedUrlResponse = await getPresignedUrl(file.name, file.type, 'post');

        // S3에 이미지 업로드
        await uploadImageWithPresignedUrl(presignedUrlResponse.data.presigned_url, file);

        // 이미지 데이터 저장
        newImageData.push({
          image_url: presignedUrlResponse.data.image_url,
          temp_key: presignedUrlResponse.data.temp_key,
        });

        // 미리보기용 이미지 URL 설정
        newImages.push(presignedUrlResponse.data.image_url);
        newFiles.push(file);
      }

      setDetailImageData(prev => [...prev, ...newImageData]);
      setDetailImages(prev => [...prev, ...newImages]);
      setDetailImageFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showToast('이미지 업로드에 실패했습니다.');
    }
  };

  // 메인 이미지 삭제 핸들러
  const handleDeleteMainImage = () => {
    setMainImage(null);
    setMainImageFile(null);
    setMainImageData(null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
  };

  // 서브 이미지 삭제 핸들러
  const handleDeleteDetailImage = (index: number) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
    setDetailImageFiles(prev => prev.filter((_, i) => i !== index));
    setDetailImageData(prev => prev.filter((_, i) => i !== index));

    if (detailImagesInputRef.current) {
      detailImagesInputRef.current.value = '';
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(`/storages/register/details`);
  };

  // 등록 확인 모달 열기
  const openConfirmModal = () => {
    console.log('모달 열기 시도');
    setTimeout(() => {
      setIsConfirmModalOpen(true);
      console.log('모달 상태 설정됨:', true);
    }, 300);
  };

  // 완료 핸들러
  const handleComplete = async () => {
    if (!prevFormData) {
      showToast('이전 단계 데이터가 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('=== 보관소 등록 시작 ===');

      // 이미지 이동 요청
      const tempKeys = [
        ...(mainImageData ? [mainImageData.temp_key] : []),
        ...detailImageData.map(img => img.temp_key),
      ];

      const mainFlags = [
        ...(mainImageData ? [true] : []),
        ...new Array(detailImageData.length).fill(false),
      ];

      const moveResponse = await moveImages(tempKeys, 'post', mainFlags);

      // 주소 데이터 준비
      const addressData: DaumAddressData = {
        // 원본 postAddressData의 모든 필드를 최대한 활용
        address: prevFormData.postAddressData?.address || prevFormData.postAddress || '',
        address_english: prevFormData.postAddressData?.address_english || '',
        address_type: prevFormData.postAddressData?.address_type || 'R',
        apartment: prevFormData.postAddressData?.apartment || 'N',
        auto_jibun_address:
          prevFormData.postAddressData?.auto_jibun_address || prevFormData.postAddress || '',
        auto_jibun_address_english: prevFormData.postAddressData?.auto_jibun_address_english || '',
        auto_road_address:
          prevFormData.postAddressData?.auto_road_address || prevFormData.postAddress || '',
        auto_road_address_english: prevFormData.postAddressData?.auto_road_address_english || '',
        bcode: prevFormData.postAddressData?.bcode || '',
        bname: prevFormData.postAddressData?.bname || '',
        bname1: prevFormData.postAddressData?.bname1 || '',
        bname1_english: prevFormData.postAddressData?.bname1_english || '',
        bname2: prevFormData.postAddressData?.bname2 || '',
        bname2_english: prevFormData.postAddressData?.bname2_english || '',
        bname_english: prevFormData.postAddressData?.bname_english || '',
        building_code: prevFormData.postAddressData?.building_code || '',
        building_name: prevFormData.postAddressData?.building_name || '',
        hname: prevFormData.postAddressData?.hname || '',
        jibun_address:
          prevFormData.postAddressData?.jibun_address || prevFormData.postAddress || '',
        jibun_address_english: prevFormData.postAddressData?.jibun_address_english || '',
        no_selected: prevFormData.postAddressData?.no_selected || 'N',
        postcode:
          prevFormData.postAddressData?.postcode || prevFormData.postAddressData?.zonecode || '',
        postcode1:
          prevFormData.postAddressData?.postcode1 ||
          prevFormData.postAddressData?.zonecode?.slice(0, 3) ||
          '',
        postcode2:
          prevFormData.postAddressData?.postcode2 ||
          prevFormData.postAddressData?.zonecode?.slice(3) ||
          '',
        postcode_seq: prevFormData.postAddressData?.postcode_seq || '',
        query: prevFormData.postAddressData?.query || '',
        road_address: prevFormData.postAddressData?.road_address || prevFormData.postAddress || '',
        road_address_english: prevFormData.postAddressData?.road_address_english || '',
        roadname: prevFormData.postAddressData?.roadname || '',
        roadname_code: prevFormData.postAddressData?.roadname_code || '',
        roadname_english: prevFormData.postAddressData?.roadname_english || '',
        sido: prevFormData.postAddressData?.sido || '',
        sido_english: prevFormData.postAddressData?.sido_english || '',
        sigungu: prevFormData.postAddressData?.sigungu || '',
        sigungu_code: prevFormData.postAddressData?.sigungu_code || '',
        sigungu_english: prevFormData.postAddressData?.sigungu_english || '',
        user_language_type: prevFormData.postAddressData?.user_language_type || 'K',
        user_selected_type: prevFormData.postAddressData?.user_selected_type || 'R',
        zonecode: prevFormData.postAddressData?.zonecode || '',
        latitude: prevFormData.postAddressData?.latitude,
        longitude: prevFormData.postAddressData?.longitude,
      };

      // API 요청 데이터 준비
      const requestData = {
        post_title: prevFormData.postTitle || '',
        post_content: prevFormData.postContent || '',
        prefer_price: Number(prevFormData.preferPrice) || 0,
        post_address_data: addressData,
        post_tags: prevFormData.postTags || [],
        main_image: moveResponse.data.moved_images[0]?.image_url || '',
        detail_images: moveResponse.data.moved_images
          .slice(1)
          .map((img: { image_url: string }) => img.image_url),
      };

      console.log('6. 최종 요청 데이터:', requestData);

      // 요청 데이터 유효성 검사
      if (!requestData.post_title) {
        showToast('제목을 입력해주세요.');
        return;
      }
      if (!requestData.post_content) {
        showToast('내용을 입력해주세요.');
        return;
      }
      if (!requestData.prefer_price || requestData.prefer_price <= 0) {
        showToast('유효한 가격을 입력해주세요.');
        return;
      }
      if (!requestData.post_address_data.address) {
        showToast('주소를 입력해주세요.');
        return;
      }
      if (!requestData.main_image) {
        showToast('대표 이미지를 업로드해주세요.');
        return;
      }
      if (requestData.post_tags.length === 0) {
        showToast('태그를 하나 이상 선택해주세요.');
        return;
      }

      const response = await registerStorage(requestData);

      if (response.success) {
        console.log('보관소 등록 성공:', response);
        // 이미지 관련 데이터를 제외한 데이터만 로컬 스토리지에서 제거
        localStorage.removeItem('storage_register_basic');
        localStorage.removeItem('storage_register_details');
        localStorage.removeItem('storage_register_images');
        setPostId(response.id); // 성공 응답에서 post_id 저장

        openConfirmModal();
      } else {
        showToast(response?.message || '보관소 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('보관소 등록 실패:', error);
      showToast('보관소 등록에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 등록 확인 처리
  const handleConfirmConfirm = () => {
    if (postId) {
      // post_id가 있으면 상세 페이지로 이동
      navigate(`/storages/${postId}`);
    } else {
      // post_id가 없으면 기존처럼 내 보관소 페이지로 이동
      navigate('/storages');
    }
  };

  // 취소 처리
  const handleConfirmCancel = () => {
    navigate('/');
    navigate(ROUTES.HOME);
  };

  // 모달 내용 컴포넌트 - 등록 확인
  const confirmModalContent = (
    <div style={{ textAlign: 'center' }}>
      <span style={{ color: '#010048', fontSize: '16px', fontWeight: 700 }}></span>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>
        보관장소가 등록되었습니다!
      </span>
    </div>
  );

  return (
    <>
      {/* 상단 헤더 */}
      <Header title="보관소 등록" showBackButton={true} onBack={handleBack} />

      {/* 등록 완료 확인 모달 */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        content={confirmModalContent}
        cancelText="홈으로 가기"
        confirmText="내 보관소로 이동"
        onCancel={handleConfirmCancel}
        onConfirm={handleConfirmConfirm}
      />

      {/* 로딩 오버레이 */}
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      {/* 토스트 메시지 */}
      <Toast message={toastMessage} visible={toastVisible} />

      <RegistrationContainer>
        <Container>
          {/* 프로그레스 바 */}
          <ProgressContainer>
            <ProgressBackground>
              <ProgressFill />
            </ProgressBackground>
            <ProgressText>3/3</ProgressText>
          </ProgressContainer>

          {/* 폼 컨테이너 */}
          <FormContainer>
            {/* 대표 이미지 업로드 */}
            <SectionLabel>
              <LabelText>대표이미지</LabelText>
              <RequiredMark>*</RequiredMark>
            </SectionLabel>

            <MainImageUploadArea>
              {mainImage ? (
                <UploadedImageContainer>
                  <UploadedMainImage src={mainImage} alt="대표 이미지" />
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
            <SectionLabel>
              <LabelText>이미지</LabelText>
              <RequiredMark>*</RequiredMark>
            </SectionLabel>

            <DetailImageUploadArea>
              {detailImages.length > 0 ? (
                <DetailImagesScrollContainer>
                  {detailImages.map((img, index) => (
                    <DetailImageItem key={index}>
                      <DetailImage src={img} alt={`추가 이미지 ${index + 1}`} />
                      <DeleteImageButton onClick={() => handleDeleteDetailImage(index)}>
                        ×
                      </DeleteImageButton>
                    </DetailImageItem>
                  ))}
                  {detailImages.length < 4 && (
                    <DetailImageItem
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
                    </DetailImageItem>
                  )}
                </DetailImagesScrollContainer>
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
            </DetailImageUploadArea>

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

          {/* 완료 버튼 */}
          <CompleteButton onClick={handleComplete}>완료</CompleteButton>
        </Container>
      </RegistrationContainer>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </>
  );
};

export default Registration3;
