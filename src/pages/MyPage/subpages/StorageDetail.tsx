import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Header, { HeaderDropdownOption } from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import Modal from '../../../components/common/Modal';
import KakaoMap from '../../../components/feature/map/KakaoMap';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5',
  primaryLight: '#5E5CFD',
  primaryTransparent: 'rgba(56.26, 53.49, 252.61, 0.80)',
  background: '#F5F5FF',
  darkText: '#464646',
  lightGrayText: '#9C9C9C',
  blackText: '#292929',
  borderColor: '#D9D9D9',
  dividerColor: '#D9D9D9',
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

const Container = styled.div`
  width: 100%;
  height: calc(100vh - 166px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: auto;
  padding-bottom: 40px;
  padding-top: 10px;
`;

const ContentContainer = styled.div`
  position: relative;
  padding-bottom: 30px;
`;

const ImageContainer = styled.div`
  width: 375px;
  height: 260px;
  position: relative;
  background: #eeeeee;
  overflow: hidden;
`;

const ImageSlider = styled.div<{ currentIndex: number }>`
  display: flex;
  width: 100%;
  height: 100%;
  transform: translateX(${props => -props.currentIndex * 100}%);
  transition: transform 0.3s ease-in-out;
  will-change: transform;
  touch-action: pan-y;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

const ImageSlide = styled.div`
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoSection = styled.div`
  padding: 15px 25px;
  position: relative;
`;

const Title = styled.div`
  width: 100%;
  color: black;
  font-size: 20px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 25.5px;
  letter-spacing: 0.4px;
  word-wrap: break-word;
  margin-bottom: 10px;
`;

const TagsContainer = styled.div`
  width: 100%;
  color: rgba(58, 0, 229, 0.6);
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  word-wrap: break-word;
  margin-bottom: 10px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
`;

const PriceText = styled.span`
  color: #484444;
  font-size: 17px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 21.88px;
  word-wrap: break-word;
`;

const UnitText = styled.span`
  color: #484444;
  font-size: 9px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 500;
  line-height: 21.88px;
  word-wrap: break-word;
  margin-left: 2px;
`;

const ChatButton = styled.div`
  width: 94px;
  height: 35px;
  padding: 8px 0;
  position: absolute;
  right: 25px;
  top: 50px;
  background: ${THEME.primaryTransparent};
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const ChatButtonText = styled.div`
  color: white;
  font-size: 16px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 18.84px;
  letter-spacing: 0.32px;
  word-wrap: break-word;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${THEME.dividerColor};
  margin: 15px 0;
`;

const DescriptionContainer = styled.div`
  padding: 0 25px;
  color: black;
  font-size: 13px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 17px;
  letter-spacing: 0.26px;
  word-wrap: break-word;
`;

const LocationSection = styled.div`
  padding: 15px 25px;
  position: relative;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const LocationIcon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 5px;
`;

const LocationLabel = styled.div`
  color: ${THEME.lightGrayText};
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 10.44px;
  letter-spacing: 0.24px;
  margin-right: 10px;
`;

const LocationText = styled.div`
  color: black;
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 10.44px;
  letter-spacing: 0.24px;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 125px;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 15px;
`;

const KeeperSection = styled.div`
  padding: 15px 25px;
`;

const KeeperCard = styled.div`
  width: 100%;
  height: 50px;
  border-radius: 10px;
  border: 1px #cfcffe solid;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 15px;
`;

const KeeperInfo = styled.div`
  margin-left: 45px;
  display: flex;
  flex-direction: column;
`;

const KeeperLabel = styled.div`
  color: #515151;
  font-size: 10px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 400;
  line-height: 9.85px;
  word-wrap: break-word;
  margin-bottom: 4px;
`;

const KeeperName = styled.div`
  color: #515151;
  font-size: 12px;
  font-family: 'Noto Sans KR', sans-serif;
  font-weight: 700;
  line-height: 9.85px;
  word-wrap: break-word;
`;

const KeeperImageContainer = styled.div`
  width: 36.72px;
  height: 34.56px;
  position: absolute;
  left: 15px;
  background: white;
  border-radius: 9999px;
  border: 0.3px rgba(175.69, 175.69, 175.69, 0.8) solid;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const KeeperImage = styled.img`
  width: 28px;
  height: 29px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const ImageIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 11px;
  z-index: 10;
`;

const Dot = styled.div<{ isActive: boolean }>`
  width: 10px;
  height: 9px;
  opacity: 0.8;
  background: ${props => (props.isActive ? '#9e9dfe' : '#efeff0')};
  border-radius: 9999px;
  transition: background-color 0.2s ease;
  cursor: pointer;
  padding: 8px; /* 클릭 영역 확장 */
  margin: -4px; /* 간격 유지를 위한 네거티브 마진 */
  box-sizing: content-box;

  &:hover {
    opacity: 1;
  }
`;

const ScrollToTopButton = styled.img`
  width: 59px;
  height: 55px;
  position: fixed;
  left: 310px;
  bottom: 90px;
  opacity: 0.8;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  z-index: 99;
`;

// 이미지 데이터 타입 정의
interface StorageImage {
  id: number;
  url: string;
}

interface StorageDetailProps {
  id?: string;
  onBack?: () => void;
}

const StorageDetail: React.FC<StorageDetailProps> = ({ id, onBack }) => {
  // 컨테이너 참조 생성
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 이미지 슬라이더 관련 상태 및 참조
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 더미 이미지 데이터 및 API 로딩 상태
  const [storageImages, setStorageImages] = useState<StorageImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API에서 보관소 이미지 로드 (실제 구현 시 실제 API 호출로 대체)
  useEffect(() => {
    const fetchStorageImages = async () => {
      try {
        setIsLoading(true);
        // 실제 API 호출 대신 더미 데이터 사용
        // const response = await api.getStorageImages(id);

        // 더미 데이터
        const dummyImages = [
          { id: 1, url: 'https://placehold.co/375x260?text=Living+Room' },
          { id: 2, url: 'https://placehold.co/375x260?text=Kitchen' },
          { id: 3, url: 'https://placehold.co/375x260?text=Bedroom' },
          { id: 4, url: 'https://placehold.co/375x260?text=Storage+Space' },
          { id: 5, url: 'https://placehold.co/375x260?text=Outside+View' },
        ];

        // 실제 구현에서는 응답에서 이미지 배열을 추출
        // const images = response.data.images;

        setStorageImages(dummyImages);
      } catch (error) {
        console.error('보관소 이미지 로드 실패:', error);
        // 오류 시 기본 이미지 설정
        setStorageImages([{ id: 1, url: 'https://placehold.co/375x260?text=Default+Image' }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageImages();
  }, [id]);

  const handleChatClick = () => {
    console.log('Chat button clicked');
    // 채팅 기능 구현
  };

  const handleScrollToTop = () => {
    // 컨테이너 요소가 있으면 해당 요소의 스크롤 위치를 맨 위로 이동
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(e.touches[0].clientX); // 초기화
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);

    // 슬라이더가 있고 이미지가 2개 이상일 때만 실시간 드래그 효과 적용
    if (sliderRef.current && storageImages.length > 1) {
      const dragDistance = e.touches[0].clientX - touchStartX;
      const slideWidth = sliderRef.current.offsetWidth;
      const maxOffset = (storageImages.length - 1) * slideWidth;

      // 현재 위치에서의 드래그 오프셋 계산
      let newOffset = currentImageIndex * slideWidth - dragDistance;

      // 경계 처리 (맨 앞, 맨 뒤 이미지에서 고무줄 효과)
      if (newOffset < 0) {
        newOffset = newOffset / 3; // 저항 효과
      } else if (newOffset > maxOffset) {
        newOffset = maxOffset + (newOffset - maxOffset) / 3; // 저항 효과
      }

      // translate3d를 사용하여 하드웨어 가속 적용
      sliderRef.current.style.transform = `translate3d(${-newOffset}px, 0, 0)`;
      sliderRef.current.style.transition = 'none';
    }
  };

  const handleTouchEnd = () => {
    // 최소 드래그 거리 (px)
    const minSwipeDistance = 50;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) < minSwipeDistance) {
      // 작은 드래그는 원위치로 복원
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
      }
      return;
    }

    // 상태 업데이트 및 이미지 이동
    if (distance > 0 && currentImageIndex < storageImages.length - 1) {
      // 오른쪽에서 왼쪽으로 스와이프 (다음 이미지)
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);

      // 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    } else if (distance < 0 && currentImageIndex > 0) {
      // 왼쪽에서 오른쪽으로 스와이프 (이전 이미지)
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);

      // 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    } else {
      // 첫 번째나 마지막 이미지에서 경계를 벗어나려는 시도는 원위치로
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
      }
    }
  };

  // 마우스 이벤트 핸들러 (데스크톱 지원)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setTouchStartX(e.clientX);
    setTouchEndX(e.clientX);

    // 이미지 드래그 중 텍스트 선택 방지
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setTouchEndX(e.clientX);

    // 슬라이더가 있고 이미지가 2개 이상일 때만 실시간 드래그 효과 적용
    if (sliderRef.current && storageImages.length > 1) {
      const dragDistance = e.clientX - dragStartX;
      const slideWidth = sliderRef.current.offsetWidth;
      const maxOffset = (storageImages.length - 1) * slideWidth;

      // 현재 위치에서의 드래그 오프셋 계산
      let newOffset = currentImageIndex * slideWidth - dragDistance;

      // 경계 처리 (맨 앞, 맨 뒤 이미지에서 고무줄 효과)
      if (newOffset < 0) {
        newOffset = newOffset / 3;
      } else if (newOffset > maxOffset) {
        newOffset = maxOffset + (newOffset - maxOffset) / 3;
      }

      // translate3d를 사용하여 하드웨어 가속 적용
      sliderRef.current.style.transform = `translate3d(${-newOffset}px, 0, 0)`;
      sliderRef.current.style.transition = 'none';
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    // 최소 드래그 거리 (px)
    const minSwipeDistance = 50;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) < minSwipeDistance) {
      // 작은 드래그는 원위치로 복원
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
      }
      setIsDragging(false);
      return;
    }

    // 상태 업데이트 및 이미지 이동
    if (distance > 0 && currentImageIndex < storageImages.length - 1) {
      // 오른쪽에서 왼쪽으로 드래그 (다음 이미지)
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);

      // 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    } else if (distance < 0 && currentImageIndex > 0) {
      // 왼쪽에서 오른쪽으로 드래그 (이전 이미지)
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);

      // 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    } else {
      // 첫 번째나 마지막 이미지에서 경계를 벗어나려는 시도는 원위치로
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-currentImageIndex * 100}%, 0, 0)`;
      }
    }

    setIsDragging(false);
  };

  // 이미지 제어 함수
  const nextImage = () => {
    if (currentImageIndex < storageImages.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);

      // 슬라이더 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);

      // 슬라이더 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-newIndex * 100}%, 0, 0)`;
      }
    }
  };

  // 특정 인덱스로 이동
  const goToImage = (index: number) => {
    if (index >= 0 && index < storageImages.length) {
      setCurrentImageIndex(index);

      // 슬라이더 애니메이션 적용
      if (sliderRef.current) {
        sliderRef.current.style.transition = 'transform 0.3s ease-in-out';
        sliderRef.current.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      }
    }
  };

  // 헤더 드롭다운 옵션 정의
  const headerDropdownOptions: HeaderDropdownOption[] = [
    {
      id: 'edit',
      label: '보관소 수정',
      icon: '✓',
      onClick: () => console.log('보관소 수정'),
    },
    {
      id: 'hidden',
      label: '비공개',
      icon: '➦',
      onClick: () => console.log('비공개 처리'),
    },
    {
      id: 'delete',
      label: '삭제',
      icon: '✕',
      color: '#ff4b4b',
      onClick: () => openDeleteModal(),
    },
  ];

  // 모달 상태 관리
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 게시글 삭제 모달 열기
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // 게시글 삭제 확인 처리
  const handleDeleteConfirm = () => {
    console.log('게시글 삭제 처리');
    // 여기에 게시글 삭제 관련 로직 추가
  };

  // 게시글 삭제 취소 처리
  const handleDeleteCancel = () => {
    console.log('게시글 삭제 취소');
  };

  // 모달 내용 컴포넌트 - 게시글 삭제
  const deleteStorageContent = (
    <>
      <HighlightText>게시글 삭제</HighlightText>
      <GrayText>하시겠습니까?</GrayText>
    </>
  );

  return (
    <>
      {/* 상단 헤더 */}
      <Header
        title="보관소 상세 페이지"
        showBackButton={true}
        showOptionButton={true}
        onBack={onBack}
        dropdownOptions={headerDropdownOptions}
      />

      <Container ref={containerRef}>
        {/* 게시글 삭제 모달 */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          content={deleteStorageContent}
          cancelText="취소"
          confirmText="삭제"
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
        />
        <ContentContainer>
          {/* 이미지 섹션 */}
          <ImageContainer>
            {isLoading ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#f0f0f0',
                }}
              >
                <div>이미지 로딩 중...</div>
              </div>
            ) : storageImages.length === 0 ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#f0f0f0',
                }}
              >
                <div>이미지가 없습니다</div>
              </div>
            ) : (
              <>
                <ImageSlider
                  ref={sliderRef}
                  currentIndex={currentImageIndex}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {storageImages.map((image, index) => (
                    <ImageSlide key={image.id}>
                      <SlideImage src={image.url} alt={`보관소 이미지 ${index + 1}`} />
                    </ImageSlide>
                  ))}
                </ImageSlider>

                {/* 이미지 인디케이터 - 이미지가 2개 이상일 때만 표시 */}
                {storageImages.length > 1 && (
                  <ImageIndicator>
                    {storageImages.map((_, index) => (
                      <Dot
                        key={index}
                        isActive={currentImageIndex === index}
                        onClick={() => goToImage(index)}
                      />
                    ))}
                  </ImageIndicator>
                )}
              </>
            )}
          </ImageContainer>

          {/* 제목 및 정보 */}
          <InfoSection>
            <Title>제주시청 근처 큰 방 입니다</Title>
            <TagsContainer>#실내 #냉장보관 #상온 #의류</TagsContainer>

            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <PriceContainer>
                <PriceText>10,000원</PriceText>
                <UnitText>/일</UnitText>
              </PriceContainer>

              {/* 채팅 버튼 */}
              <ChatButton onClick={handleChatClick}>
                <ChatButtonText>채팅하기</ChatButtonText>
              </ChatButton>
            </div>
          </InfoSection>

          {/* 구분선 */}
          <Divider />

          {/* 상세 설명 */}
          <DescriptionContainer>
            첫째가 독립해서 공간이 남네요. <br />
            잡화 보관해 드립니다. <br />
            근처 거주하시는 분 보관 가능합니다.
            <br />
            <br />
            장기간 등록시 할인해드려요~^^
            <br />
            냄새나는 물건은 받지 않겠습니다
          </DescriptionContainer>

          {/* 구분선 */}
          <Divider />

          {/* 위치 정보 */}
          <LocationSection>
            <LocationInfo>
              <LocationIcon src="https://placehold.co/20x20" alt="위치 아이콘" />
              <LocationLabel>위치</LocationLabel>
              <LocationText>제주특별자치도 제주시 월성로</LocationText>
            </LocationInfo>

            {/* 구분선 */}
            <Divider />

            {/* 지도 - 기존 MapImage 대신 KakaoMap 사용 */}
            <MapContainer>
              <KakaoMap
                center={{ lat: 37.5198, lng: 126.9402 }} // 여의도 63빌딩 좌표 (더미 데이터)
                level={3} // 상세 페이지에서는 레벨 3으로 지정
                storageMarkers={[
                  {
                    id: '1',
                    name: '제주시청 근처 큰 방',
                    latitude: 37.5198,
                    longitude: 126.9402,
                    address: '제주특별자치도 제주시 월성로',
                  },
                ]}
                detailMode={true} // 상세 페이지 모드 활성화
                draggable={false} // 드래그 비활성화
                zoomable={false} // 줌 비활성화
              />
            </MapContainer>
          </LocationSection>

          {/* 보관인 정보 */}
          <KeeperSection>
            <KeeperCard>
              <KeeperImageContainer>
                <KeeperImage src="https://placehold.co/28x29" alt="보관인 프로필" />
              </KeeperImageContainer>
              <KeeperInfo>
                <KeeperLabel>보관인</KeeperLabel>
                <KeeperName>타조 89389</KeeperName>
              </KeeperInfo>
            </KeeperCard>
          </KeeperSection>
        </ContentContainer>
      </Container>

      {/* 스크롤 상단 이동 버튼 */}
      <ScrollToTopButton
        src="https://placehold.co/59x55"
        alt="상단으로 이동"
        onClick={handleScrollToTop}
      />
      <BottomNavigation activeTab="보관소" />
    </>
  );
};

export default StorageDetail;
