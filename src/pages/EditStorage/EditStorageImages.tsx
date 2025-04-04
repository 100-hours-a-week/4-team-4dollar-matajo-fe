import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import { ROUTES } from '../../constants/routes';
import { DaumAddressData } from '../../services/KakaoMapService';
import client from '../../services/api/client';
import type { AxiosError } from 'axios';
import { updateStorage } from '../../services/api/modules/storage';
import {
  getPresignedUrl,
  moveImages,
  ImageData,
  uploadImageWithPresignedUrl,
  uploadMultipleImages,
  StorageData,
} from '../../services/api/modules/image';

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
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 136px;
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
  width: 333px;
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
const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

// 완료 버튼
const CompleteButton = styled.button`
  width: 349px;
  height: 47px;
  position: absolute;
  left: 13px;
  bottom: 90px;
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
    post_images: string[];
  };
}

// 에러 응답 타입 정의
interface ErrorResponse {
  message: string;
  success: boolean;
}

// 폼 데이터 타입 정의
interface FormData {
  postId: string;
  postAddress: string;
  postTitle: string;
  postContent: string;
  preferPrice: string;
  postAddressData?: DaumAddressData;
  storageLocation: '실내' | '실외';
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
  postTags: string[];
}

const EditStorageImages: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 통합된 상태 관리
  const [state, setState] = useState({
    updatedMainImage: null as string | null,
    updatedDetailImages: [] as string[],
    prevFormData: null as FormData | null,
    mainImage: null as string | null,
    detailImages: [] as string[],
    mainImageData: null as ImageData | null,
    detailImagesData: [] as ImageData[],
    mainImageFile: null as File | null,
    detailImagesFile: [] as File[],
    isLoading: false,
    toastVisible: false,
    toastMessage: '',
    isConfirmModalOpen: false,
  });

  // 파일 입력 참조
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const detailImagesInputRef = useRef<HTMLInputElement>(null);

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const loadData = () => {
      const savedImageData = localStorage.getItem('storage_edit_images_changed');
      if (savedImageData) {
        const parsedData: StorageData = JSON.parse(savedImageData);
        if (parsedData.mainImage) {
          setState(prev => ({ ...prev, mainImageData: parsedData.mainImage }));
          console.log('changed images storage 메인이미지 불러옴');
        }
        if (parsedData.detailImages) {
          setState(prev => ({ ...prev, detailImagesData: parsedData.detailImages }));
          console.log('changed images storage 서브이미지 불러옴');
        }
      }

      const savedBasicData = localStorage.getItem('storage_edit_basic');
      const savedDetailsData = localStorage.getItem('storage_edit_details');
      if (savedBasicData || savedDetailsData) {
        const basicData = savedBasicData ? JSON.parse(savedBasicData) : {};
        const detailsData = savedDetailsData ? JSON.parse(savedDetailsData) : {};
        setState(prev => ({ ...prev, prevFormData: { ...basicData, ...detailsData } }));
      }
    };
    loadData();
  }, []);

  // API에서 이미지 데이터 가져오기
  useEffect(() => {
    const fetchPostData = async () => {
      if (!id) return;
      try {
        console.log('=== 이미지 데이터 가져오기 시작 ===');
        console.log('요청 URL:', `/api/posts/${id}`);
        const response = await client.get(`/api/posts/${id}`);
        console.log('API 응답:', response.data);

        if (response.data.success) {
          const postData = response.data.data;
          setState(prev => ({
            ...prev,
            mainImage: postData.post_images[0],
            updatedMainImage: postData.post_images[0],
            detailImages: postData.post_images.slice(1),
            updatedDetailImages: postData.post_images.slice(1),
          }));
        }
      } catch (error) {
        console.error('=== 이미지 데이터 가져오기 오류 ===');
        console.error('에러 객체:', error);
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('에러 응답:', axiosError.response?.data);
        showToast(axiosError.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
      }
    };
    fetchPostData();
  }, [id]);

  // 완료 핸들러
  const handleComplete = async () => {
    if (!state.prevFormData || !id) {
      showToast('이전 단계 데이터가 없습니다. 다시 시도해주세요.');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // 최종적으로 사용할 이미지 URL들
      let finalMainImage = state.mainImage;
      let finalDetailImages = [...state.detailImages];

      // 새로 업로드된 이미지가 있는지 확인
      const hasNewImages = state.mainImageData || state.detailImagesData.length > 0;

      if (hasNewImages) {
        const tempKeys = [
          ...(state.mainImageData ? [state.mainImageData.temp_key] : []),
          ...state.detailImagesData.map(img => img.temp_key),
        ];

        const mainFlags = [
          ...(state.mainImageData ? [true] : []),
          ...new Array(state.detailImagesData.length).fill(false),
        ];

        // 새 이미지들만 moveImages로 처리
        const moveResponse = await moveImages(tempKeys, 'post', mainFlags);

        if (moveResponse.data && moveResponse.data.moved_images) {
          // 메인 이미지가 변경되었는지 확인
          if (state.mainImageData) {
            // 이동된 메인 이미지 URL을 사용
            finalMainImage = moveResponse.data.moved_images[0].image_url;

            // 상세 이미지 처리 시작 인덱스 조정
            const detailImgStartIndex = state.mainImageData ? 1 : 0;

            // 새로 업로드된 상세 이미지가 있다면
            if (state.detailImagesData.length > 0) {
              // 이동된 상세 이미지 URL들을 매핑
              const newDetailImageUrls = moveResponse.data.moved_images
                .slice(detailImgStartIndex)
                .map(img => img.image_url);

              // 기존 상세 이미지(변경되지 않은)와 새 상세 이미지 병합
              // 여기서는 mainImage가 변경되고 detailImages도 변경된 경우
              finalDetailImages = newDetailImageUrls;
            }
          } else if (state.detailImagesData.length > 0) {
            // 메인 이미지는 변경되지 않았고 상세 이미지만 변경된 경우
            const newDetailImageUrls = moveResponse.data.moved_images.map(img => img.image_url);

            finalDetailImages = newDetailImageUrls;
          }
        }
      }

      // requestData를 생성하고 handleCompleteRequest를 호출
      const addressData: DaumAddressData = {
        address: state.prevFormData?.postAddress || '',
        address_english: '',
        address_type: 'J',
        apartment: 'N',
        auto_jibun_address: state.prevFormData?.postAddress || '',
        auto_jibun_address_english: '',
        auto_road_address: state.prevFormData?.postAddress || '',
        auto_road_address_english: '',
        bcode: state.prevFormData?.postAddressData?.bcode || '',
        bname: state.prevFormData?.postAddress?.split(' ').slice(-1)[0] || '',
        bname1: state.prevFormData?.postAddress?.split(' ')[1] || '',
        bname1_english: '',
        bname2: state.prevFormData?.postAddress?.split(' ')[2] || '',
        bname2_english: '',
        bname_english: '',
        building_code: state.prevFormData?.postAddressData?.building_code || '',
        building_name: state.prevFormData?.postAddressData?.building_name || '',
        hname: '',
        jibun_address: state.prevFormData?.postAddress || '',
        jibun_address_english: '',
        no_selected: 'N',
        postcode: state.prevFormData?.postAddressData?.zonecode || '',
        postcode1: state.prevFormData?.postAddressData?.zonecode?.slice(0, 3) || '',
        postcode2: state.prevFormData?.postAddressData?.zonecode?.slice(3) || '',
        postcode_seq: '',
        query: state.prevFormData?.postAddress || '',
        road_address: state.prevFormData?.postAddress || '',
        road_address_english: '',
        roadname: state.prevFormData?.postAddress?.split(' ').slice(-2).join(' ') || '',
        roadname_code: state.prevFormData?.postAddressData?.roadname_code || '',
        roadname_english: '',
        sido: state.prevFormData?.postAddress?.split(' ')[0] || '',
        sido_english: '',
        sigungu: state.prevFormData?.postAddress?.split(' ')[1] || '',
        sigungu_code: state.prevFormData?.postAddressData?.sigungu_code || '',
        sigungu_english: '',
        user_language_type: 'K',
        user_selected_type: 'J',
        zonecode: state.prevFormData?.postAddressData?.zonecode || '',
      };

      // 최종 요청 데이터 생성
      const requestData = {
        post_title: state.prevFormData?.postTitle || '',
        post_content: state.prevFormData?.postContent || '',
        prefer_price: Number(state.prevFormData?.preferPrice) || 0,
        post_address_data: addressData,
        post_tags: state.prevFormData?.postTags || [],
        main_image: finalMainImage || '',
        detail_images: finalDetailImages || [],
      };

      await handleCompleteRequest(requestData);
    } catch (error) {
      console.error('이미지 처리 중 오류:', error);
      showToast('이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 완료 요청 핸들러
  const handleCompleteRequest = async (requestData: any) => {
    try {
      const response = await updateStorage(String(id), requestData);
      if (response.success) {
        showToast('보관소가 성공적으로 수정되었습니다!');
        openConfirmModal();
      } else {
        showToast('보관소 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error updating storage:', error);
      showToast('보관소 수정 중 오류가 발생했습니다.');
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setState(prev => ({ ...prev, toastMessage: message, toastVisible: true }));
    setTimeout(() => setState(prev => ({ ...prev, toastVisible: false })), 3000);
  };

  // 모달 열기
  const openConfirmModal = () => {
    setState(prev => ({ ...prev, isConfirmModalOpen: true }));
  };

  // 모달 내용 컴포넌트
  const confirmModalContent = (
    <div style={{ textAlign: 'center' }}>
      <span style={{ color: '#010048', fontSize: '16px', fontWeight: 700 }}></span>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>
        보관장소가 수정되었습니다!
      </span>
    </div>
  );

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(ROUTES.STORAGE_EDIT_DETAILS.replace(':id', id || ''));
  };

  // 메인 이미지 업로드 핸들러
  const handleMainImageUpload = () => {
    if (mainImageInputRef.current) {
      console.log('메인이미지 업로드 클릭');
      mainImageInputRef.current.click();
    }
  };

  // 서브 이미지 업로드 핸들러
  const handleDetailImagesUpload = () => {
    if (detailImagesInputRef.current) {
      console.log('서브이미지 업로드 클릭');
      detailImagesInputRef.current.click();
    }
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
      setState(prev => ({
        ...prev,
        mainImageData: {
          image_url: presignedUrlResponse.data.image_url,
          temp_key: presignedUrlResponse.data.temp_key,
        },
        mainImageFile: file,
        mainImage: presignedUrlResponse.data.image_url,
      }));

      console.log('메인이미지 업로드 완료');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showToast('이미지 업로드에 실패했습니다.');
    }
  };

  const handleDetailImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 최대 4장까지 가능
    const remainingSlots = 4 - state.detailImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    try {
      const newImagesData: ImageData[] = [];
      const newImages: string[] = [];
      const newFiles: File[] = [];

      for (const file of filesToProcess) {
        // presigned URL 요청
        const presignedUrlResponse = await getPresignedUrl(file.name, file.type, 'post');

        // S3에 이미지 업로드
        await uploadImageWithPresignedUrl(presignedUrlResponse.data.presigned_url, file);

        // 이미지 데이터 저장
        newImagesData.push({
          image_url: presignedUrlResponse.data.image_url,
          temp_key: presignedUrlResponse.data.temp_key,
        });

        // 미리보기용 이미지 URL 설정
        newImages.push(presignedUrlResponse.data.image_url);
        newFiles.push(file);
      }

      setState(prev => ({
        ...prev,
        detailImages: [...prev.detailImages, ...newImages],
        detailImagesData: [...prev.detailImagesData, ...newImagesData],
        detailImagesFile: [...prev.detailImagesFile, ...newFiles],
      }));

      console.log('서브이미지 업로드 완료');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      showToast('이미지 업로드에 실패했습니다.');
    }
  };

  // 메인 이미지 삭제 핸들러
  const handleMainImageDelete = () => {
    setState(prev => ({ ...prev, mainImage: null, mainImageFile: null }));
    console.log('메인이미지 삭제 완료');
  };

  // 상세 이미지 삭제 핸들러
  const handleDetailImageDelete = (index: number) => {
    const newDetails = state.detailImages.filter((_, i) => i !== index);
    const newFiles = state.detailImagesFile.filter((_, i) => i !== index);
    setState(prev => ({ ...prev, detailImages: newDetails, detailImagesFile: newFiles }));
    console.log('서브이미지 삭제 완료');
  };

  // 모달 취소 핸들러
  const handleConfirmCancel = () => {
    setState(prev => ({ ...prev, isConfirmModalOpen: false }));
  };

  // 모달 확인 핸들러
  const handleConfirmConfirm = () => {
    setState(prev => ({ ...prev, isConfirmModalOpen: false }));
    navigate(`/storages/${id}`);
  };

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
              {state.mainImage ? (
                <UploadedImageContainer>
                  <UploadedMainImage src={state.mainImage} alt="대표 이미지" />
                  <DeleteButton onClick={handleMainImageDelete}>×</DeleteButton>
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
              {state.detailImages.length > 0 ? (
                <DetailImagesScrollContainer>
                  {state.detailImages.map((img, index) => (
                    <DetailImageItem key={index}>
                      <DetailImage src={img} alt={`추가 이미지 ${index + 1}`} />
                      <DeleteButton onClick={() => handleDetailImageDelete(index)}>×</DeleteButton>
                    </DetailImageItem>
                  ))}
                  {state.detailImages.length < 4 && (
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

      {/* 로딩 오버레이 */}
      {state.isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      {/* 토스트 메시지 */}
      {state.toastVisible && <Toast message={state.toastMessage} visible={state.toastVisible} />}

      {/* 등록 완료 확인 모달 */}
      <Modal
        isOpen={state.isConfirmModalOpen}
        onClose={() => setState(prev => ({ ...prev, isConfirmModalOpen: false }))}
        content={confirmModalContent}
        cancelText="홈으로 가기"
        confirmText="내 보관소로 이동"
        onCancel={handleConfirmCancel}
        onConfirm={handleConfirmConfirm}
      />
    </>
  );
};

export default EditStorageImages;
