// src/pages/Home/MapBottomSheet.tsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, isKeeper } from '../../utils/api/authUtils';
import Modal from '../../components/common/Modal';
import { LocationIdData, LocationIdResponse } from '../../services/api/modules/storage';
import { LocalDeal } from '../../types/place.types';
import { getRecentTrades, RecentTrade } from '../../services/api/modules/trades';

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

// 스타일 정의
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;
const MapArea = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${THEME.gray100};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const MapText = styled.p`
  color: ${THEME.gray500};
  font-size: 14px;
  font-family: 'Noto Sans KR';
`;
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
const DragHandleContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 8px;
  padding-bottom: 16px;
  cursor: grab;
`;
const DragHandle = styled.div`
  width: 36px;
  height: 4px;
  background-color: ${THEME.gray400};
  border-radius: 2px;
`;
const ContentContainer = styled.div`
  padding: 0 20px;
`;
const HeaderTitle = styled.div`
  font-size: 16px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  margin-bottom: 8px;
`;
const LocationContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 4px;
`;
const LocationIcon = styled.div`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;
const LocationText = styled.span`
  color: ${THEME.darkText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
`;
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
const Divider = styled.div`
  height: 1px;
  background-color: ${THEME.gray300};
  margin: 16px 0;
  opacity: 0.6;
`;
const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;
const MenuItem = styled.div`
  flex: 1;
  padding: 12px;
  border: 1px solid ${THEME.gray300};
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  position: relative;
`;
const MenuTitle = styled.div`
  font-size: 13px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  margin-bottom: 4px;
`;
const MenuDescription = styled.div`
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  color: ${THEME.gray500};
`;
const MenuArrow = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 12px;
`;
const SectionTitle = styled.div`
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  margin-bottom: 4px;
`;
const SectionSubtitle = styled.div`
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  color: ${THEME.gray500};
  margin-bottom: 16px;
`;
const DiscountGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
`;
const DiscountItemBox = styled.div<{ hasImage?: boolean; image_url?: string }>`
  position: relative;
  background-color: ${props => (props.hasImage ? 'transparent' : THEME.gray100)};
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 3/2;
  cursor: pointer;
  background-image: ${props =>
    props.hasImage && props.image_url ? `url(${props.image_url})` : 'none'};
  background-size: cover;
  background-position: center;
`;
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
const AreaText = styled.div`
  position: absolute;
  left: 8px;
  bottom: 8px;
  color: ${THEME.darkText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
`;
const MatjoItem = styled.div`
  background-color: ${THEME.gray200};
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 3/2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const MatjoIcon = styled.div`
  width: 60px;
  height: 60px;
  background-image: url('/tajo-logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 8px;
`;
const MatjoText = styled.div`
  color: ${THEME.gray500};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
`;
const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const ItemCard = styled.div`
  display: flex;
  border: 1px solid ${THEME.gray300};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
`;
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
const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
const ItemName = styled.div`
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
`;
const ItemPrice = styled.div`
  display: flex;
  align-items: baseline;
`;
const PriceText = styled.span`
  color: ${THEME.priceText};
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
`;
const PriceUnit = styled.span`
  color: ${THEME.priceText};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
`;
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

// RecentItem 타입 추가
interface RecentItem {
  id: string;
  name: string;
  price: number;
  post_tags: string[];
  imageUrl?: string;
  location: string;
}

interface MapBottomSheetProps {
  location?: string;
  defaultLocation?: string;
  onRegisterStorage?: () => void;
  onGoToBoard?: () => void;
  onDiscountItemClick?: (id: string) => void;
  discountItems?: LocalDeal[];
  recentItems?: RecentItem[];
  onEditLocation?: () => void;
  storageMarkers?: Marker[];
  onMarkerClick?: (markerId: string) => void;
  locationInfoId?: number;
  fetchLocationId?: (address: string) => Promise<number | undefined>;
}

export const KeeperRegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  const navigate = useNavigate();
  const handleConfirm = () => {
    navigate('/registration/step1');
    onClose();
  };
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
      onConfirm={handleConfirm}
    />
  );
};

export const handleRegisterStorage = (
  navigate: ReturnType<typeof useNavigate>,
  setShowKeeperModal: (show: boolean) => void,
): void => {
  if (!isLoggedIn()) {
    navigate('/login');
    return;
  }
  if (isKeeper()) {
    navigate('/storages/register');
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
  locationInfoId: propLocationInfoId,
  fetchLocationId, // index.tsx에서 전달받은 함수
}) => {
  const navigate = useNavigate();
  const [showKeeperModal, setShowKeeperModal] = useState(false);
  const [sheetState, setSheetState] = useState<BottomSheetState>('half-expanded');
  // 현재 위치 텍스트는 prop을 그대로 사용하거나, 필요시 내부 상태로 관리할 수 있음
  const [currentLocation, setCurrentLocation] = useState<string>(location);
  // 최근 거래 내역은 내부에서 관리
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [locationInfoId, setLocationInfoId] = useState<number | undefined>(
    propLocationInfoId ?? undefined,
  );

  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);

  const snapPoints = {
    closed: window.innerHeight * 0.85,
    'half-expanded': window.innerHeight * 0.5,
    full: window.innerHeight * 0.2,
  };

  const calculateSnapPoint = (currentTop: number): BottomSheetState => {
    const viewportHeight = window.innerHeight;
    const currentPercentage = (currentTop / viewportHeight) * 100;
    const distances = {
      closed: Math.abs(currentPercentage - 85),
      'half-expanded': Math.abs(currentPercentage - 50),
      full: Math.abs(currentPercentage - 20),
    };
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

  // 이제 MapBottomSheet에서는 index.tsx에서 전달받은 값을 사용하므로,
  // 현재 위치를 가져오는 별도의 useEffect는 제거합니다.
  // (필요시 index.tsx에서 관리된 current location을 그대로 사용)

  useEffect(() => {
    if (propLocationInfoId !== locationInfoId) {
      setLocationInfoId(propLocationInfoId ?? undefined);
    }
  }, [propLocationInfoId]);

  useEffect(() => {
    if (location !== currentLocation) {
      setCurrentLocation(location);
    }
  }, [location, currentLocation]);

  useEffect(() => {
    const fetchRecentTrades = async () => {
      if (locationInfoId === undefined) {
        console.log('locationInfoId가 없어서 거래 내역 조회를 건너뜁니다.');
        return;
      }
      try {
        const response = await getRecentTrades(locationInfoId);
        if (response.success && Array.isArray(response.data)) {
          setRecentTrades(response.data);
        } else {
          console.warn('거래 내역 응답 형식 오류:', response);
          setRecentTrades([]);
        }
      } catch (error) {
        console.error('최근 거래 내역 가져오기 실패:', error);
        setRecentTrades([]);
      }
    };
    fetchRecentTrades();
  }, [locationInfoId]);

  const handleRegisterClick = () => {
    if (onRegisterStorage) {
      onRegisterStorage();
    } else {
      handleRegisterStorage(navigate, setShowKeeperModal);
    }
  };

  const handleKeeperConfirm = () => {
    setShowKeeperModal(false);
    navigate('/storages');
  };

  const handleGoToBoard = () => {
    if (onGoToBoard) {
      onGoToBoard();
    } else {
      navigate('/storages');
    }
  };

  const handleItemClick = (id: string): void => {
    navigate(`/storages/${id}`);
  };

  const handleDiscountItemClick = (id: number): void => {
    if (onDiscountItemClick) {
      onDiscountItemClick(id.toString());
    } else {
      navigate(`/storages/${id}`);
    }
  };

  const handleEditLocation = () => {
    if (onEditLocation) {
      onEditLocation();
    }
  };

  return (
    <Container>
      <MapArea>
        {/* 보관소 마커 표시 */}
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
          height: `${window.innerHeight}px`,
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
              <>
                <DiscountItemBox
                  hasImage={!!discountItems[0]?.image_url}
                  image_url={discountItems[0]?.image_url}
                  onClick={() => handleDiscountItemClick(discountItems[0].id)}
                >
                  <DiscountTag>{discountItems[0].discount}</DiscountTag>
                  <AreaText>{currentLocation.split(' ')[1]}</AreaText>
                </DiscountItemBox>
                {discountItems[1] ? (
                  <DiscountItemBox
                    hasImage={!!discountItems[1]?.image_url}
                    image_url={discountItems[1]?.image_url}
                    onClick={() => handleDiscountItemClick(discountItems[1].id)}
                  >
                    <DiscountTag>{discountItems[1].discount}</DiscountTag>
                    <AreaText>{currentLocation.split(' ')[1]}</AreaText>
                  </DiscountItemBox>
                ) : (
                  <MatjoItem>
                    <MatjoIcon />
                    <MatjoText>내가 마타조?</MatjoText>
                  </MatjoItem>
                )}
              </>
            ) : (
              <>
                <MatjoItem>
                  <MatjoIcon />
                  <MatjoText>내가 마타조?</MatjoText>
                </MatjoItem>
                <MatjoItem>
                  <MatjoIcon />
                  <MatjoText>내가 마타조?</MatjoText>
                </MatjoItem>
              </>
            )}
          </DiscountGrid>
          <SectionTitle>{currentLocation.split(' ')[1]} 최근 거래 내역</SectionTitle>
          <ItemList>
            {recentTrades.length > 0 ? (
              recentTrades.map((trade, index) => (
                <ItemCard key={index}>
                  <ItemImage
                    style={{
                      backgroundImage: trade.main_image ? `url(${trade.main_image})` : 'none',
                    }}
                  />
                  <ItemInfo>
                    <ItemName>{trade.product_name}</ItemName>
                    <ItemPrice>
                      <PriceText>
                        {trade.trade_price ? trade.trade_price.toLocaleString() : '-'}원
                      </PriceText>
                      <PriceUnit> /일</PriceUnit>
                    </ItemPrice>
                    <ItemTags>
                      {trade.category} | {trade.storage_period}일
                    </ItemTags>
                  </ItemInfo>
                </ItemCard>
              ))
            ) : (
              <ItemCard>
                <ItemImage />
                <ItemInfo>
                  <ItemName>거래 내역이 없습니다</ItemName>
                  <ItemPrice>
                    <PriceText>-</PriceText>
                    <PriceUnit> /일</PriceUnit>
                  </ItemPrice>
                  <ItemTags>해당 지역의 거래 내역이 없습니다</ItemTags>
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
