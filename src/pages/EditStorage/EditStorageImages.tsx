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
import axios from 'axios';
import { updateStorage } from '../../services/api/modules/storage';
import { uploadImage, uploadMultipleImages } from '../../services/api/modules/image';
import { base64ToFile } from '../../services/api/modules/storage';

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

  // 이전 단계에서 전달받은 데이터
  const [prevFormData, setPrevFormData] = useState<FormData | null>(null);

  // 파일 입력 참조
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const detailImagesInputRef = useRef<HTMLInputElement>(null);

  // 이미지 상태 관리
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

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    // 이미지 데이터 불러오기
    const savedImageData = localStorage.getItem('storage_edit_images');
    if (savedImageData) {
      try {
        const parsedImageData = JSON.parse(savedImageData);
        if (parsedImageData.mainImage) setMainImage(parsedImageData.mainImage);
        if (parsedImageData.detailImages) setDetailImages(parsedImageData.detailImages);
      } catch (error) {
        console.error('Error parsing saved image data:', error);
      }
    }

    // 기본 데이터 불러오기
    const savedBasicData = localStorage.getItem('storage_edit_basic');
    const savedDetailsData = localStorage.getItem('storage_edit_details');

    if (savedBasicData || savedDetailsData) {
      try {
        const basicData = savedBasicData ? JSON.parse(savedBasicData) : {};
        const detailsData = savedDetailsData ? JSON.parse(savedDetailsData) : {};

        // 이전 단계 데이터 설정
        setPrevFormData({
          ...basicData,
          ...detailsData,
        });

        console.log('로컬 스토리지에서 데이터 로드됨:', {
          basicData,
          detailsData,
        });
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  // 상태 변경시 로컬 스토리지에 저장
  useEffect(() => {
    // 이미지 데이터 저장
    localStorage.setItem(
      'storage_edit_images',
      JSON.stringify({
        mainImage,
        detailImages,
      }),
    );

    // 이전 단계 데이터가 있으면 함께 저장
    if (prevFormData) {
      // storage_edit_details에 이미지 데이터를 포함하여 저장
      const detailsData = JSON.parse(localStorage.getItem('storage_edit_details') || '{}');
      const updatedDetailsData = {
        ...detailsData,
        mainImage,
        detailImages,
      };
      localStorage.setItem('storage_edit_details', JSON.stringify(updatedDetailsData));

      console.log('이미지 데이터와 함께 details 데이터 업데이트:', updatedDetailsData);
    }
  }, [mainImage, detailImages, prevFormData]);

  // 이전 단계 데이터 로드
  useEffect(() => {
    if (location.state) {
      setPrevFormData(location.state as FormData);
      console.log('이전 단계 데이터 로드됨:', location.state);
    } else {
      // location.state가 없으면 로컬 스토리지에서 데이터 로드
      const basicData = JSON.parse(localStorage.getItem('storage_edit_basic') || '{}');
      const detailsData = JSON.parse(localStorage.getItem('storage_edit_details') || '{}');

      if (Object.keys(basicData).length > 0 || Object.keys(detailsData).length > 0) {
        const combinedData = {
          ...basicData,
          ...detailsData,
        };
        setPrevFormData(combinedData);
        console.log('로컬 스토리지에서 데이터 로드됨:', combinedData);
      }
    }
  }, [location.state]);

  // API에서 이미지 데이터 가져오기
  useEffect(() => {
    const fetchPostData = async () => {
      try {
        console.log('=== 이미지 데이터 가져오기 시작 ===');
        console.log('요청 URL:', `/api/posts/${id}`);

        const response = await client.get(`/api/posts/${id}`);
        console.log('API 응답:', response.data);

        if (response.data.success) {
          const postData = response.data.data;
          console.log('=== 받아온 게시물 데이터 ===');
          console.log('전체 데이터:', postData);
          console.log('이미지 배열:', postData.post_images);

          // 이미지 설정
          if (postData.post_images && postData.post_images.length > 0) {
            console.log('이미지 개수:', postData.post_images.length);
            console.log('이미지 URL 목록:', postData.post_images);

            // 첫 번째 이미지를 메인 이미지로 설정
            setMainImage(postData.post_images[0]);
            console.log('메인 이미지 설정:', postData.post_images[0]);

            // 나머지 이미지를 상세 이미지로 설정
            const detailImages = postData.post_images.slice(1);
            setDetailImages(detailImages);
            console.log('상세 이미지 설정:', detailImages);
          } else {
            console.log('이미지가 없습니다.');
          }
        } else {
          console.error('게시물 데이터 가져오기 실패:', response.data.message);
          showToast(response.data.message || '데이터를 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('=== 이미지 데이터 가져오기 오류 ===');
        console.error('에러 객체:', error);
        const axiosError = error as AxiosError<ErrorResponse>;
        console.error('에러 응답:', axiosError.response?.data);
        showToast(axiosError.response?.data?.message || '데이터를 불러오는데 실패했습니다.');
      }
    };

    if (id) {
      console.log('=== 이미지 데이터 가져오기 시작 ===');
      console.log('게시물 ID:', id);
      fetchPostData();
    }
  }, [id]);

  // 토스트 메시지 표시 함수
  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // 메인 이미지 업로드 핸들러
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImage(URL.createObjectURL(file));
    }
  };

  // 상세 이미지 업로드 핸들러
  const handleDetailImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // 현재 이미지 개수 + 새로 추가할 이미지 개수가 4개를 초과하는지 체크
      if (detailImages.length + files.length > 4) {
        showToast('상세 이미지는 최대 4개까지 업로드할 수 있습니다.');
        return;
      }
      const newFiles = Array.from(files);
      setDetailImageFiles(newFiles);
      const newDetails = newFiles.map(file => URL.createObjectURL(file));
      setDetailImages(newDetails);
    }
  };

  // 메인 이미지 삭제 핸들러
  const handleMainImageDelete = () => {
    setMainImage(null);
    setMainImageFile(null);
  };

  // 상세 이미지 삭제 핸들러
  const handleDetailImageDelete = (index: number) => {
    const newDetails = detailImages.filter((_, i) => i !== index);
    setDetailImages(newDetails);
    const newFiles = detailImageFiles.filter((_, i) => i !== index);
    setDetailImageFiles(newFiles);
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    navigate(ROUTES.STORAGE_EDIT_DETAILS.replace(':id', id || ''));
  };

  // 완료 핸들러
  const handleComplete = async () => {
    if (!prevFormData) {
      showToast('이전 단계 데이터가 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('보관소 수정 시작...');
      console.log('이전 단계 데이터:', prevFormData);

      // 이미지 파일 준비
      let mainImageFileObj: File | null = null;
      if (mainImageFile) {
        mainImageFileObj = mainImageFile;
        console.log('메인 이미지 파일:', mainImageFileObj);
      } else if (mainImage && !mainImage.startsWith('http')) {
        mainImageFileObj = base64ToFile(mainImage, 'main-image.jpg');
        console.log('메인 이미지 base64에서 파일로 변환:', mainImageFileObj);
      }

      // 상세 이미지 파일 배열 준비
      const detailImageFilesArray: File[] = [];
      if (detailImageFiles.length > 0) {
        detailImageFilesArray.push(...detailImageFiles);
        console.log('상세 이미지 파일 배열:', detailImageFilesArray);
      } else if (detailImages.length > 0) {
        for (let i = 0; i < detailImages.length; i++) {
          if (!detailImages[i].startsWith('http')) {
            detailImageFilesArray.push(base64ToFile(detailImages[i], `detail-image-${i}.jpg`));
          }
        }
        console.log('상세 이미지 base64에서 파일로 변환:', detailImageFilesArray);
      }

      // 이미지 업로드
      let mainImageUrl = mainImage;
      if (mainImageFileObj) {
        mainImageUrl = await uploadImage(mainImageFileObj, 'post', true);
      }

      let detailImageUrls = detailImages;
      if (detailImageFilesArray.length > 0) {
        const newDetailImageUrls = await uploadMultipleImages(
          detailImageFilesArray,
          'post',
          new Array(detailImageFilesArray.length).fill(false),
        );
        detailImageUrls = [
          ...detailImageUrls.filter(url => url.startsWith('http')),
          ...newDetailImageUrls,
        ];
      }

      // 주소 데이터 준비
      const addressData: DaumAddressData = {
        address: prevFormData.postAddress || '',
        address_english: '',
        address_type: 'J',
        apartment: 'N',
        auto_jibun_address: prevFormData.postAddress || '',
        auto_jibun_address_english: '',
        auto_road_address: prevFormData.postAddress || '',
        auto_road_address_english: '',
        bcode: prevFormData.postAddressData?.bcode || '',
        bname: prevFormData.postAddress?.split(' ').slice(-1)[0] || '',
        bname1: prevFormData.postAddress?.split(' ')[1] || '',
        bname1_english: '',
        bname2: prevFormData.postAddress?.split(' ')[2] || '',
        bname2_english: '',
        bname_english: '',
        building_code: prevFormData.postAddressData?.building_code || '',
        building_name: prevFormData.postAddressData?.building_name || '',
        hname: '',
        jibun_address: prevFormData.postAddress || '',
        jibun_address_english: '',
        no_selected: 'N',
        postcode: prevFormData.postAddressData?.zonecode || '',
        postcode1: prevFormData.postAddressData?.zonecode?.slice(0, 3) || '',
        postcode2: prevFormData.postAddressData?.zonecode?.slice(3) || '',
        postcode_seq: '',
        query: prevFormData.postAddress || '',
        road_address: prevFormData.postAddress || '',
        road_address_english: '',
        roadname: prevFormData.postAddress?.split(' ').slice(-2).join(' ') || '',
        roadname_code: prevFormData.postAddressData?.roadname_code || '',
        roadname_english: '',
        sido: prevFormData.postAddress?.split(' ')[0] || '',
        sido_english: '',
        sigungu: prevFormData.postAddress?.split(' ')[1] || '',
        sigungu_code: prevFormData.postAddressData?.sigungu_code || '',
        sigungu_english: '',
        user_language_type: 'K',
        user_selected_type: 'J',
        zonecode: prevFormData.postAddressData?.zonecode || '',
      };

      // API 요청 데이터 준비
      const requestData = {
        post_title: prevFormData.postTitle || '',
        post_content: prevFormData.postContent || '',
        prefer_price: Number(prevFormData.preferPrice) || 0,
        post_address_data: addressData,
        post_tags: prevFormData.postTags || [],
        main_image: mainImageUrl,
        detail_images: detailImageUrls,
      };

      // ... rest of the code ...
    } catch (error) {
      console.error('보관소 수정 오류:', error);
      showToast('보관소 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 등록 완료 확인 모달
  const openConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCancel = () => {
    setIsConfirmModalOpen(false);
  };

  const handleConfirmConfirm = () => {
    setIsConfirmModalOpen(false);
    navigate(`/storages/${id}`);
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
              {mainImage ? (
                <UploadedImageContainer>
                  <UploadedMainImage src={mainImage} alt="대표 이미지" />
                  <DeleteButton onClick={handleMainImageDelete}>×</DeleteButton>
                </UploadedImageContainer>
              ) : (
                <>
                  <UploadGuideText>
                    이미지를 업로드해주세요
                    <br />
                    (필수)
                  </UploadGuideText>
                  <UploadButton onClick={() => mainImageInputRef.current?.click()}>
                    파일 업로드
                  </UploadButton>
                </>
              )}
            </MainImageUploadArea>

            {/* 숨겨진 파일 업로드 입력 필드 */}
            <input
              type="file"
              ref={mainImageInputRef}
              onChange={handleMainImageUpload}
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
                      <DeleteButton onClick={() => handleDetailImageDelete(index)}>×</DeleteButton>
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
                      onClick={() => detailImagesInputRef.current?.click()}
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
                  <UploadButton onClick={() => detailImagesInputRef.current?.click()}>
                    파일 업로드
                  </UploadButton>
                </>
              )}
            </DetailImageUploadArea>

            {/* 숨겨진 파일 업로드 입력 필드 (다중 선택) */}
            <input
              type="file"
              ref={detailImagesInputRef}
              onChange={handleDetailImageUpload}
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
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      {/* 토스트 메시지 */}
      {toastVisible && <Toast message={toastMessage} visible={toastVisible} />}

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
    </>
  );
};

export default EditStorageImages;
