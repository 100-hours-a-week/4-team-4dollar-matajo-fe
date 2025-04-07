// src/pages/Home/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { getRecentTrades } from '../../services/api/modules/trades';
import { getLocationPosts, LocationPost } from '../../services/api/modules/storage';
import { Marker } from './MapBottomSheet';
import LocationSearchModal from './LocationSearchModal';
import { handleRegisterStorage, KeeperRegistrationModal } from './MapBottomSheet';
import { ROUTES } from '../../constants/routes';
import { createTrade, CreateTradeRequest } from '../../services/api/modules/trades';
import { LocalDeal } from '../../types/place.types';
import client from '../../services/api/client';
import { API_PATHS } from '../../constants/api';
import { checkAndRefreshToken } from '../../utils/api/authUtils';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  background: #ffffff;
  overflow: hidden;
  margin: 0 auto;
  max-width: 480px;
  display: flex;
  flex-direction: column;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #666;
`;

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

const HeaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background-color: transparent;
`;

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

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>(DEFAULT_LOCATION);
  const [locationId, setLocationId] = useState<number | undefined>(undefined);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [discountItems, setDiscountItems] = useState<LocalDeal[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [showKeeperModal, setShowKeeperModal] = useState<boolean>(false);

  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [mapLevel, setMapLevel] = useState(3);

  // 위치 정보 ID 조회 함수
  const fetchLocationId = useCallback(async (address: string) => {
    try {
      if (!address) {
        console.warn('주소가 비어있어 위치 ID 조회를 건너뜁니다.');
        return undefined;
      }

      const response = await client.get(API_PATHS.PLACE.LOCATIONS.INFO, {
        params: { formattedAddress: address },
      });

      if (response.data?.success && response.data.data && response.data.data.length > 0) {
        const locationData = response.data.data[0];

        // 상태 업데이트
        setLocationId(locationData.id);
        localStorage.setItem('currentLocationId', locationData.id.toString());

        // 좌표 정보가 있으면 지도 중심 업데이트
        if (locationData.latitude && locationData.longitude) {
          setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });
        }

        return locationData.id;
      }

      // 조회 실패 시 상태 초기화
      setLocationId(undefined);
      localStorage.removeItem('currentLocationId');
      return undefined;
    } catch (error) {
      console.error('위치 ID 조회 오류:', error);
      setLocationId(undefined);
      localStorage.removeItem('currentLocationId');
      return undefined;
    }
  }, []);

  // 주소를 좌표로 변환하는 memoized helper 함수
  const convertAddressToCoords = useCallback(
    (address: string): Promise<{ lat: number; lng: number } | null> => {
      return new Promise(resolve => {
        if (!address || address.trim() === '') {
          resolve(null);
          return;
        }

        try {
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.addressSearch(address, (result: any, status: any) => {
            if (status === 'OK' && result && result.length > 0) {
              // 새로운 응답 구조: result의 각 항목에 x, y 속성 직접 접근
              const coords = {
                lng: parseFloat(result[0].x),
                lat: parseFloat(result[0].y),
              };

              // NaN 체크
              if (isNaN(coords.lat) || isNaN(coords.lng)) {
                resolve(null);
                return;
              }

              resolve(coords);
            } else {
              resolve(null);
            }
          });
        } catch (error) {
          resolve(null);
        }
      });
    },
    [],
  );

  // 지도 데이터 로드 함수 최적화
  const loadMapData = useCallback(async () => {
    try {
      if (locationId === undefined || locationId === null) {
        setMarkers([]);
        setDiscountItems([]);
        setRecentItems([]);
        return;
      }

      setLoading(true);

      // 데이터 병렬 요청으로 성능 향상
      const [postsResponse, dealsResponse, tradesResponse] = await Promise.all([
        getPostsByLocation(locationId),
        getLocalDeals(locationId),
        getRecentTrades(locationId),
      ]);

      // 1. 게시글 데이터 처리
      let newMarkers: Marker[] = [];
      if (postsResponse && postsResponse.length > 0) {
        // 주소를 좌표로 변환 (한 번에 요청해서 처리)
        const coordsPromises = postsResponse.map(post =>
          post.address ? convertAddressToCoords(post.address) : null,
        );

        const coordinates = await Promise.all(coordsPromises);

        // 마커 데이터 생성 (유효한 좌표만)
        newMarkers = postsResponse
          .map((post, index) => {
            const coords = coordinates[index];
            if (!coords) return null;

            return {
              id: post.post_id.toString(),
              name: post.title || post.post_title || `보관소 ${post.post_id}`,
              latitude: coords.lat,
              longitude: coords.lng,
              address: post.address,
            };
          })
          .filter((marker): marker is NonNullable<typeof marker> => marker !== null);

        setMarkers(newMarkers);
      } else {
        setMarkers([]);
      }

      // 2. 지역 특가 데이터 처리
      if (dealsResponse.success && dealsResponse.data.posts) {
        setDiscountItems(dealsResponse.data.posts);
      } else {
        setDiscountItems([]);
      }

      // 3. 최근 거래내역 처리
      if (tradesResponse.success && Array.isArray(tradesResponse.data)) {
        const trades = tradesResponse.data.map(trade => ({
          id: trade.trade_date, // unique key로 trade_date 사용
          name: trade.product_name,
          price: trade.trade_price,
          post_tags: [trade.category, `${trade.storage_period}일`],
          imageUrl: trade.main_image,
          location: location.split(' ')[1] || ' ',
        }));
        setRecentItems(trades);
      } else {
        console.warn('거래 내역 응답 형식 오류:', tradesResponse);
        setRecentItems([]);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setMarkers([]);
      setDiscountItems([]);
      setRecentItems([]);
    } finally {
      setLoading(false);
    }
  }, [locationId, location, convertAddressToCoords]);

  // initializeApp에서는 getCurrentLocation의 반환값(주소)에 대해 한 번만 fetchLocationId()를 호출합니다.
  useEffect(() => {
    const checkTokenAndInitialize = async () => {
      const isTokenValid = await checkAndRefreshToken();
      if (!isTokenValid) {
        navigate('/login', { replace: true });
        return;
      }

      if (!isLoggedIn()) {
        navigate('/login');
        return;
      }

      const initializeApp = async () => {
        try {
          setLoading(true);
          setError(null);

          console.log('앱 초기화 시작');
          // 1. 현재 위치 가져오기 - 개선된 LocationService.getCurrentLocation() 사용
          const locationInfo = await locationService.getCurrentLocation();

          if (locationInfo && locationInfo.formatted_address) {
            console.log('현재 위치 조회 성공:', locationInfo);

            // 위치 정보 업데이트
            setLocation(locationInfo.formatted_address);

            // 지도 중심 업데이트
            const lat = parseFloat(locationInfo.latitude);
            const lng = parseFloat(locationInfo.longitude);
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              console.log('초기 지도 중심 설정:', { lat, lng });
              setMapCenter({ lat, lng });
            }

            // 2. 위치 ID 조회
            console.log('위치 ID 조회 시작');
            const locationId = await fetchLocationId(locationInfo.formatted_address);
            console.log('위치 ID 조회 결과:', locationId);
          } else {
            console.warn('현재 위치 정보를 가져올 수 없어 기본 위치를 사용합니다.');
            setLocation(DEFAULT_LOCATION);
            setMapCenter(DEFAULT_COORDINATES);

            // 기본 위치의 ID 조회
            await fetchLocationId(DEFAULT_LOCATION);
          }
        } catch (error) {
          console.error('앱 초기화 오류:', error);
          setError('앱을 초기화하는 중 오류가 발생했습니다');

          // 기본 위치 사용
          setLocation(DEFAULT_LOCATION);
          setMapCenter(DEFAULT_COORDINATES);
          await fetchLocationId(DEFAULT_LOCATION);

          setLoading(false);
        }
      };

      await initializeApp();
    };

    checkTokenAndInitialize();
  }, []);

  // locationId가 변경되면 지도 데이터를 로드합니다.
  useEffect(() => {
    if (locationId !== undefined && locationId !== null) {
      loadMapData();
    }
  }, [locationId]);

  // 지도 중심 변경 핸들러
  const handleCenterChanged = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  // 위치 선택 핸들러 (LocationSearchModal에서 호출) - 로직 개선
  const handleSelectLocation = useCallback(
    async (address: string, latitude?: string, longitude?: string, newLocationId?: number) => {
      try {
        const locationService = LocationService.getInstance();
        const locationInfo: LocationInfo = {
          formatted_address: address,
          display_name: address,
          latitude: latitude || DEFAULT_COORDINATES.lat.toString(),
          longitude: longitude || DEFAULT_COORDINATES.lng.toString(),
        };

        // 선택한 위치를 현재 위치로 저장
        locationService.setCurrentLocation(locationInfo);
        locationService.addRecentLocation(locationInfo);

        // 위치 상태 업데이트 모달 닫기기
        setLocation(address);
        setIsLocationModalOpen(false);

        // 위치 ID 설정 및 데이터 로드
        let targetLocationId = newLocationId;
        if (!targetLocationId) {
          targetLocationId = await fetchLocationId(address);
        } else {
          setLocationId(targetLocationId);
          localStorage.setItem('currentLocationId', targetLocationId.toString());
        }

        if (targetLocationId) {
          // 해당 위치의 게시글 데이터를 먼저 로드
          const postsData = await getPostsByLocation(targetLocationId);

          if (postsData && postsData.length > 0) {
            // 첫 번째 게시글의 주소를 좌표로 변환
            const coords = await convertAddressToCoords(postsData[0].address);

            if (coords) {
              // 게시글 위치보다 살짝 위로 이동 (더 넓은 시야 제공)
              setMapCenter({
                lat: coords.lat - 0.002, // 약간 위쪽으로 조정
                lng: coords.lng,
              });
            } else {
              // 좌표 변환 실패시 입력받은 좌표 사용
              setMapCenter({
                lat: latitude ? parseFloat(latitude) : DEFAULT_COORDINATES.lat,
                lng: longitude ? parseFloat(longitude) : DEFAULT_COORDINATES.lng,
              });
            }
          } else {
            // 게시글이 없는 경우 입력받은 좌표 사용
            setMapCenter({
              lat: latitude ? parseFloat(latitude) : DEFAULT_COORDINATES.lat,
              lng: longitude ? parseFloat(longitude) : DEFAULT_COORDINATES.lng,
            });
          }
        }
        // locationId 설정 후 자동으로 loadMapData 호출됨
      } catch (error) {
        console.error('위치 선택 처리 중 오류:', error);
        // 에러 발생시 기본 좌표 사용
        setMapCenter({
          lat: latitude ? parseFloat(latitude) : DEFAULT_COORDINATES.lat,
          lng: longitude ? parseFloat(longitude) : DEFAULT_COORDINATES.lng,
        });
      }
    },
    [fetchLocationId],
  );

  // 현재 위치 클릭 핸들러 로직 최적화
  const handleCurrentLocationClick = useCallback(async () => {
    try {
      setLoading(true);

      // 개선된 LocationService.getCurrentLocation() 사용
      const locationInfo = await locationService.getCurrentLocation();

      if (locationInfo && locationInfo.formatted_address) {
        // 주소 상태 업데이트
        setLocation(locationInfo.formatted_address);

        // 지도 중심 좌표 설정
        const lat = parseFloat(locationInfo.latitude);
        const lng = parseFloat(locationInfo.longitude);

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          setMapCenter({ lat, lng });
          setMapLevel(3);
        }

        // 위치 ID 조회하여 locationId 업데이트
        await fetchLocationId(locationInfo.formatted_address);
        // locationId가 업데이트되면 useEffect가 자동으로 loadMapData()를 호출함
      } else {
        // 기본 위치 정보 사용
        setLocation(DEFAULT_LOCATION);
        setMapCenter(DEFAULT_COORDINATES);
        await fetchLocationId(DEFAULT_LOCATION);
      }
    } catch (error) {
      console.error('위치 이동 중 오류:', error);
      setError('위치 정보를 갱신하는 중 오류가 발생했습니다');
      // 기본 위치 정보 사용
      setLocation(DEFAULT_LOCATION);
      setMapCenter(DEFAULT_COORDINATES);
      await fetchLocationId(DEFAULT_LOCATION);
    } finally {
      setLoading(false);
    }
  }, [fetchLocationId]);

  const handleMarkerClick = (markerId: string) => {
    navigate(`/storages/${markerId}`);
  };

  const handleRegisterClick = async () => {
    const isTokenValid = await checkAndRefreshToken();
    if (!isTokenValid) {
      navigate('/login', { replace: true });
      return;
    }

    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    if (isKeeper()) {
      navigate(ROUTES.STORAGE_REGISTER, { replace: true });
    } else {
      setShowKeeperModal(true);
    }
  };

  const handleKeeperConfirm = () => {
    navigate('/keeper-registration', { replace: true });
    setShowKeeperModal(false);
  };

  const handleGoToBoard = () => {
    navigate('/storages');
  };

  const handleDiscountItemClick = (id: string) => {
    navigate(`/storages/${id}`);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);

    locationService.getCurrentLocation().then(locationInfo => {
      if (locationInfo && locationInfo.formatted_address) {
        setLocation(locationInfo.formatted_address);
        fetchLocationId(locationInfo.formatted_address);
      } else {
        setLocation(DEFAULT_LOCATION);
        setMapCenter(DEFAULT_COORDINATES);
        fetchLocationId(DEFAULT_LOCATION);
      }
    });
  };

  const LoadingOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    z-index: 1000;
  `;

  const LoadingModal = styled.div`
    background-color: white;
    padding: 20px 30px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  `;

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
        locationInfoId={locationId !== undefined ? locationId : undefined}
        fetchLocationId={fetchLocationId}
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

      {loading && (
        <LoadingOverlay>
          <LoadingModal>
            <div>위치 정보를 불러오는 중...</div>
          </LoadingModal>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default HomePage;
