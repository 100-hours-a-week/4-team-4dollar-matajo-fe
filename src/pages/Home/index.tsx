import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import MapBottomSheet from './MapBottomSheet';
import { useAuth } from '../../hooks/useAuth';
import { getNearbyPlaces, getDiscountItems, getRecentItems } from '../../api/place';
import { Place, DiscountItem, StorageItem } from '../../api/place';

// 테마 컬러 상수 정의
const THEME = {
  primary: '#3A00E5',
  background: '#F5F5FF',
  white: '#FFFFFF',
};

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  max-width: 375px;
  height: 100vh;
  position: relative;
  background: ${THEME.white};
  overflow: hidden;
  margin: 0 auto;
`;

// 로딩 인디케이터
const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #666;
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isKeeper, isClient } = useAuth();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<string>('영등포구 여의도동');
  const [places, setPlaces] = useState<Place[]>([]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [recentItems, setRecentItems] = useState<StorageItem[]>([]);

  // 위치 정보 가져오기
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // 위치 정보 가져오기 (현재는 더미 데이터)
        const coords = { latitude: 37.52508, longitude: 126.92671 };

        // 주변 장소 가져오기
        const placesResponse = await getNearbyPlaces(coords.latitude, coords.longitude);
        setPlaces(placesResponse.data.places);

        // 첫 번째 장소 기준으로 위치 설정
        if (placesResponse.data.places.length > 0) {
          const place = placesResponse.data.places[0];
          setLocation(`${place.district} ${place.neighborhood}`);

          // 해당 지역의 특가 아이템 가져오기
          const discountResponse = await getDiscountItems(place.district, place.neighborhood);
          setDiscountItems(discountResponse.data.items);

          // 해당 지역의 최근 거래 내역 가져오기
          const recentResponse = await getRecentItems(place.district, place.neighborhood);
          setRecentItems(recentResponse.data.items);
        }
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  // 보관소 등록 페이지로 이동
  const handleRegisterStorage = () => {
    if (isKeeper()) {
      // 이미 보관인인 경우, 보관소 등록 페이지로 이동
      navigate('/editstorage');
    } else if (isClient()) {
      // 의뢰인인 경우, 보관인 등록 페이지로 이동
      navigate('/registration/step1');
    } else {
      // 로그인이 필요한 경우
      navigate('/login');
    }
  };

  // 게시판 페이지로 이동
  const handleGoToBoard = () => {
    navigate('/storage');
  };

  // 지역 특가 상세 페이지로 이동
  const handleDiscountItemClick = (id: string) => {
    navigate(`/storagedetail/${id}`);
  };

  if (loading) {
    return (
      <Container>
        <Header title="마타조" />
        <LoadingIndicator>로딩 중...</LoadingIndicator>
        <BottomNavigation activeTab="홈" />
      </Container>
    );
  }

  return (
    <Container>
      {/* 상단 헤더 */}
      <Header title="마타조" />

      {/* 맵 바텀시트 컴포넌트 */}
      <MapBottomSheet
        location={location}
        onRegisterStorage={handleRegisterStorage}
        onGoToBoard={handleGoToBoard}
        onDiscountItemClick={handleDiscountItemClick}
        discountItems={discountItems}
        recentItems={recentItems}
      />

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="홈" />
    </Container>
  );
};

export default HomePage;
