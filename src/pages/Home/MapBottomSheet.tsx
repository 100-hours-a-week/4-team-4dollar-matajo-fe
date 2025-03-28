// src/pages/Home/MapBottomSheet.tsx
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, isKeeper } from '../../utils/api/authUtils';
import Modal from '../../components/common/Modal';

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

// 보관소 등록 핸들러 함수
export const handleRegisterStorage = (
  navigate: ReturnType<typeof useNavigate>,
  setShowKeeperModal: (show: boolean) => void,
): void => {
  // 인증 확인
  if (!isLoggedIn()) {
    // 로그인 페이지로 이동
    navigate('/login');
    return;
  }

  // 보관인 여부 확인
  if (isKeeper()) {
    // 보관인이면 보관소 등록 페이지로 이동
    navigate('/registration/step1');
  } else {
    // 일반 사용자면 보관인 등록 모달 표시
    setShowKeeperModal(true);
  }
};

// KeeperRegistrationModal 컴포넌트
export const KeeperRegistrationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  // 모달 내용
  const keeperRegistrationContent = (
    <>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>
        보관인 미등록 계정입니다.
        <br />
      </span>
      <span style={{ color: '#010048', fontSize: '16px', fontWeight: 700 }}>보관인 등록</span>
      <span style={{ color: '#5b5a5d', fontSize: '16px', fontWeight: 500 }}>하시겠습니까?</span>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      content={keeperRegistrationContent}
      cancelText="취소"
      confirmText="등록"
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
};

// 바텀 시트 타입 정의
type BottomSheetState = 'closed' | 'half-expanded' | 'full';

interface MapBottomSheetProps {
  location?: string;
  onRegisterStorage?: () => void;
  onGoToBoard?: () => void;
  onDiscountItemClick?: (id: string) => void;
  discountItems?: any[];
  recentItems?: any[];
  onEditLocation?: () => void;
}

const MapBottomSheet: React.FC<MapBottomSheetProps> = ({
  location = '영등포구 여의도동',
  onRegisterStorage,
  onGoToBoard,
  onDiscountItemClick,
  discountItems = [],
  recentItems = [],
  onEditLocation,
}) => {
  const navigate = useNavigate();
  const [showKeeperModal, setShowKeeperModal] = useState(false);
  const [sheetState, setSheetState] = useState<BottomSheetState>('half-expanded');
  const [currentY, setCurrentY] = useState(window.innerHeight / 2);

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
    navigate('/keeper/registration');
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
        <MapText>지도가 이곳에 표시됩니다</MapText>
      </MapArea>

      <BottomSheet
        style={{
          top: `${currentY}px`,
          height: `${window.innerHeight - 100}px`,
        }}
      >
        <DragHandleContainer>
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
            <LocationText>{location}</LocationText>
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
            <MatjoItem onClick={handleRegisterClick}>
              <MatjoIcon />
              <MatjoText>내가 마타조?</MatjoText>
            </MatjoItem>
          </DiscountGrid>

          <SectionTitle>{location.split(' ')[1]} 최근 거래 내역</SectionTitle>
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
