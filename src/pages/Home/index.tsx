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
      console.log('지도 데이터 로드 시작, locationId:', locationId);
      setLoading(true);

      let newMarkers: Marker[] = [];
      if (locationId === undefined || locationId === null) {
        console.log('유효한 locationId가 없어 데이터를 로드할 수 없습니다.');
        setMarkers([]);
        setDiscountItems([]);
        setRecentItems([]);
        setLoading(false);
        return;
      }

      try {
        // 1. 게시글 데이터 로드 (마커 생성용)
        console.log('게시글 데이터 로드 시작:', locationId);
        const postsData = await getPostsByLocation(locationId);
        console.log('게시글 데이터 로드 결과:', postsData);

        if (postsData && postsData.length > 0) {
          // 주소를 좌표로 변환 - Promise.all로 병렬 처리
          console.log('게시글 주소 좌표 변환 시작');
          const coordinatePromises = postsData.map(async (post, index) => {
            console.log(`변환 시작 - 게시글 ${index}:`, post.post_id, post.address);
            const coords = await convertAddressToCoords(post.address);
            console.log(`변환 결과 - 게시글 ${index}:`, post.post_id, coords);
            return coords;
          });

          const coordinates = await Promise.all(coordinatePromises);
          console.log('주소 좌표 변환 완료. 결과:', coordinates);

          // 유효한 좌표가 있는 게시글만 마커로 변환
          newMarkers = postsData
            .map((post, index) => {
              const coords = coordinates[index];
              if (!coords) {
                console.log('좌표 변환 실패한 게시글:', post.post_id);
                return null;
              }
              const marker = {
                id: post.post_id.toString(),
                name: post.title || post.post_title || `보관소 ${post.post_id}`,
                latitude: coords.lat,
                longitude: coords.lng,
                address: post.address,
              };
              return marker;
            })
            .filter((marker): marker is NonNullable<typeof marker> => marker !== null);

          console.log('마커 생성 완료:', newMarkers);
          setMarkers(newMarkers);

          // 2. 지역 특가 데이터 조회
          console.log('지역 특가 데이터 조회 시작');
          const dealsResponse = await getLocalDeals(locationId);
          if (dealsResponse.success && dealsResponse.data.posts) {
            console.log('지역 특가 데이터 조회 성공:', dealsResponse.data.posts.length);
            setDiscountItems(dealsResponse.data.posts);
          } else {
            console.log('지역 특가 데이터 없음');
            setDiscountItems([]);
          }

          // 3. 최근 거래내역 조회
          console.log('최근 거래내역 조회 시작');
          await fetchRecentTrades(locationId);
        } else {
          console.log('게시글 데이터 없음');
          setMarkers([]);
          setDiscountItems([]);
          setRecentItems([]);
        }
      } catch (err) {
        console.error('데이터 조회 오류:', err);
        setMarkers([]);
        setDiscountItems([]);
        setRecentItems([]);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다');
      setMarkers([]);
      setDiscountItems([]);
      setRecentItems([]);
      setLoading(false);
    }
  };

  // 주소를 좌표로 변환하는 helper 함수
  const convertAddressToCoords = (
    address: string,
  ): Promise<{ lat: number; lng: number } | null> => {
    return new Promise(resolve => {
      if (!address || address.trim() === '') {
        console.warn('주소가 비어있어 좌표 변환을 건너뜁니다.');
        resolve(null);
        return;
      }

      try {
        console.log(`주소 [${address}] 좌표 변환 시작`);
        const geocoder = new window.kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result: any, status: any) => {
          // 상세 응답 로깅
          console.log('카카오맵 API 응답:', { result, status });

          if (status === 'OK' && result && result.length > 0) {
            // 새로운 응답 구조: result의 각 항목에 x, y 속성 직접 접근
            const coords = {
              // x, y가 반대로 되어 있음에 주의 (경도, 위도)
              lng: parseFloat(result[0].x),
              lat: parseFloat(result[0].y),
            };

            // NaN 체크
            if (isNaN(coords.lat) || isNaN(coords.lng)) {
              console.error('잘못된 좌표 형식:', result[0]);
              resolve(null);
              return;
            }

            console.log(`주소 [${address}] 좌표 변환 성공:`, coords);
            resolve(coords);
          } else {
            console.error('주소 좌표 변환 실패:', status, address);
            resolve(null);
          }
        });
      } catch (error) {
        console.error('좌표 변환 중 예외 발생:', error, address);
        resolve(null);
      }
    });
  };

  // 현재 위치를 가져오는 함수
  const getCurrentLocation = async (): Promise<string> => {
    try {
      console.log('현재 위치 정보 조회 시작');
      const currentLocation = await locationService.getCurrentLocation();

      if (currentLocation && currentLocation.formatted_address) {
        const formattedAddress = currentLocation.formatted_address;
        console.log('현재 위치 정보 조회 성공:', formattedAddress);

        // 상태 업데이트
        setLocation(formattedAddress);

        // 좌표 정보가 있으면 지도 중심 업데이트
        const lat = parseFloat(currentLocation.latitude);
        const lng = parseFloat(currentLocation.longitude);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          console.log('현재 위치 좌표:', lat, lng);
          setMapCenter({ lat, lng });
        } else {
          console.warn('현재 위치의 좌표 정보가 유효하지 않습니다.');
        }

        return formattedAddress;
      } else {
        console.warn('현재 위치 정보를 가져올 수 없어 기본 위치를 사용합니다.');
        setLocation(DEFAULT_LOCATION);
        setMapCenter(DEFAULT_COORDINATES);
        return DEFAULT_LOCATION;
      }
    } catch (error) {
      console.error('위치 정보 조회 오류:', error);
      setLocation(DEFAULT_LOCATION);
      setMapCenter(DEFAULT_COORDINATES);
      return DEFAULT_LOCATION;
    }
  };

  // initializeApp에서는 getCurrentLocation의 반환값(주소)에 대해 한 번만 fetchLocationId()를 호출합니다.
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('앱 초기화 시작');
        // 1. 현재 위치 가져오기
        const addr = await getCurrentLocation();
        console.log('현재 위치 조회 성공:', addr);

        // 2. 위치 ID 조회
        console.log('위치 ID 조회 시작');
        const locationId = await fetchLocationId(addr);
        console.log('위치 ID 조회 결과:', locationId);

        // locationId 상태 업데이트는 fetchLocationId 함수 내에서 수행
        // loadMapData는 locationId 변경 useEffect에서 호출됨
      } catch (error) {
        console.error('앱 초기화 오류:', error);
        setError('앱을 초기화하는 중 오류가 발생했습니다');
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // locationId가 변경되면 지도 데이터를 로드합니다.
  useEffect(() => {
    if (locationId !== undefined && locationId !== null) {
      loadMapData();
    }
  }, [locationId]);

  // 위치 정보 ID 조회 함수
  const fetchLocationId = async (address: string) => {
    try {
      if (!address) {
        console.warn('주소가 비어있어 위치 ID 조회를 건너뜁니다.');
        return undefined;
      }

      console.log('위치 ID 조회 중:', address);
      const response = await client.get(API_PATHS.PLACE.LOCATIONS.INFO, {
        params: { formattedAddress: address },
      });

      if (response.data?.success && response.data.data && response.data.data.length > 0) {
        const locationData = response.data.data[0];
        console.log('위치 ID 조회 성공:', locationData.id);

        // 상태 업데이트
        setLocationId(locationData.id);
        localStorage.setItem('currentLocationId', locationData.id.toString());

        // 좌표 정보가 있으면 지도 중심 업데이트
        if (locationData.latitude && locationData.longitude) {
          console.log('지도 중심 좌표 업데이트:', locationData.latitude, locationData.longitude);
          setMapCenter({ lat: locationData.latitude, lng: locationData.longitude });
        }

        return locationData.id;
      }

      console.warn('위치 ID 조회 실패, 기본값 사용');
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
  };

  // 지도 중심 변경 핸들러
  const handleCenterChanged = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  // 위치 선택 핸들러 (LocationSearchModal에서 호출)
  const handleSelectLocation = async (
    address: string,
    latitude?: string,
    longitude?: string,
    newLocationId?: number,
  ) => {
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
        console.log('위치 ID 조회 시작:', address);
        targetLocationId = await fetchLocationId(address);
      }

      if (targetLocationId) {
        setLocationId(targetLocationId);
        localStorage.setItem('currentLocationId', targetLocationId.toString());

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
    } catch (error) {
      console.error('위치 선택 처리 중 오류:', error);
      // 에러 발생시 기본 좌표 사용
      setMapCenter({
        lat: latitude ? parseFloat(latitude) : DEFAULT_COORDINATES.lat,
        lng: longitude ? parseFloat(longitude) : DEFAULT_COORDINATES.lng,
      });
    }
  };

  const handleCurrentLocationClick = async () => {
    try {
      setLoading(true);
      console.log('현재 위치 기반 가까운 게시글 찾기 시작');

      // 1. 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            console.log('현재 위치 좌표:', { lat: userLat, lng: userLng });

            // 2. 마커 데이터가 있는지 확인
            if (markers && markers.length > 0) {
              // 3. 현재 위치에서 가장 가까운 마커 찾기
              let closestMarker = markers[0];

              // 4. 가장 가까운 마커의 위치로 지도 중심 이동
              setMapCenter({
                lat: closestMarker.latitude - 0.002, // 약간 위로 조정
                lng: closestMarker.longitude,
              });

              // 5. 위치 ID 업데이트
              console.log('새 위치에 대한 ID 조회');
              const locationId = await fetchLocationId(closestMarker.address);
              console.log('위치 ID 조회 결과:', locationId);
            } else {
              // 마커가 없는 경우 현재 위치 사용
              console.log('게시글 위치 정보가 없어 현재 위치만 사용');
              const addr = await getCurrentLocation();
              console.log('현재 위치 갱신 성공:', addr);

              if (addr) {
                console.log('새 위치에 대한 ID 조회');
                const locationId = await fetchLocationId(addr);
                console.log('위치 ID 조회 결과:', locationId);
              }
            }
          },
          error => {
            console.error('현재 위치 가져오기 실패:', error);
            alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
            // 위치 정보 획득 실패시 기존 로직 사용
            getCurrentLocation().then(addr => fetchLocationId(addr));
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        );
      } else {
        // geolocation이 지원되지 않는 경우
        console.warn('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
        const addr = await getCurrentLocation();
        if (addr) {
          await fetchLocationId(addr);
        }
      }
    } catch (error) {
      console.error('위치 이동 중 오류:', error);
      setError('위치 정보를 갱신하는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (markerId: string) => {
    navigate(`/storages/${markerId}`);
  };

  const handleRegisterClick = () => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
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
    getCurrentLocation().then(addr => fetchLocationId(addr));
  };

  if (loading) {
    return (
      <Container>
        <LoadingIndicator>위치 정보를 불러오는 중...</LoadingIndicator>
      </Container>
    );
  }

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
        fetchLocationId={fetchLocationId} // 추가: fetchLocationId 함수를 prop으로 전달
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
