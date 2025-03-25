import { Place, DiscountItem, StorageItem } from '../../types/place';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import MapBottomSheet from './MapBottomSheet';
import KakaoMap from '../../components/feature/map/KakaoMap';
import { useAuth } from '../../hooks/auth';
import { findDongCoordinates, loadDongDataFromCSV } from '../../utils/api/csvUtils';
import LocationSearchModal from './LocationSearchModal';
import type { DongData } from '../../utils/api/csvUtils';

// 컨테이너 컴포넌트 - 전체 화면 크기로 설정
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

// 맵 컨테이너 스타일 - 영역 확장
const MapWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
`;

// 헤더 래퍼 (투명 배경으로 지도 위에 표시)
const HeaderWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  background-color: rgba(255, 255, 255, 0.9);
`;

// 기본 좌표 (여의도)
const DEFAULT_COORDINATES = { lat: 37.5244, lng: 126.9231 };
const DEFAULT_LOCATION = '서울특별시 영등포구 여의도동';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isKeeper, isClient } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>(DEFAULT_LOCATION);
  const [places, setPlaces] = useState<Place[]>([]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [recentItems, setRecentItems] = useState<StorageItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [dongDataLoaded, setDongDataLoaded] = useState<boolean>(false);
  const [dongData, setDongData] = useState<DongData[]>([]);

  // 지도 중심 좌표
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);
  const [mapLevel] = useState(4); // 초기 지도 레벨은 4로 설정

  // 동 데이터 로드
  useEffect(() => {
    const loadDongData = async () => {
      try {
        setError(null);
        const data = await loadDongDataFromCSV('data/korea_dong_coordinates.csv');

        if (data.length > 0) {
          console.log('동 데이터 로드 성공:', data.length);
          setDongData(data);
          setDongDataLoaded(true);
        } else {
          console.error('동 데이터가 비어있습니다');
          setError('위치 데이터를 불러올 수 없습니다');
        }
      } catch (error) {
        console.error('동 데이터 로드 실패:', error);
        setError('위치 데이터를 불러오는 중 오류가 발생했습니다');
      }
    };

    loadDongData();
  }, []);

  // 지도 중심 변경 핸들러
  const handleCenterChanged = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    // 지도 중심 좌표가 변경될 때마다 주변 데이터를 다시 가져올 필요는 없음
  };

  // 선택한 위치로 지도 이동 및 데이터 로드
  const handleSelectLocation = (
    selectedLocation: string,
    latitude?: string,
    longitude?: string,
  ) => {
    setLocation(selectedLocation);

    // 위도/경도가 직접 제공된 경우
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter({ lat, lng });
        fetchNearbyData(lat, lng, selectedLocation);
        return;
      }
    }

    // 동 데이터가 로드되었다면 선택한 위치의 좌표를 찾아 지도 중심 변경
    if (dongDataLoaded && dongData.length > 0) {
      const coordinates = findDongCoordinates(dongData, selectedLocation);

      if (coordinates) {
        setMapCenter(coordinates);
        fetchNearbyData(coordinates.lat, coordinates.lng, selectedLocation);
      } else {
        console.log('선택한 위치의 좌표를 찾을 수 없습니다:', selectedLocation);
        // 기본 좌표 사용
        setMapCenter(DEFAULT_COORDINATES);
        fetchNearbyData(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng, selectedLocation);
      }
    } else {
      console.log('동 데이터가 로드되지 않았습니다. 기본 좌표 사용');
      setMapCenter(DEFAULT_COORDINATES);
      fetchNearbyData(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng, selectedLocation);
    }
  };

  // 현재 위치를 기반으로 데이터 로드
  const fetchNearbyData = async (lat: number, lng: number, locationName: string = location) => {
    try {
      setError(null);

      // 지도 마커 데이터 (실제 API 연동 시 사용)
      try {
        // const placesResponse = await getNearbyPlaces(lat, lng);
        // setPlaces(placesResponse.data.places);

        // 임시: 현재 위치 기반으로 더미 데이터 생성
        const dummyMarkers = generateDummyMarkers(lat, lng, locationName);
        setPlaces(dummyMarkers);
      } catch (error) {
        console.error('위치 데이터 로드 오류:', error);
        // 오류 시 기본 더미 데이터 사용
        const dummyMarkers = generateDummyMarkers(lat, lng, locationName);
        setPlaces(dummyMarkers);
      }

      // 위치 이름에서 구/동 정보 추출
      const locationParts = locationName.split(' ');
      let district = ''; // 구
      let neighborhood = ''; // 동

      // 위치 문자열에서 구/동 정보 추출
      for (let i = 0; i < locationParts.length; i++) {
        if (locationParts[i].includes('구')) {
          district = locationParts[i];
        } else if (locationParts[i].includes('동') || locationParts[i].includes('가')) {
          neighborhood = locationParts[i];
        }
      }

      // 구/동 정보가 없는 경우 기본값 설정
      if (!district) district = '영등포구';
      if (!neighborhood) neighborhood = '여의도동';

      try {
        // 특가 아이템 로드 (실제 API 연동 시 사용)
        // const discountResponse = await getDiscountItems(district, neighborhood);
        // setDiscountItems(discountResponse.data.items);

        // 임시: 더미 특가 아이템 생성
        setDiscountItems([
          {
            id: '1',
            placeId: '1',
            title: `${neighborhood} 보관소 특가`,
            originalPrice: 15000,
            discountPrice: 8250,
            discountRate: 45,
            imageUrl: 'https://placehold.co/300x200',
          },
          {
            id: '2',
            placeId: '3',
            title: `${district} 보관소 특가`,
            originalPrice: 12000,
            discountPrice: 7800,
            discountRate: 35,
            imageUrl: 'https://placehold.co/300x200',
          },
        ]);
      } catch (error) {
        console.error('특가 아이템 로드 오류:', error);
        // 기본 더미 데이터
        setDiscountItems([
          {
            id: '1',
            placeId: '1',
            title: `${neighborhood} 보관소 특가`,
            originalPrice: 15000,
            discountPrice: 8250,
            discountRate: 45,
            imageUrl: 'https://placehold.co/300x200',
          },
        ]);
      }

      try {
        // 최근 거래 내역 로드 (실제 API 연동 시 사용)
        // const recentResponse = await getRecentItems(district, neighborhood);
        // setRecentItems(recentResponse.data.items);

        // 임시: 더미 최근 거래 내역 생성
        setRecentItems([
          {
            id: '1',
            name: '플레이스테이션',
            price: 12000,
            post_tags: ['전자기기', '일주일 이내'],
            imageUrl: 'https://placehold.co/64x64',
            location: neighborhood,
            keeperId: 'keeper1',
            rating: 4.5,
          },
          {
            id: '2',
            name: '캐리어',
            price: 8000,
            post_tags: ['여행', '장기'],
            imageUrl: 'https://placehold.co/64x64',
            location: neighborhood,
            keeperId: 'keeper2',
            rating: 4.8,
          },
        ]);
      } catch (error) {
        console.error('최근 거래 내역 로드 오류:', error);
        // 기본 더미 데이터
        setRecentItems([
          {
            id: '1',
            name: '플레이스테이션',
            price: 12000,
            post_tags: ['전자기기', '일주일 이내'],
            imageUrl: 'https://placehold.co/64x64',
            location: neighborhood,
            keeperId: 'keeper1',
            rating: 4.5,
          },
        ]);
      }
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다');
    }
  };

  // 더미 마커 데이터 생성 함수 (랜덤 위치 생성)
  const generateDummyMarkers = (
    centerLat: number,
    centerLng: number,
    locationName: string,
  ): Place[] => {
    const locationParts = locationName.split(' ');
    let district = ''; // 구
    let neighborhood = ''; // 동

    // 위치 문자열에서 구/동 정보 추출
    for (let i = 0; i < locationParts.length; i++) {
      if (locationParts[i].includes('구')) {
        district = locationParts[i];
      } else if (locationParts[i].includes('동') || locationParts[i].includes('가')) {
        neighborhood = locationParts[i];
      }
    }

    // 구/동 정보가 없는 경우 기본값 설정
    if (!district) district = '영등포구';
    if (!neighborhood) neighborhood = '여의도동';

    // 중심 좌표 주변에 5개의 마커 생성
    return [
      {
        id: '1',
        name: `${neighborhood} 중앙 보관소`,
        latitude: centerLat,
        longitude: centerLng,
        address: `${locationName}`,
        district: district,
        neighborhood: neighborhood,
        isPopular: true,
      },
      {
        id: '2',
        name: `${neighborhood} 북쪽 보관소`,
        latitude: centerLat + 0.002,
        longitude: centerLng,
        address: `${locationName}`,
        district: district,
        neighborhood: neighborhood,
        isPopular: false,
      },
      {
        id: '3',
        name: `${neighborhood} 남쪽 보관소`,
        latitude: centerLat - 0.002,
        longitude: centerLng,
        address: `${locationName}`,
        district: district,
        neighborhood: neighborhood,
        isPopular: true,
      },
      {
        id: '4',
        name: `${neighborhood} 동쪽 보관소`,
        latitude: centerLat,
        longitude: centerLng + 0.003,
        address: `${locationName}`,
        district: district,
        neighborhood: neighborhood,
        isPopular: true,
      },
      {
        id: '5',
        name: `${neighborhood} 서쪽 보관소`,
        latitude: centerLat,
        longitude: centerLng - 0.003,
        address: `${locationName}`,
        district: district,
        neighborhood: neighborhood,
        isPopular: false,
      },
    ];
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('초기 데이터 로드 시작');

        // 현재 위치 가져오기 시도
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            position => {
              const currentPos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setMapCenter(currentPos);
              fetchNearbyData(currentPos.lat, currentPos.lng);
            },
            error => {
              console.error('위치 정보를 가져오는데 실패했습니다:', error);
              // 기본 위치(여의도) 사용
              fetchNearbyData(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          );
        } else {
          // 위치 정보를 지원하지 않는 경우, 기본 위치 사용
          fetchNearbyData(DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng);
        }
      } catch (err) {
        console.error('초기 데이터 로드 오류:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다');
      } finally {
        // 데이터 로드 후 로딩 상태 업데이트
        setTimeout(() => {
          setLoading(false);
          console.log('로딩 상태 업데이트: false');
        }, 500);
      }
    };

    loadInitialData();
  }, []);

  // 마커 클릭 핸들러 - 보관소 상세 페이지로 이동
  const handleMarkerClick = (placeId: string) => {
    navigate(`/storage/${placeId}`);
  };

  // 보관소 등록 페이지로 이동
  const handleRegisterStorage = () => {
    if (isKeeper()) {
      navigate('/editstorage');
    } else if (isClient()) {
      navigate('/registration/step1');
    } else {
      navigate('/login');
    }
  };

  // 게시판 페이지로 이동
  const handleGoToBoard = () => {
    navigate('/storage');
  };

  // 지역 특가 상세 페이지로 이동
  const handleDiscountItemClick = (id: string) => {
    navigate(`/storage/${id}`);
  };

  // 현재 위치로 이동 버튼 클릭 시 호출되는 함수
  const handleCurrentLocationClick = () => {
    // 현재 위치에 대한 정보 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 지도 중심 설정 및 주변 데이터 로드
          setMapCenter({ lat, lng });
          fetchNearbyData(lat, lng);

          // 역지오코딩으로 현재 위치 주소 가져오기 (실제로는 카카오 API 호출이 필요합니다)
          // 여기서는 간단히 처리
          setLocation('현재 위치');
        },
        error => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error);
          alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        },
      );
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
  };

  // 에러 발생 시 재시도 버튼
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchNearbyData(mapCenter.lat, mapCenter.lng);
    setTimeout(() => setLoading(false), 500);
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

  // Places 배열에서 지도 마커로 사용할 데이터 변환
  const storageMarkers = places.map(place => ({
    id: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
    address: place.address,
  }));

  return (
    <Container>
      {/* 맵 컨테이너 - 전체 화면으로 확장 */}
      <MapWrapper>
        <KakaoMap
          center={mapCenter}
          level={mapLevel}
          storageMarkers={storageMarkers}
          onMarkerClick={handleMarkerClick}
          draggable={true} // 드래그 가능 반드시 true
          zoomable={true} // 줌 가능 반드시 true
          onCenterChanged={handleCenterChanged}
          isLocationModalOpen={isLocationModalOpen}
          showCurrentLocation={true}
          onCurrentLocationClick={handleCurrentLocationClick}
        />
      </MapWrapper>

      {/* 헤더 - 지도 위에 표시 */}
      <HeaderWrapper>
        <Header title="마타조" />
      </HeaderWrapper>

      {/* 맵 바텀시트 컴포넌트 - z-index 설정 확인 */}
      <MapBottomSheet
        location={location}
        onRegisterStorage={handleRegisterStorage}
        onGoToBoard={handleGoToBoard}
        onDiscountItemClick={handleDiscountItemClick}
        discountItems={discountItems}
        recentItems={recentItems}
        onEditLocation={() => setIsLocationModalOpen(true)} // 동네 수정 버튼 클릭 시 모달 열기
      />

      {/* 지역 검색 모달 */}
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
      />

      {/* 하단 네비게이션 */}
      <BottomNavigation activeTab="홈" />
    </Container>
  );
};

export default HomePage;
