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
    const savedData = localStorage.getItem('storage_edit_images');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.mainImage) setMainImage(parsedData.mainImage);
        if (parsedData.detailImages) setDetailImages(parsedData.detailImages);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, []);

  // 상태 변경시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(
      'storage_edit_images',
      JSON.stringify({
        mainImage,
        detailImages,
      }),
    );
  }, [mainImage, detailImages]);

  // 이전 단계 데이터 로드
  useEffect(() => {
    if (location.state) {
      setPrevFormData(location.state as FormData);
      console.log('이전 단계 데이터 로드됨:', location.state);
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
    if (!mainImageFile) {
      showToast('대표 이미지를 업로드해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('보관소 수정 시작...');

      // 로컬 스토리지에서 모든 데이터 수집
      const basicData = JSON.parse(localStorage.getItem('storage_edit_basic') || '{}');
      const detailsData = JSON.parse(localStorage.getItem('storage_edit_details') || '{}');

      // 주소 데이터 검증
      if (!basicData.postAddressData) {
        showToast('주소 정보가 없습니다. 다시 시도해주세요.');
        return;
      }

      // 태그 데이터 처리
      const tags = new Set<string>();

      // 기존 태그 추가
      if (detailsData.postTags) {
        detailsData.postTags.forEach((tag: string) => tags.add(tag));
      }

      // 보관 위치 태그
      if (detailsData.storageLocation) {
        tags.add(detailsData.storageLocation);
      }

      // 물건 유형 태그
      if (detailsData.selectedItemTypes) {
        detailsData.selectedItemTypes.forEach((type: string) => tags.add(type));
      }

      // 보관 방식 태그
      if (detailsData.selectedStorageTypes) {
        detailsData.selectedStorageTypes.forEach((type: string) => tags.add(type));
      }

      // 보관 기간 태그
      if (detailsData.selectedDurationOptions) {
        detailsData.selectedDurationOptions.forEach((option: string) => tags.add(option));
      }

      // 귀중품 태그
      if (detailsData.isValuableSelected) {
        tags.add('고가품');
      }

      // postData 준비
      const postData = {
        post_title: basicData.postTitle,
        post_content: basicData.postContent,
        post_address_data: basicData.postAddressData, // 주소 데이터 그대로 사용
        prefer_price: Number(basicData.preferPrice),
        post_tags: Array.from(tags).filter(Boolean), // null, undefined, 빈 문자열 제거
      };

      console.log('수정할 데이터:', {
        postData,
        mainImage: mainImageFile.name,
        detailImages: detailImageFiles.map(f => f.name),
      });

      const response = await updateStorage(id || '', postData, mainImageFile, detailImageFiles);

      if (response.success) {
        // 성공 시 로컬 스토리지 데이터 삭제
        localStorage.removeItem('storage_edit_basic');
        localStorage.removeItem('storage_edit_details');
        localStorage.removeItem('storage_edit_images');

        // 성공 모달 표시
        openConfirmModal();
      } else {
        showToast(response.message || '보관소 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('보관소 수정 오류:', error);
      showToast(error instanceof Error ? error.message : '보관소 수정 중 오류가 발생했습니다.');
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
    navigate(`/storage/${id}`);
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
