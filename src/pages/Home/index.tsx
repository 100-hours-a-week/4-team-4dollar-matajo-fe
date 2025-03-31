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
import { getLocationId, getPostsByLocation } from '../../services/api/modules/place';
import { getLocationPosts, LocationPost } from '../../services/api/modules/storage';
import { Marker } from './MapBottomSheet';

import LocationSearchModal from './LocationSearchModal';
import { handleRegisterStorage, KeeperRegistrationModal } from './MapBottomSheet';
import { ROUTES } from '../../constants/routes';

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
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [showKeeperModal, setShowKeeperModal] = useState<boolean>(false);

  // 지도 중심 좌표
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [mapLevel, setMapLevel] = useState(3);

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
            name: `보관소 ${index + 1}`, // 실제 이름이 없으므로 임시 이름 사용
            latitude: mapCenter.lat + (Math.random() * 0.01 - 0.005), // 임시 좌표 (실제로는 API에서 제공하는 좌표 사용)
            longitude: mapCenter.lng + (Math.random() * 0.01 - 0.005), // 임시 좌표 (실제로는 API에서 제공하는 좌표 사용)
            address: post.address,
          }));

          setMarkers(newMarkers);
        } catch (err) {
          console.error('게시글 조회 오류:', err);
          // 오류 시 기본 마커 제공
          const defaultMarker = {
            id: 'default-1',
            name: '기본 보관소',
            latitude: mapCenter.lat,
            longitude: mapCenter.lng,
            address: location,
          };
          setMarkers([defaultMarker]);
        }
      } else {
        // 위치 ID가 없으면 기본 마커 생성
        const defaultMarker = {
          id: 'default-1',
          name: '기본 보관소',
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          address: location,
        };
        setMarkers([defaultMarker]);
      }

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
    if (locationId !== null) {
      loadMapData();
    }
  }, [locationId]);

  // 위치 정보 ID 조회 함수
  const fetchLocationId = async (address: string) => {
    try {
      if (!address) return;

      console.log('위치 ID 조회 중:', address);
      const response = await getLocationId(address);

      if (response && response.id) {
        console.log('위치 ID 조회 성공:', response.id);
        setLocationId(response.id);

        // 위치 정보를 전역 상태로 저장 (localStorage)
        localStorage.setItem('currentLocationId', response.id.toString());

        // 추가 위치 정보가 있으면 저장
        if (response.latitude && response.longitude) {
          setMapCenter({ lat: response.latitude, lng: response.longitude });
        }

        return response.id;
      } else {
        console.warn('위치 ID 조회 실패, 기본값 사용');
        setLocationId(null);
        localStorage.removeItem('currentLocationId');
        return null;
      }
    } catch (error) {
      console.error('위치 ID 조회 오류:', error);
      setLocationId(null);
      localStorage.removeItem('currentLocationId');
      return null;
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
    selectedLocation: string,
    latitude?: string,
    longitude?: string,
  ) => {
    try {
      setLocation(selectedLocation);
      setIsLocationModalOpen(false);

      // 위치 정보 업데이트
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapCenter({ lat, lng });
        }

        // 위치 정보 저장
        locationService.setCurrentLocation({
          formatted_address: selectedLocation,
          display_name: selectedLocation.split(' ').pop() || '',
          latitude,
          longitude,
        });
      }

      // 위치 변경 시 LocationId 조회
      await fetchLocationId(selectedLocation);

      // 지도 데이터 다시 로드
      await loadMapData();
    } catch (error) {
      console.error('위치 선택 처리 오류:', error);
      setError('위치 정보를 처리하는 중 오류가 발생했습니다');
    }
  };

  // 현재 위치 버튼 클릭 핸들러
  const handleCurrentLocationClick = () => {
    getCurrentLocation();
  };

  // 마커 클릭 핸들러 - 보관소 상세 페이지로 이동
  const handleMarkerClick = (markerId: string) => {
    navigate(`/storage/${markerId}`);
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
    navigate('/mypage/keeper-registration', { replace: true });
    setShowKeeperModal(false);
  };

  // 게시판 이동 핸들러
  const handleGoToBoard = () => {
    navigate('/storage');
  };

  // 특가 아이템 클릭 핸들러
  const handleDiscountItemClick = (id: string) => {
    navigate(`/storage/${id}`);
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
