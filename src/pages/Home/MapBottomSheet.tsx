import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { DiscountItem, StorageItem } from '../../api/place';
import Modal from '../../components/common/Modal';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5',
  primaryLight: '#5E5CFD',
  primaryAlpha: 'rgba(94, 92, 253, 0.60)',
  background: '#F5F5FF',
  darkText: '#464646',
  lightGrayText: '#999999',
  priceText: '#3A5BFF',
  borderColor: '#EFEFF0',
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
const BottomSheet = styled(motion.div)`
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
  font-size: 14px;
  font-family: 'Noto Sans KR';
  font-weight: 400;
  margin-bottom: 4px;
`;

// 메뉴 설명
const MenuDescription = styled.div`
  font-size: 12px;
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

// 모달 관련 스타일 컴포넌트
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

// 타입 정의
type BottomSheetState = 'closed' | 'half-expanded' | 'full';

interface MapBottomSheetProps {
  location?: string;
  onRegisterStorage?: () => void;
  onGoToBoard?: () => void;
  onDiscountItemClick?: (id: string) => void;
  discountItems?: DiscountItem[];
  recentItems?: StorageItem[];
  onEditLocation?: () => void; // 동네 수정 버튼 클릭 핸들러 추가
}

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
  location = '영등포구 여의도동',
  onRegisterStorage,
  onGoToBoard,
  onDiscountItemClick,
  discountItems = [],
  recentItems = [],
  onEditLocation, // 동네 수정 버튼 클릭 핸들러
}) => {
  // 네비게이션
  const navigate = useNavigate();
  const { isKeeper, isClient } = useAuth();

  // 시트 상태 관리
  const [sheetState, setSheetState] = useState<BottomSheetState>('half-expanded');
  const sheetRef = useRef<HTMLDivElement>(null);
  const initialY = window.innerHeight - 220; // 닫혔을 때 위치
  const halfY = window.innerHeight / 2; // 반 펼쳐졌을 때 위치

  // 위치 상태 및 핸들러
  const [startY, setStartY] = useState<number>(0);
  const [currentY, setCurrentY] = useState<number>(halfY);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // 모달 상태
  const [showKeeperModal, setShowKeeperModal] = useState<boolean>(false);

  // 현재 상태에 따른 목표 위치 계산
  const getTargetY = (): number => {
    switch (sheetState) {
      case 'full':
        return 100; // 완전히 펼쳐졌을 때 상단에서 약간 여백
      case 'half-expanded':
        return halfY;
      case 'closed':
        return initialY;
      default:
        return halfY;
    }
  };

  // 현재 위치에 따라 새로운 상태 결정
  const determineStateFromPosition = (position: number): BottomSheetState => {
    if (position < halfY / 2) return 'full';
    if (position < initialY - 100) return 'half-expanded';
    return 'closed';
  };

  // 드래그 시작 핸들러
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent): void => {
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setStartY(clientY);
    setIsDragging(true);
  };

  // 드래그 이동 핸들러
  const handleDragMove = (e: TouchEvent | MouseEvent): void => {
    if (!isDragging) return;

    const clientY =
      'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    const delta = clientY - startY;
    let newY = currentY + delta;

    // 경계 확인
    if (newY < 100) newY = 100; // 최소 100px은 노출되도록
    if (newY > initialY) newY = initialY;

    setCurrentY(newY);
    setStartY(clientY);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (): void => {
    if (!isDragging) return;

    setIsDragging(false);
    const newState = determineStateFromPosition(currentY);
    setSheetState(newState);
  };

  // 상태 변경 시 목표 위치로 애니메이션 적용
  useEffect(() => {
    if (!isDragging) {
      const targetY = getTargetY();
      setCurrentY(targetY);
    }
  }, [sheetState, isDragging]);

  // 이벤트 리스너 추가/제거
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent): void => {
      if (isDragging) {
        e.preventDefault(); // 스크롤 방지
        handleDragMove(e);
      }
    };

    const handleMouseMove = (e: MouseEvent): void => {
      if (isDragging) {
        handleDragMove(e);
      }
    };

    const handleTouchEnd = (): void => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('mouseup', handleTouchEnd);

    return () => {
      // 이벤트 리스너 제거
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mouseup', handleTouchEnd);
    };
  }, [isDragging, startY, currentY]);

  // 보관소 등록 핸들러
  const handleRegisterStorage = (): void => {
    if (isKeeper()) {
      // 이미 보관인인 경우, 보관소 등록 페이지로 이동
      navigate('/registration/step1');
    } else if (isClient()) {
      // 보관인이 아닌 경우 모달 표시
      setShowKeeperModal(true);
    } else {
      // 로그인이 필요한 경우
      navigate('/login');
    }
  };

  // 의뢰인이 보관인 등록 확인 모달 처리
  const handleKeeperConfirmModal = () => {
    // 보관인 등록 페이지로 이동
    navigate('/keeper/registration');
  };

  // 모달 취소 처리
  const handleKeeperCancelModal = () => {
    setShowKeeperModal(false);
  };

  // 게시판 페이지로 이동
  const handleGoToBoard = (): void => {
    if (onGoToBoard) {
      onGoToBoard();
    } else {
      navigate('/storage');
    }
  };

  // 아이템 상세 페이지로 이동
  const handleItemClick = (id: string): void => {
    navigate(`/storagedetail/${id}`);
  };

  // 지역 특가 아이템 클릭 핸들러
  const handleDiscountItemClick = (id: string): void => {
    if (onDiscountItemClick) {
      onDiscountItemClick(id);
    } else {
      navigate(`/storagedetail/${id}`);
    }
  };

  // 동네 수정 버튼 클릭 핸들러
  const handleEditLocation = (): void => {
    if (onEditLocation) {
      onEditLocation();
    }
  };

  // 보관인 등록 모달 컨텐츠
  const keeperRegistrationContent = (
    <>
      <GrayText>
        보관인 미등록 계정입니다.
        <br />
      </GrayText>
      <HighlightText>보관인 등록</HighlightText>
      <GrayText>하시겠습니까?</GrayText>
    </>
  );

  return (
    <Container>
      {/* 지도 영역 */}
      <MapArea>
        <MapText>지도가 이곳에 표시됩니다</MapText>
      </MapArea>

      {/* 바텀 시트 */}
      <BottomSheet
        ref={sheetRef}
        style={{
          top: `${currentY}px`,
          height: `${window.innerHeight - 100}px`, // 상단에서 100px 여백
        }}
        animate={{ top: currentY }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* 드래그 핸들 */}
        <DragHandleContainer
          onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => handleDragStart(e)}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleDragStart(e)}
        >
          <DragHandle />
        </DragHandleContainer>

        <ContentContainer>
          {/* 위치 정보 */}
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
            <LocationText>{location}</LocationText>
            <EditLocationButton onClick={handleEditLocation}>동네 수정</EditLocationButton>
          </LocationContainer>

          <Divider />

          {/* 메뉴 아이템 */}
          <MenuContainer>
            <MenuItem onClick={handleRegisterStorage}>
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

          {/* 지역 특가 섹션 */}
          <SectionTitle>{location.split(' ')[1]} 지역 특가</SectionTitle>
          <DiscountGrid>
            {discountItems.length > 0 ? (
              discountItems.slice(0, 1).map(item => (
                <DiscountItemBox key={item.id} onClick={() => handleDiscountItemClick(item.id)}>
                  <DiscountTag>-{item.discountRate}%</DiscountTag>
                  <AreaText>{location.split(' ')[1]}</AreaText>
                </DiscountItemBox>
              ))
            ) : (
              <DiscountItemBox>
                <DiscountTag>-45%</DiscountTag>
                <AreaText>{location.split(' ')[1]}</AreaText>
              </DiscountItemBox>
            )}
            <MatjoItem onClick={handleRegisterStorage}>
              <MatjoIcon />
              <MatjoText>내가 마타조?</MatjoText>
            </MatjoItem>
          </DiscountGrid>

          {/* 최근 거래 내역 */}
          <SectionTitle>{location.split(' ')[1]} 최근 거래 내역</SectionTitle>
          <ItemList>
            {recentItems.length > 0 ? (
              recentItems.map(item => (
                // 아이템 카드에서 onClick 속성 제거
                <ItemCard key={item.id}>
                  <ItemImage
                    style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none' }}
                  />
                  <ItemInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemPrice>
                      <PriceText>{item.price.toLocaleString()}원</PriceText>
                      <PriceUnit> /일</PriceUnit>
                    </ItemPrice>
                    <ItemTags>{item.tags.join(' | ')}</ItemTags>
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

      {/* 보관인 등록 확인 모달 */}
      <Modal
        isOpen={showKeeperModal}
        onClose={handleKeeperCancelModal}
        content={keeperRegistrationContent}
        cancelText="취소"
        confirmText="등록"
        onCancel={handleKeeperCancelModal}
        onConfirm={handleKeeperConfirmModal}
      />
    </Container>
  );
};

export default MapBottomSheet;
