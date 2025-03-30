import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../../../components/layout/Header';
import BottomNavigation from '../../../../components/layout/BottomNavigation';
import Modal from '../../../../components/common/Modal';
import Toast from '../../../../components/common/Toast';
import {
  registerStorage,
  base64ToFile,
  StorageRegistrationRequest,
} from '../../../../services/api/modules/storage';
import { DaumAddressData } from '../../../../services/KakaoMapService';

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
  width: 375px;
  height: calc(100vh - 166px); /* 네비게이션 바 높이 제외 */
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
  width: 349px;
  height: 47px;
  position: relative;
  left: 13px;
  margin-top: 30px;
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
  postAddressData?: DaumAddressData;

  // Registration2 데이터
  storageLocation: '실내' | '실외';
  selectedItemTypes: string[];
  selectedStorageTypes: string[];
  selectedDurationOptions: string[];
  isValuableSelected: boolean;
  postTags: string[]; // 태그 문자열 배열로 변경
}

const Registration3: React.FC = () => {
  // 라우터 관련 훅
  const navigate = useNavigate();
  const location = useLocation();

  // 이전 단계에서 전달받은 데이터
  const [prevFormData, setPrevFormData] = useState<CombinedFormData | null>(null);

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

  // 첫 렌더링 체크 (useEffect 첫 실행시 저장 방지)
  const [isInitialRender, setIsInitialRender] = useState(true);

  // 이전 단계 데이터 로드
  useEffect(() => {
    if (location.state) {
      setPrevFormData(location.state as CombinedFormData);
      console.log('이전 단계 데이터 로드됨:', location.state);
    }
  }, [location.state]);

  // 로컬 스토리지에서 이미지 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('registration_step3');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.mainImage) setMainImage(parsedData.mainImage);
        if (parsedData.detailImages) setDetailImages(parsedData.detailImages);
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }

    // 초기 렌더링 완료 표시
    setIsInitialRender(false);
  }, []);

  // 이미지 상태 변경 시 로컬 스토리지에 자동 저장
  useEffect(() => {
    // 초기 렌더링 시에는 저장하지 않음
    if (isInitialRender) return;

    saveToLocalStorage();
  }, [mainImage, detailImages]);

  // 로컬 스토리지에 데이터 저장
  const saveToLocalStorage = () => {
    const dataToSave = {
      mainImage,
      detailImages,
    };

    localStorage.setItem('registration_step3', JSON.stringify(dataToSave));
  };

  // 토스트 메시지 표시 함수
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

  // 메인 이미지 변경 핸들러
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 원본 파일 저장
      setMainImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setMainImage(imageData);
        // useEffect에서 로컬 스토리지 저장 처리됨
      };
      reader.readAsDataURL(file);
    }
  };

  // 서브 이미지 변경 핸들러
  const handleDetailImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // 최대 4개까지만 허용
      const remainingSlots = 4 - detailImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      if (filesToProcess.length > 0) {
        // 원본 파일 저장
        setDetailImageFiles(prev => [...prev, ...filesToProcess]);

        const newImages = [...detailImages];
        let processed = 0;

        filesToProcess.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newImages.push(reader.result as string);
            processed++;

            if (processed === filesToProcess.length) {
              setDetailImages(newImages);
              // useEffect에서 로컬 스토리지 저장 처리됨
            }
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  // 메인 이미지 삭제 핸들러
  const handleDeleteMainImage = () => {
    setMainImage(null);
    setMainImageFile(null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
    // useEffect에서 로컬 스토리지 저장 처리됨
  };

  // 서브 이미지 삭제 핸들러
  const handleDeleteDetailImage = (index: number) => {
    setDetailImages(prev => prev.filter((_, i) => i !== index));
    setDetailImageFiles(prev => prev.filter((_, i) => i !== index));

    if (detailImagesInputRef.current) {
      detailImagesInputRef.current.value = '';
    }
    // useEffect에서 로컬 스토리지 저장 처리됨
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    // 변경 사항은 로컬 스토리지에 자동 저장됨
    navigate('/registration/step2');
  };

  // 등록 확인 모달 열기
  const openConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    // 필수 입력값 검증
    if (!mainImage) {
      showToast('대표 이미지를 업로드해주세요.');
      return;
    }

    if (!prevFormData) {
      showToast('이전 단계 데이터가 없습니다. 다시 시도해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      // 이미지 파일 준비
      let mainImageFileObj: File;
      if (mainImageFile) {
        mainImageFileObj = mainImageFile;
      } else if (mainImage) {
        mainImageFileObj = base64ToFile(mainImage, 'main-image.jpg');
      } else {
        throw new Error('대표 이미지가 없습니다.');
      }

      // 상세 이미지 파일 배열 준비
      const detailImageFilesArray: File[] = [];
      if (detailImageFiles.length === detailImages.length) {
        detailImageFilesArray.push(...detailImageFiles);
      } else {
        for (let i = 0; i < detailImages.length; i++) {
          if (detailImageFiles[i]) {
            detailImageFilesArray.push(detailImageFiles[i]);
          } else {
            detailImageFilesArray.push(base64ToFile(detailImages[i], `detail-image-${i}.jpg`));
          }
        }
      }

      // API 요청 데이터 준비
      const requestData: StorageRegistrationRequest = {
        postTitle: prevFormData.postTitle,
        postContent: prevFormData.postContent,
        preferPrice: Number(prevFormData.preferPrice), // 숫자로 변환
        postAddressData: prevFormData.postAddressData,
        postTags: prevFormData.postTags,
        storageLocation: prevFormData.storageLocation, // 추가
      };

      console.log('API 요청 데이터:', requestData);
      console.log('메인 이미지:', mainImageFileObj);
      console.log('상세 이미지:', detailImageFilesArray);

      // API 호출
      const response = await registerStorage(requestData, mainImageFileObj, detailImageFilesArray);

      if (response.success) {
        console.log('보관소 등록 성공:', response);
        localStorage.removeItem('registration_step1');
        localStorage.removeItem('registration_step2');
        localStorage.removeItem('registration_step3');
        openConfirmModal();
      } else {
        showToast(response.message || '보관소 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('보관소 등록 오류:', error);
      showToast('보관소 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 등록 확인 처리 (내 보관소로 이동)
  const handleConfirmConfirm = () => {
    navigate('/myplace');
  };

  // 등록 확인 취소 처리 (홈으로 이동)
  const handleConfirmCancel = () => {
    navigate('/');
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
          <CompleteButton onClick={handleSubmit}>완료</CompleteButton>
        </Container>
      </RegistrationContainer>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="보관소" />
    </>
  );
};

export default Registration3;
