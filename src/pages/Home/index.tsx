// src/pages/Home/index.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import MapBottomSheet from './MapBottomSheet';
import KakaoMap from '../../components/feature/map/KakaoMap';
import { isLoggedIn, isKeeper } from '../../utils/api/authUtils';
import LocationService, {
  LocationInfo,
  DEFAULT_COORDINATES,
  DEFAULT_LOCATION,
} from '../../services/LocationService';
import { getPostsByLocation, getLocalDeals } from '../../services/api/modules/place';
import { getLocationPosts, LocationPost } from '../../services/api/modules/storage';
import { Marker } from './MapBottomSheet';

import LocationSearchModal from './LocationSearchModal';
import { handleRegisterStorage, KeeperRegistrationModal } from './MapBottomSheet';
import { ROUTES } from '../../constants/routes';
import { createTrade, CreateTradeRequest } from '../../services/api/modules/trades';
import { LocalDeal } from '../../types/place.types';
import client from '../../services/api/client';
import { API_PATHS } from '../../constants/api';

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: #ffffff;
  overflow: hidden;
  margin: 0 auto;
  max-width: 480px; // 모바일 환경 고려
  display: flex; // flex 추가
  flex-direction: column; // column 방향으로 설정
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

// 에러 메시지 스타일
const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  text-align: center;

  h3 {
    color: #ff3333;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    font-size: 14px;
  }

  button {
    margin-top: 16px;
    padding: 8px 16px;
    background-color: #3a00e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`;

// 맵 컨테이너 스타일
const MapWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

// 헤더 래퍼
const HeaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background-color: transparent;
`;

// 최근 거래 아이템 인터페이스
interface RecentItem {
  id: string;
  name: string;
  price: number;
  post_tags: string[];
  imageUrl?: string;
  location: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const locationService = LocationService.getInstance();

  // 상태 관리
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>(DEFAULT_LOCATION);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [discountItems, setDiscountItems] = useState<LocalDeal[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [showKeeperModal, setShowKeeperModal] = useState<boolean>(false);

  // 지도 중심 좌표
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [mapLevel, setMapLevel] = useState(3);

  // 최근 거래내역 조회
  const fetchRecentTrades = async (locationInfoId: number) => {
    try {
      const response = await client.get(
        `${API_PATHS.TRADES.RECENT_BY_LOCATION}?locationInfoId=${locationInfoId}`,
      );

      if (response.data.success) {
        const trades = response.data.data.map((trade: any) => ({
          id: trade.id,
          name: trade.productName,
          price: trade.tradePrice,
          post_tags: [trade.category, `${trade.storagePeriod}일`],
          imageUrl: trade.mainImage,
          location: location.split(' ')[1] || ' ',
        }));
        setRecentItems(trades);
      } else {
        setRecentItems([]);
      }
    } catch (error) {
      console.error('최근 거래내역 조회 실패:', error);
      setRecentItems([]);
    }
  };

  // 지도 마커 및 데이터 로드
  const loadMapData = async () => {
    try {
      // 마커 배열 초기화
      let newMarkers: Marker[] = [];

      // 위치 ID가 있을 경우 API 호출
      if (locationId) {
        try {
          // 위치 ID 기반 게시글 조회
          const postsData = await getPostsByLocation(locationId);

          // 게시글 데이터를 마커 형식으로 변환
          newMarkers = postsData.map((post, index) => ({
            id: post.post_id.toString(),
            name: `보관소 ${index + 1}`,
            latitude: mapCenter.lat + (Math.random() * 0.01 - 0.005),
            longitude: mapCenter.lng + (Math.random() * 0.01 - 0.005),
            address: post.address,
          }));

          setMarkers(newMarkers);

          // 지역 특가 데이터 조회
          const dealsResponse = await getLocalDeals(locationId);
          if (dealsResponse.success && dealsResponse.data.posts) {
            setDiscountItems(dealsResponse.data.posts);
          } else {
            setDiscountItems([]);
          }

          // 최근 거래내역 조회
          await fetchRecentTrades(locationId);
        } catch (err) {
          console.error('데이터 조회 오류:', err);
          // 오류 시 빈 마커 배열 설정
          setMarkers([]);
          setDiscountItems([]);
          setRecentItems([]);
        }
      } else {
        setDiscountItems([]);
        setRecentItems([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다');
      setLoading(false);
    }
  };

  // 동 데이터 로드
  useEffect(() => {
    // 먼저 인증 상태 확인
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // 현재 위치 가져오기
        await getCurrentLocation();

        // 위치 정보가 변경되면 LocationId 조회
        if (location !== DEFAULT_LOCATION) {
          await fetchLocationId(location);
        } else {
          // 기본 위치에 대한 LocationId 조회 시도
          await fetchLocationId(DEFAULT_LOCATION);
        }

        // 지도 데이터 로드
        await loadMapData();
      } catch (error) {
        console.error('앱 초기화 오류:', error);
        setError('앱을 초기화하는 중 오류가 발생했습니다');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // LocationId가 변경될 때마다 지도 데이터 다시 로드
  useEffect(() => {
    if (locationId !== undefined) {
      loadMapData();
    }
  }, [locationId]);

  // 위치 정보 ID 조회 함수 수정
  const fetchLocationId = async (address: string) => {
    try {
      if (!address) return;

      console.log('위치 ID 조회 중:', address);
      const response = await client.get(API_PATHS.PLACE.LOCATIONS.INFO, {
        params: { formattedAddress: address },
      });

      if (response.data?.success && response.data.data) {
        const locationData = response.data.data[0];
        console.log('위치 ID 조회 성공:', locationData.id);
        setLocationId(locationData.id);
        localStorage.setItem('currentLocationId', locationData.id.toString());

        if (locationData.latitude && locationData.longitude) {
          setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });
        }

        return locationData.id;
      }

      console.warn('위치 ID 조회 실패, 기본값 사용');
      setLocationId(undefined);
      localStorage.removeItem('currentLocationId');
      return undefined;
    } catch (error) {
      console.error('위치 ID 조회 오류:', error);
      setLocationId(undefined);
      localStorage.removeItem('currentLocationId');
      return undefined;
    }
  };

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    try {
      const currentLocation = await locationService.getCurrentLocation();

      if (currentLocation) {
        const formattedAddress = currentLocation.formatted_address;
        setLocation(formattedAddress);

        // 위치 변경 시 해당 위치의 LocationId 조회
        await fetchLocationId(formattedAddress);

        const lat = parseFloat(currentLocation.latitude);
        const lng = parseFloat(currentLocation.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          setMapCenter({ lat, lng });
        }
      } else {
        // 현재 위치를 가져올 수 없는 경우 기본 위치 사용
        console.warn('현재 위치 정보를 가져올 수 없어 기본 위치를 사용합니다.');
        setLocation(DEFAULT_LOCATION);
        await fetchLocationId(DEFAULT_LOCATION);
      }
    } catch (error) {
      console.error('위치 정보 조회 오류:', error);
      setLocation(DEFAULT_LOCATION);
      await fetchLocationId(DEFAULT_LOCATION);
    }
  };

  // 지도 중심 변경 핸들러
  const handleCenterChanged = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  // 위치 선택 핸들러
  const handleSelectLocation = async (
    address: string,
    latitude?: string,
    longitude?: string,
    newLocationId?: number,
  ) => {
    // 위치 정보가 변경되었을 때만 API 호출
    if (newLocationId && newLocationId !== locationId) {
      setLocation(address);
      setLocationId(newLocationId);

      // 병렬로 API 호출하여 시간 단축
      try {
        // 지도 중심 변경
        if (latitude && longitude) {
          setMapCenter({
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
          });
        }

        // 지도 데이터 로드 (이미 구현된 함수 활용)
        await loadMapData();
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      }
    }
  };

  // 현재 위치 버튼 클릭 핸들러
  const handleCurrentLocationClick = () => {
    getCurrentLocation();
  };

  // 마커 클릭 핸들러 - 보관소 상세 페이지로 이동
  const handleMarkerClick = (markerId: string) => {
    navigate(`/storages/${markerId}`);
  };

  // 보관소 등록 버튼 클릭 핸들러
  const handleRegisterClick = () => {
    // 로그인 체크
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }

    // 보관인 여부 확인
    if (isKeeper()) {
      console.log('보관인으로 로그인되어 있어 바로 보관소 등록 step1 페이지로 이동합니다.');
      navigate(ROUTES.STORAGE_REGISTER, { replace: true });
    } else {
      console.log('의뢰인으로 로그인되어 있어 보관인 등록 모달을 표시합니다.');
      setShowKeeperModal(true);
    }
  };

  // 보관인 등록 확인 핸들러
  const handleKeeperConfirm = () => {
    navigate('/keeper-registration', { replace: true });
    setShowKeeperModal(false);
  };

  // 게시판 이동 핸들러
  const handleGoToBoard = () => {
    navigate('/storage');
  };

  // 특가 아이템 클릭 핸들러
  const handleDiscountItemClick = (id: string) => {
    navigate(`/storages/${id}`);
  };

  // 재시도 핸들러
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    getCurrentLocation();
  };

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await getLocationPosts('1'); // string으로 변경
        if (response.success) {
          const postsData = response.data.posts;
          const formattedMarkers: Marker[] = postsData.map((post: LocationPost) => ({
            id: post.post_id.toString(),
            name: post.post_title || '보관소',
            latitude: post.latitude,
            longitude: post.longitude,
            address: post.post_address,
          }));
          setMarkers(formattedMarkers);
        }
      } catch (error) {
        console.error('마커 데이터 가져오기 실패:', error);
      }
    };

    fetchMarkers();
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingIndicator>위치 정보를 불러오는 중...</LoadingIndicator>
      </Container>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <h3>오류 발생</h3>
          <p>{error}</p>
          <button onClick={handleRetry}>재시도</button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWrapper>
        <Header title="메인" showBackButton={false} />
      </HeaderWrapper>

      <MapWrapper>
        <KakaoMap
          center={mapCenter}
          level={mapLevel}
          storageMarkers={markers}
          onMarkerClick={handleMarkerClick}
          onCenterChanged={handleCenterChanged}
          isLocationModalOpen={isLocationModalOpen}
          showCurrentLocation={true}
          onCurrentLocationClick={handleCurrentLocationClick}
          locationInfoId={locationId?.toString()}
        />
      </MapWrapper>

      <MapBottomSheet
        location={location}
        onRegisterStorage={handleRegisterClick}
        onGoToBoard={handleGoToBoard}
        onDiscountItemClick={handleDiscountItemClick}
        discountItems={discountItems}
        recentItems={recentItems}
        onEditLocation={() => setIsLocationModalOpen(true)}
        storageMarkers={markers}
        locationInfoId={locationId || undefined}
      />

      <BottomNavigation activeTab="home" />

      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
      />

      <KeeperRegistrationModal
        isOpen={showKeeperModal}
        onClose={() => setShowKeeperModal(false)}
        onConfirm={handleKeeperConfirm}
      />
    </Container>
  );
};

export default HomePage;
