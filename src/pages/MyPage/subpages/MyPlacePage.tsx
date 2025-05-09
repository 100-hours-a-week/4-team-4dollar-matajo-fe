import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { getMyStorages } from '../../../services/api/modules/storage';
import { PlaceItem } from '../../../services/api/modules/user';
import { useAuth } from '../../../contexts/auth/index';

// 테마 컬러 상수 정의 - 향후 별도 파일로 분리 가능
const THEME = {
  primary: '#3835FD',
  primaryLight: '#605EFD',
  primaryAlpha: 'rgba(56.26, 53.49, 252.61, 0.80)',
  background: '#F5F5FF',
  darkText: '#616161',
  lightGrayText: '#C0BDBD',
  blackText: '#292929',
  borderColor: '#E0E0E0',
  dividerColor: '#DCDCDC',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트 - 중앙 정렬 추가
const Container = styled.div`
  width: 100%;
  max-width: 375px;
  min-height: calc(100vh - 166px);
  background: white;
  overflow-y: auto;
  padding-bottom: 40px;
  padding-top: 60px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 장소 카드 스타일
const PlaceCard = styled.div`
  width: 90%;
  height: 100px;
  margin: 6px auto;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 1px ${THEME.borderColor} solid;
  position: relative;
  padding: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

// 장소 이미지
const PlaceImage = styled.img`
  width: 69px;
  height: 66px;
  border-radius: 2px;
  object-fit: cover;
`;

// 장소 정보 영역
const PlaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  flex: 1;
`;

// 장소 제목
const PlaceTitle = styled.div`
  color: ${THEME.darkText};
  font-size: 18px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.02px;
  margin-bottom: 3px;
`;

// 장소 주소
const PlaceAddress = styled.div`
  color: ${THEME.lightGrayText};
  font-size: 13px;
  font-family: 'Noto Sans KR';
  font-weight: 700;
  letter-spacing: 0.01px;
`;

// 공개 여부 태그
const VisibilityTag = styled.div<{ isPublic: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  height: 16px;
  padding: 0.5px 4px;
  border-radius: 10px;
  color: ${props => (props.isPublic ? THEME.primaryAlpha : THEME.lightGrayText)};
  border: 1px solid ${props => (props.isPublic ? THEME.primaryAlpha : THEME.lightGrayText)};
  font-size: 10px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  width: fit-content;
`;

// 화살표 아이콘
const ArrowIcon = styled.div`
  margin-left: 10px;
  color: #bbbbbb;
  opacity: 0.8;
`;

// 로딩 컴포넌트
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${THEME.lightGrayText};
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

// 에러 메시지 컴포넌트
const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: red;
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

// 데이터 없음 메시지
const NoDataMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${THEME.lightGrayText};
  font-size: 16px;
  font-family: 'Noto Sans KR';
`;

// 메인 컴포넌트
const MyPlace: React.FC = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isKeeper } = useAuth();
  const lastRequestTimeRef = useRef<number>(0);
  const REQUEST_INTERVAL = 500; // 0.5초 간격으로 요청 제한

  // 내 보관소 데이터 조회
  useEffect(() => {
    // 요청 간격 제한 확인
    const now = Date.now();
    if (now - lastRequestTimeRef.current < REQUEST_INTERVAL) {
      return;
    }
    lastRequestTimeRef.current = now;
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyStorages();
        console.log('내 보관소 목록:', data);
        setPlaces(data);
      } catch (err) {
        console.error('내 보관소 목록 조회 실패:', err);
        setError('보관소 목록을 불러오는 데 실패했습니다. 나중에 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // 뒤로가기 핸들러 함수 - MyPage로 이동
  const handleBackClick = () => {
    navigate(`/${ROUTES.MYPAGE}`);
  };

  // 보관소 상세 페이지로 이동
  const handlePlaceClick = (placeId: number) => {
    navigate(`/${ROUTES.STORAGE}/${placeId}`);
  };

  return (
    <>
      {/* 페이지 헤더 */}
      <Header title="내 보관소" showBackButton={true} onBack={handleBackClick} />

      <Container>
        {loading ? (
          <LoadingContainer>보관소 목록을 불러오는 중...</LoadingContainer>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : places.length === 0 ? (
          isKeeper() ? (
            <NoDataMessage>아직 등록된 보관소가 없습니다. 보관소를 등록해주세요.</NoDataMessage>
          ) : (
            <NoDataMessage>보관인 등록 후 보관소를 생성할 수 있습니다.</NoDataMessage>
          )
        ) : (
          // 보관소 목록
          places.map(place => (
            <PlaceCard key={place.post_id} onClick={() => handlePlaceClick(place.post_id)}>
              <PlaceImage
                src={place.post_main_image || 'https://via.placeholder.com/69x66'}
                alt={place.post_title}
              />
              <PlaceInfo>
                <VisibilityTag isPublic={!place.hidden_status}>
                  {place.hidden_status ? '비공개' : '공개'}
                </VisibilityTag>
                <PlaceTitle>{place.post_title}</PlaceTitle>
                <PlaceAddress>{place.post_address}</PlaceAddress>
              </PlaceInfo>
              <ArrowIcon>
                <svg
                  width="14"
                  height="20"
                  viewBox="0 0 14 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.399932 17.1076L9.4541 9.85097L0.233178 2.80748L0.200439 0L13.0968 9.85097L0.433661 20L0.399932 17.1076Z"
                    fill="#BBBBBB"
                    fillOpacity="0.8"
                  />
                </svg>
              </ArrowIcon>
            </PlaceCard>
          ))
        )}
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="마이페이지" />
    </>
  );
};

export default MyPlace;
