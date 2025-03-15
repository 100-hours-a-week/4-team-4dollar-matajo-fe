import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Header, { HeaderDropdownOption } from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import Modal from '../../components/common/Modal';

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

// 컴포넌트 스타일 정의
const Container = styled.div`
  width: 375px;
  height: calc(100vh - 76px); /* 네비게이션 바 높이 제외 */
  position: relative;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 76px; /* 하단 네비게이션 높이만큼 마진 */
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

const MainImage = styled.img`
  width: 375px;
  height: 375px;
  top: -50px;
  position: absolute;
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

const MapImage = styled.img`
  width: 100%;
  height: 125px;
  object-fit: cover;
  border-radius: 5px;
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
`;

const ActiveDot = styled.div`
  width: 10px;
  height: 9px;
  opacity: 0.8;
  background: #9e9dfe;
  border-radius: 9999px;
`;

const InactiveDot = styled.div`
  width: 10px;
  height: 9px;
  opacity: 0.8;
  background: #efeff0;
  border-radius: 9999px;
`;

const ScrollToTopButton = styled.img`
  width: 59px;
  height: 55px;
  position: fixed;
  left: 310px;
  bottom: 140px;
  opacity: 0.8;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  z-index: 99;
`;

interface StorageDetailProps {
  id?: string;
  onBack?: () => void;
}

const StorageDetail: React.FC<StorageDetailProps> = ({ id, onBack }) => {
  // 컨테이너 참조 생성
  const containerRef = React.useRef<HTMLDivElement>(null);

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
            <MainImage src="https://placehold.co/452x452" alt="보관소 이미지" />

            {/* 이미지 인디케이터 */}
            <ImageIndicator>
              <ActiveDot />
              <InactiveDot />
              <InactiveDot />
              <InactiveDot />
              <InactiveDot />
            </ImageIndicator>
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

            {/* 지도 */}
            <MapImage src="https://placehold.co/335x125" alt="위치 지도" />
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
