// src/pages/Home/MapBottomSheet.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, isKeeper } from '../../utils/api/authUtils';
import Modal from '../../components/common/Modal';
import { getLocationId } from '../../services/api/modules/place';
import { LocationIdData, LocationIdResponse } from '../../services/api/modules/storage';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5',
  primaryLight: '#5E5CFD',
  primaryAlpha: 'rgba(56.26, 53.49, 252.61, 0.80)',
  background: '#F5F5FF',
  darkText: '#464646',
  lightGrayText: '#9C9C9C',
  priceText: '#3A5BFF',
  borderColor: '#D9D9D9',
  dividerColor: '#D9D9D9',
  white: '#FFFFFF',
  discountRed: '#FF3333',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#C0C0C0',
  gray500: '#6F6F6F',
};

// 컨테이너 스타일
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

// 지도 영역
const MapArea = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${THEME.gray100};
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 지도 컨텐츠 텍스트
const MapText = styled.p`
  color: ${THEME.gray500};
  font-size: 14px;
  font-family: 'Noto Sans KR';
`;

// 바텀 시트 스타일
const BottomSheet = styled.div`
  position: absolute;
  width: 100%;
  background-color: ${THEME.white};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow-y: auto;
  padding-bottom: 20px;
`;

// 드래그 핸들 컨테이너
const DragHandleContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 16px;
  cursor: grab;
`;

// 드래그 핸들
const DragHandle = styled.div`
  width: 36px;
  height: 4px;
  background-color: ${THEME.gray400};
  border-radius: 2px;
`;

// 컨텐츠 컨테이너
const ContentContainer = styled.div`
  padding: 0 20px;
`;

// 헤더 타이틀
const HeaderTitle = styled.div`
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  margin-bottom: 8px;
`;

// 위치 정보 컨테이너
const LocationContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 4px;
`;

// 위치 아이콘
const LocationIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

// 위치 텍스트
const LocationText = styled.span`
  color: ${THEME.darkText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
`;

// 위치 수정 버튼
const EditLocationButton = styled.button`
  margin-left: auto;
  color: ${THEME.darkText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  background: none;
  border: none;
  cursor: pointer;
`;

// 구분선
const Divider = styled.div`
  height: 1px;
  background-color: ${THEME.gray300};
  margin: 16px 0;
  opacity: 0.6;
`;
// 메뉴 컨테이너 - 가로 배치로 변경
const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

// 메뉴 아이템 - 너비 조정
const MenuItem = styled.div`
  flex: 1;
  padding: 12px;
  border: 1px solid ${THEME.gray300};
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  position: relative;
`;

// 메뉴 제목
const MenuTitle = styled.div`
  font-size: 13px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  margin-bottom: 4px;
`;

// 메뉴 설명
const MenuDescription = styled.div`
  font-size: 10.5px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  color: ${THEME.gray500};
`;

// 메뉴 화살표
const MenuArrow = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 12px;
`;

// 섹션 제목
const SectionTitle = styled.div`
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  margin-bottom: 4px;
`;

// 섹션 서브타이틀
const SectionSubtitle = styled.div`
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  color: ${THEME.gray500};
  margin-bottom: 16px;
`;

// 특가 그리드
const DiscountGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;

// 특가 아이템
const DiscountItemBox = styled.div`
  position: relative;
  background-color: ${THEME.gray100};
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 3/2;
  cursor: pointer;
`;

// 특가 태그
const DiscountTag = styled.div`
  position: absolute;
  left: 8px;
  top: 8px;
  background-color: ${THEME.discountRed};
  color: ${THEME.white};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 2px;
`;

// 지역 텍스트
const AreaText = styled.div`
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: ${THEME.darkText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
`;

// 마타조 아이템
const MatjoItem = styled.div`
  background-color: ${THEME.gray200};
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 3/2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

// 마타조 아이콘
const MatjoIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${THEME.gray300};
  border-radius: 50%;
  margin-bottom: 8px;
`;

// 마타조 텍스트
const MatjoText = styled.div`
  color: ${THEME.gray500};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
`;

// 아이템 리스트
const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 아이템 카드
const ItemCard = styled.div`
  display: flex;
  border: 1px solid ${THEME.gray300};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
`;

// 아이템 이미지
const ItemImage = styled.div`
  width: 64px;
  height: 64px;
  background-color: ${THEME.gray100};
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
`;

// 아이템 정보
const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

// 아이템 이름
const ItemName = styled.div`
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
`;

// 아이템 가격
const ItemPrice = styled.div`
  display: flex;
  align-items: baseline;
`;

// 아이템 가격 텍스트
const PriceText = styled.span`
  color: ${THEME.priceText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
`;

// 아이템 가격 단위
const PriceUnit = styled.span`
  color: ${THEME.priceText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
`;

// 아이템 태그
const ItemTags = styled.div`
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  color: ${THEME.gray500};
`;

// BottomSheetState 타입 정의
type BottomSheetState = 'closed' | 'half-expanded' | 'full';

// Marker 인터페이스 정의
export interface Marker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface MapBottomSheetProps {
  location?: string;
  defaultLocation?: string;
  onRegisterStorage?: () => void;
  onGoToBoard?: () => void;
  onDiscountItemClick?: (id: string) => void;
  discountItems?: any[];
  recentItems?: any[];
  onEditLocation?: () => void;
  storageMarkers?: Marker[];
  onMarkerClick?: (markerId: string) => void;
}

// KeeperRegistrationModal 컴포넌트
export const KeeperRegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      content={
        <>
          <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>
            보관인 미등록 계정입니다.
            <br />
          </span>
          <span style={{ color: '#010048', fontSize: '16px', fontWeight: 700 }}>보관인 등록</span>
          <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>하시겠습니까?</span>
        </>
      }
      cancelText="취소"
      confirmText="등록"
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
};

// 보관소 등록 핸들러
export const handleRegisterStorage = (
  navigate: ReturnType<typeof useNavigate>,
  setShowKeeperModal: (show: boolean) => void,
): void => {
  if (!isLoggedIn()) {
    navigate('/login');
    return;
  }

  if (isKeeper()) {
    navigate('/storage');
  } else {
    setShowKeeperModal(true);
  }
};

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
  location = '제주특별자치도 제주시 이도이동',
  defaultLocation,
  onRegisterStorage,
  onGoToBoard,
  onDiscountItemClick,
  discountItems = [],
  recentItems = [],
  onEditLocation,
  storageMarkers = [],
  onMarkerClick,
}) => {
  const navigate = useNavigate();
  const [showKeeperModal, setShowKeeperModal] = useState(false);
  const [sheetState, setSheetState] = useState<BottomSheetState>('half-expanded');
  const [currentLocation, setCurrentLocation] = useState<string>(location);
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  // 스냅포인트 정의 수정
  const snapPoints = {
    closed: window.innerHeight * 0.85, // 화면의 85% 지점 (지도가 15% 보임)
    'half-expanded': window.innerHeight * 0.5, // 화면의 50% 지점
    full: window.innerHeight * 0.2, // 화면의 20% 지점 (지도가 80% 보임)
  };

  // 스냅포인트 계산 함수 추가
  const calculateSnapPoint = (currentTop: number): BottomSheetState => {
    const viewportHeight = window.innerHeight;
    const currentPercentage = (currentTop / viewportHeight) * 100;

    // 각 스냅포인트와의 거리 계산
    const distances = {
      closed: Math.abs(currentPercentage - 85), // 85% 지점과의 거리
      'half-expanded': Math.abs(currentPercentage - 50), // 50% 지점과의 거리
      full: Math.abs(currentPercentage - 20), // 20% 지점과의 거리
    };

    // 가장 가까운 스냅포인트 찾기
    return Object.entries(distances).reduce((a, b) => (a[1] < b[1] ? a : b))[0] as BottomSheetState;
  };

  const handleDragStart = (
    e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  ) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    currentYRef.current = bottomSheetRef.current?.offsetTop || 0;

    if ('touches' in e) {
      document.addEventListener('touchmove', handleDragMove as EventListener);
      document.addEventListener('touchend', handleDragEnd);
    } else {
      document.addEventListener('mousemove', handleDragMove as EventListener);
      document.addEventListener('mouseup', handleDragEnd);
    }
  };

  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = clientY - startYRef.current;
    const newY = currentYRef.current + delta;

    if (bottomSheetRef.current) {
      bottomSheetRef.current.style.transition = 'none';
      bottomSheetRef.current.style.top = `${Math.max(0, newY)}px`;
    }
  };

  const handleDragEnd = () => {
    document.removeEventListener('mousemove', handleDragMove as EventListener);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove as EventListener);
    document.removeEventListener('touchend', handleDragEnd);

    if (bottomSheetRef.current) {
      const currentTop = bottomSheetRef.current.offsetTop;
      const newState = calculateSnapPoint(currentTop);
      const targetY = snapPoints[newState];

      bottomSheetRef.current.style.transition = 'top 0.3s ease-out';
      bottomSheetRef.current.style.top = `${targetY}px`;
      setSheetState(newState);
    }
  };

  // 컴포넌트 마운트 시 현재 위치 가져오기
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const locationResponse = await getLocationId(`${latitude},${longitude}`);

        if (Array.isArray(locationResponse) && locationResponse.length > 0) {
          const locationData = locationResponse[0] as LocationIdData;
          setCurrentLocation(locationData.address || defaultLocation || location);
        }
      } catch (error) {
        console.error('현재 위치 가져오기 실패:', error);
        setCurrentLocation(defaultLocation || location);
      }
    };

    getCurrentLocation();
  }, [defaultLocation, location]);

  // location prop이 변경될 때 currentLocation 업데이트
  useEffect(() => {
    if (location !== currentLocation) {
      setCurrentLocation(location);
    }
  }, [location, currentLocation]);

  // 현재 위치 가져오기
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setCurrentUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.error('현재 위치 가져오기 실패:', error);
      },
    );
  }, []);

  // 보관소 등록 핸들러
  const handleRegisterClick = () => {
    if (onRegisterStorage) {
      onRegisterStorage();
    } else {
      handleRegisterStorage(navigate, setShowKeeperModal);
    }
  };

  // 보관인 등록 확인 핸들러
  const handleKeeperConfirm = () => {
    setShowKeeperModal(false);
    navigate('/storage');
  };

  // 게시판 이동 핸들러
  const handleGoToBoard = () => {
    if (onGoToBoard) {
      onGoToBoard();
    } else {
      navigate('/storage');
    }
  };

  // 아이템 상세 페이지로 이동
  const handleItemClick = (id: string): void => {
    navigate(`/storage/${id}`);
  };

  // 지역 특가 아이템 클릭 핸들러
  const handleDiscountItemClick = (id: string): void => {
    if (onDiscountItemClick) {
      onDiscountItemClick(id);
    } else {
      navigate(`/storage/${id}`);
    }
  };

  // 동네 수정 버튼 클릭 핸들러
  const handleEditLocation = () => {
    if (onEditLocation) {
      onEditLocation();
    }
  };

  return (
    <Container>
      <MapArea>
        {/* 현재 위치 마커 */}
        {currentUserLocation && (
          <div
            style={{
              position: 'absolute',
              left: `${currentUserLocation.latitude}px`,
              top: `${currentUserLocation.longitude}px`,
              width: '12px',
              height: '12px',
              backgroundColor: '#3A00E5',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
            }}
          />
        )}

        {/* 보관소 마커 */}
        {storageMarkers.map(marker => (
          <div
            key={marker.id}
            onClick={() => onMarkerClick?.(marker.id)}
            style={{
              position: 'absolute',
              left: `${marker.latitude}px`,
              top: `${marker.longitude}px`,
              cursor: 'pointer',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                fill="#3A00E5"
              />
            </svg>
          </div>
        ))}
      </MapArea>

      <BottomSheet
        ref={bottomSheetRef}
        style={{
          top: snapPoints[sheetState],
          height: `${window.innerHeight}px`, // 높이를 전체 화면 높이로 설정
          transition: 'top 0.3s ease-out',
        }}
      >
        <DragHandleContainer
          ref={dragHandleRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <DragHandle />
        </DragHandleContainer>

        <ContentContainer>
          <LocationContainer>
            <LocationIcon>
              <svg viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6 0.667C2.775 0.667 0.167 3.275 0.167 6.5C0.167 10.875 6 17.334 6 17.334C6 17.334 11.833 10.875 11.833 6.5C11.833 3.275 9.225 0.667 6 0.667ZM6 8.584C4.85 8.584 3.917 7.65 3.917 6.5C3.917 5.35 4.85 4.417 6 4.417C7.15 4.417 8.083 5.35 8.083 6.5C8.083 7.65 7.15 8.584 6 8.584Z"
                  fill="#020202"
                />
              </svg>
            </LocationIcon>
            <LocationText>{currentLocation}</LocationText>
            <EditLocationButton onClick={handleEditLocation}>동네 수정</EditLocationButton>
          </LocationContainer>

          <Divider />

          <MenuContainer>
            <MenuItem onClick={handleRegisterClick}>
              <MenuTitle>보관장소 등록하기</MenuTitle>
              <MenuDescription>보관인이 되어 장소를 등록해요</MenuDescription>
              <MenuArrow>›</MenuArrow>
            </MenuItem>
            <MenuItem onClick={handleGoToBoard}>
              <MenuTitle>게시판 둘러보기</MenuTitle>
              <MenuDescription>게시판을 구경해보세요</MenuDescription>
              <MenuArrow>›</MenuArrow>
            </MenuItem>
          </MenuContainer>

          <Divider />

          <SectionTitle>{currentLocation.split(' ')[1]} 지역 특가</SectionTitle>
          <DiscountGrid>
            {discountItems.length > 0 ? (
              discountItems.slice(0, 1).map(item => (
                <DiscountItemBox key={item.id} onClick={() => handleDiscountItemClick(item.id)}>
                  <DiscountTag>-{item.discountRate}%</DiscountTag>
                  <AreaText>{currentLocation.split(' ')[1]}</AreaText>
                </DiscountItemBox>
              ))
            ) : (
              <DiscountItemBox>
                <DiscountTag>-45%</DiscountTag>
                <AreaText>{currentLocation.split(' ')[1]}</AreaText>
              </DiscountItemBox>
            )}
            <MatjoItem onClick={handleRegisterClick}>
              <MatjoIcon />
              <MatjoText>내가 마타조?</MatjoText>
            </MatjoItem>
          </DiscountGrid>

          <SectionTitle>{currentLocation.split(' ')[1]} 최근 거래 내역</SectionTitle>
          <ItemList>
            {recentItems.length > 0 ? (
              recentItems.map(item => (
                <ItemCard key={item.id}>
                  <ItemImage
                    style={{
                      backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
                    }}
                  />
                  <ItemInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemPrice>
                      <PriceText>{item.price.toLocaleString()}원</PriceText>
                      <PriceUnit> /일</PriceUnit>
                    </ItemPrice>
                    <ItemTags>{item.post_tags}</ItemTags>
                  </ItemInfo>
                </ItemCard>
              ))
            ) : (
              <ItemCard>
                <ItemImage />
                <ItemInfo>
                  <ItemName>플레이스테이션</ItemName>
                  <ItemPrice>
                    <PriceText>12,000원</PriceText>
                    <PriceUnit> /일</PriceUnit>
                  </ItemPrice>
                  <ItemTags>전자기기 | 일주일 이내</ItemTags>
                </ItemInfo>
              </ItemCard>
            )}
          </ItemList>
        </ContentContainer>
      </BottomSheet>

      <KeeperRegistrationModal
        isOpen={showKeeperModal}
        onClose={() => setShowKeeperModal(false)}
        onConfirm={handleKeeperConfirm}
      />
    </Container>
  );
};

export default MapBottomSheet;
