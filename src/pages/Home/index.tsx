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
  LocationIdInfo,
  DEFAULT_COORDINATES,
  DEFAULT_LOCATION,
} from '../../services/LocationService';
import { getLocationId, getPostsByLocation } from '../../services/api/modules/place';

import LocationSearchModal from './LocationSearchModal';
import { handleRegisterStorage, KeeperRegistrationModal } from './MapBottomSheet';

// 컨테이너 컴포넌트
const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: #ffffff;
  overflow: hidden;
  margin: 0 auto;
  max-width: 480px; // 모바일 환경 고려
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
`;

// 헤더 래퍼
const HeaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background-color: rgba(255, 255, 255, 0.9);
`;

// 마커 아이템 인터페이스
interface StorageMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

// 특가 아이템 인터페이스
interface DiscountItem {
  id: string;
  title: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  imageUrl?: string;
}

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
  const [locationId, setLocationId] = useState<number | null>(null);
  const [markers, setMarkers] = useState<StorageMarker[]>([]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [showKeeperModal, setShowKeeperModal] = useState<boolean>(false);

  // 지도 중심 좌표
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
  const [mapLevel] = useState(4); // 초기 지도 레벨은 4로 설정

  // 지도 마커 및 데이터 로드
  const loadMapData = async () => {
    try {
      // 마커 배열 초기화
      let newMarkers: StorageMarker[] = [];

      // 위치 ID가 있을 경우 API 호출
      if (locationId) {
        // 위치 ID 기반 게시글 조회
        const postsData = await getPostsByLocation(locationId);

        // 게시글 데이터를 마커 형식으로 변환
        newMarkers = postsData.map((post, index) => ({
          id: post.post_id.toString(),
          name: `보관소 ${index + 1}`, // 실제 이름이 없으므로 임시 이름 사용
          latitude: mapCenter.lat + (Math.random() * 0.01 - 0.005), // 임시 좌표 (실제로는 API에서 제공하는 좌표 사용)
          longitude: mapCenter.lng + (Math.random() * 0.01 - 0.005), // 임시 좌표 (실제로는 API에서 제공하는 좌표 사용)
          address: post.address,
        }));
      }

      // 마커가 없을 경우 기본 마커 생성 (개발용)
      if (newMarkers.length === 0) {
        newMarkers = [
          {
            id: 'default-1',
            name: '기본 보관소',
            latitude: mapCenter.lat,
            longitude: mapCenter.lng,
            address: location,
          },
        ];
      }

      // 상태 업데이트
      setMarkers(newMarkers);

      // 이후에는 특가 아이템이나 최근 거래 내역도 API로 가져와서 업데이트
      // 현재는 더미 데이터 사용

      // 특가 아이템 더미 데이터
      const dummyDiscountItems: DiscountItem[] = [
        {
          id: '1',
          title: '중앙 보관소 특가',
          originalPrice: 15000,
          discountPrice: 8250,
          discountRate: 45,
          imageUrl: 'https://placehold.co/300x200',
        },
        {
          id: '2',
          title: '북쪽 보관소 특가',
          originalPrice: 12000,
          discountPrice: 7800,
          discountRate: 35,
          imageUrl: 'https://placehold.co/300x200',
        },
      ];

      // 최근 거래 내역 더미 데이터
      const dummyRecentItems: RecentItem[] = [
        {
          id: '1',
          name: '플레이스테이션',
          price: 12000,
          post_tags: ['전자기기', '일주일 이내'],
          imageUrl: 'https://placehold.co/64x64',
          location: location.split(' ')[1] || '여의도동',
        },
        {
          id: '2',
          name: '캐리어',
          price: 8000,
          post_tags: ['여행', '장기'],
          imageUrl: 'https://placehold.co/64x64',
          location: location.split(' ')[1] || '여의도동',
        },
      ];

      // 상태 업데이트
      setDiscountItems(dummyDiscountItems);
      setRecentItems(dummyRecentItems);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다');
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
        const currentLocation = await locationService.getCurrentLocation();

        if (currentLocation) {
          setLocation(currentLocation.formatted_address);

          // 위치 정보로 ID 조회
          const locationIdInfo = await locationService.getLocationIdByAddress(
            currentLocation.formatted_address,
          );

          if (locationIdInfo) {
            setLocationId(locationIdInfo.id);
          }

          // 지도 좌표 설정
          if (currentLocation.latitude && currentLocation.longitude) {
            setMapCenter({
              lat: parseFloat(currentLocation.latitude),
              lng: parseFloat(currentLocation.longitude),
            });
          }
        }

        // 지도 마커 및 데이터 초기화
        await loadMapData();
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [navigate]);

  // 현재 위치 가져오기
  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          // 현재 위치로 지도 중심 설정
          const { latitude, longitude } = position.coords;
          setMapCenter({
            lat: latitude,
            lng: longitude,
          });

          // 현재 위치 정보 가져오기
          const currentLocation = await locationService.getCurrentLocation();

          if (currentLocation) {
            setLocation(currentLocation.formatted_address);

            // 위치 정보로 ID 조회
            const locationIdInfo = await locationService.getLocationIdByAddress(
              currentLocation.formatted_address,
            );

            if (locationIdInfo) {
              setLocationId(locationIdInfo.id);
            }

            // 지도 데이터 다시 로드
            await loadMapData();
          }
        },
        error => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error);
          // 기본 위치 사용
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  };

  // 지도 중심 변경 핸들러
  const handleCenterChanged = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  // 선택한 위치로 이동
  const handleSelectLocation = async (
    selectedLocation: string,
    latitude?: string,
    longitude?: string,
  ) => {
    setLocation(selectedLocation);

    // 주소로 위치 ID 조회
    const locationIdInfo = await locationService.getLocationIdByAddress(selectedLocation);
    if (locationIdInfo) {
      setLocationId(locationIdInfo.id);

      // 위치 정보를 LocationInfo 형태로 생성하여 최근 위치에 추가
      const locationInfo: LocationInfo = {
        formatted_address: locationIdInfo.formatted_address,
        display_name: locationIdInfo.dong,
        latitude: latitude || DEFAULT_COORDINATES.lat.toString(),
        longitude: longitude || DEFAULT_COORDINATES.lng.toString(),
      };

      // 최근 위치에 추가
      locationService.addRecentLocation(locationInfo);
    } else {
      console.warn('위치 ID를 찾을 수 없습니다.');
      setLocationId(null);
    }

    // 위도/경도가 제공된 경우 해당 좌표로 이동
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
      }
    }

    // 지도 데이터 새로 로드
    await loadMapData();

    // 위치 모달 닫기
    setIsLocationModalOpen(false);
  };

  // 현재 위치로 이동
  const handleCurrentLocationClick = () => {
    getCurrentLocation();
  };

  // 마커 클릭 핸들러 - 보관소 상세 페이지로 이동
  const handleMarkerClick = (placeId: string) => {
    navigate(`/storage/${placeId}`);
  };

  // 보관소 등록 핸들러
  const handleRegisterClick = () => {
    handleRegisterStorage(navigate, setShowKeeperModal);
  };

  // 보관인 등록 확인 핸들러
  const handleKeeperConfirm = () => {
    setShowKeeperModal(false);
    navigate('/keeper/registration');
  };

  // 게시판 이동 핸들러
  const handleGoToBoard = () => {
    navigate('/storage');
  };

  // 특가 아이템 클릭 핸들러
  const handleDiscountItemClick = (id: string) => {
    navigate(`/storage/${id}`);
  };

  // 오류 발생 시 재시도 버튼
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    loadMapData();
  };

  if (loading) {
    return (
      <Container>
        <HeaderWrapper>
          <Header title="마타조" />
        </HeaderWrapper>
        <LoadingIndicator>로딩 중...</LoadingIndicator>
        <BottomNavigation activeTab="홈" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <HeaderWrapper>
          <Header title="마타조" />
        </HeaderWrapper>
        <ErrorMessage>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={handleRetry}>다시 시도</button>
        </ErrorMessage>
        <BottomNavigation activeTab="홈" />
      </Container>
    );
  }

  return (
    <Container>
      {/* 맵 컨테이너 */}
      <MapWrapper>
        <KakaoMap
          center={mapCenter}
          level={mapLevel}
          storageMarkers={markers}
          onMarkerClick={handleMarkerClick}
          draggable={true}
          zoomable={true}
          onCenterChanged={handleCenterChanged}
          isLocationModalOpen={isLocationModalOpen}
          showCurrentLocation={true}
          onCurrentLocationClick={handleCurrentLocationClick}
        />
      </MapWrapper>

      {/* 헤더 */}
      <HeaderWrapper>
        <Header title="마타조" />
      </HeaderWrapper>

      {/* 바텀시트 */}
      <MapBottomSheet
        location={location}
        onRegisterStorage={handleRegisterClick}
        onGoToBoard={handleGoToBoard}
        onDiscountItemClick={handleDiscountItemClick}
        discountItems={discountItems}
        recentItems={recentItems}
        onEditLocation={() => setIsLocationModalOpen(true)}
      />

      {/* 지역 검색 모달 */}
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
      />

      {/* 보관인 등록 모달 */}
      <KeeperRegistrationModal
        isOpen={showKeeperModal}
        onClose={() => setShowKeeperModal(false)}
        onConfirm={handleKeeperConfirm}
      />

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="홈" />
    </Container>
  );
};

export default HomePage;
