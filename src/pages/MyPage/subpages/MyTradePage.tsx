import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../../../components/layout/Header';
import BottomNavigation from '../../../components/layout/BottomNavigation';
import { useNavigate } from 'react-router-dom';
import { getUserPlaces, PlaceItem } from '../../../services/api/modules/user';
import moment from 'moment';
import { ROUTES } from '../../../constants/routes';

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
  padding-top: 10px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// 장소 카드 스타일
const PlaceCard = styled.div`
  width: 326px;
  height: 96px;
  margin: 15px auto;
  background: rgba(217, 217, 217, 0);
  border-radius: 10px;
  border: 1px ${THEME.borderColor} solid;
  position: relative;
  padding: 15px;
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
  margin-bottom: 5px;
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
  width: 45px;
  height: 17px;
  padding: 2px 8px;
  border-radius: 21px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => (props.isPublic ? THEME.primaryAlpha : THEME.lightGrayText)};
  border: 1px solid ${props => (props.isPublic ? THEME.primaryAlpha : THEME.lightGrayText)};
  font-size: 12px;
  font-family: 'Noto Sans KR';
  font-weight: 500;
  margin-bottom: 10px;
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

  // 내 보관소 데이터 조회
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        setError(null);

        // API 호출 임시 구현
        // 실제 API 구현될 때까지 임시 데이터 사용
        // 실제 API는 나중에 services/api/modules/user.ts에 추가
        const mockData: PlaceItem[] = [
          {
            post_id: 13,
            post_title: '케아네집',
            post_address: '부산 부산진구 신천대로 241',
            post_main_image:
              'https://matajo-image.s3.ap-northeast-2.amazonaws.com/post/2e807462-62eb-44cd-8939-1651734adc15.jpg',
            hidden_status: false,
            prefer_price: 32324,
            created_at: '2025.03.27 13:26:27',
          },
        ];
        setPlaces(mockData);
      } catch (err) {
        console.error('보관소 조회 실패:', err);
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
    navigate(`/${ROUTES.MYPLACE}/${placeId}`);
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
          <NoDataMessage>등록된 보관소가 없습니다.</NoDataMessage>
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
