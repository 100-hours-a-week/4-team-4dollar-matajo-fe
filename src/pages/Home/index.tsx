import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import MapBottomSheet from './MapBottomSheet';
import KakaoMap from '../../components/map/KakaoMap';
import { useAuth } from '../../hooks/useAuth';
import { getNearbyPlaces, getDiscountItems, getRecentItems } from '../../api/place';
import { DiscountItem, StorageItem, Place } from '../../api/place';
import LocationSearchModal from './LocationSearchModal';
import { findDongCoordinates, loadDongDataFromCSV } from '../../utils/csvUtils';

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

// 여의도 주변 더미 보관소 데이터
const dummyStorageLocations = [
  {
    id: '1',
    name: '여의도 IFC 보관소',
    latitude: 37.5254,
    longitude: 126.9267,
    address: '서울특별시 영등포구 여의도동 국제금융로 10',
    district: '영등포구',
    neighborhood: '여의도동',
    isPopular: true,
  },
  {
    id: '2',
    name: '여의도공원 보관소',
    latitude: 37.5268,
    longitude: 126.9255,
    address: '서울특별시 영등포구 여의도동 여의공원로',
    district: '영등포구',
    neighborhood: '여의도동',
    isPopular: false,
  },
  {
    id: '3',
    name: '국회의사당 보관소',
    latitude: 37.5279,
    longitude: 126.9177,
    address: '서울특별시 영등포구 여의도동 의사당대로',
    district: '영등포구',
    neighborhood: '여의도동',
    isPopular: true,
  },
  {
    id: '4',
    name: '63빌딩 보관소',
    latitude: 37.5198,
    longitude: 126.9402,
    address: '서울특별시 영등포구 여의도동 63로',
    district: '영등포구',
    neighborhood: '여의도동',
    isPopular: true,
  },
  {
    id: '5',
    name: '샛강 보관소',
    latitude: 37.5178,
    longitude: 126.9287,
    address: '서울특별시 영등포구 여의도동 여의동로',
    district: '영등포구',
    neighborhood: '여의도동',
    isPopular: false,
  },
];

// 동 데이터 인터페이스 (충돌 방지용 로컬 타입)
interface LocalDongData {
  original_name: string;
  display_name: string;
  latitude: string;
  longitude: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isKeeper, isClient } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<string>('영등포구 여의도동');
  const [places, setPlaces] = useState<Place[]>([]);
  const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
  const [recentItems, setRecentItems] = useState<StorageItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [dongDataLoaded, setDongDataLoaded] = useState<boolean>(false);
  const [dongData, setDongData] = useState<LocalDongData[]>([]);

  // 여의도동 좌표 (기본값)
  const [mapCenter, setMapCenter] = useState({ lat: 37.5244, lng: 126.9231 });
  const [mapLevel] = useState(4); // 초기 지도 레벨은 4로 설정

  // 동 데이터 로드
  useEffect(() => {
    const loadDongData = async () => {
      try {
        const data = await loadDongDataFromCSV('/data/korea_dong_coordinates.csv');
        setDongData(data);
        setDongDataLoaded(true);
      } catch (error) {
        console.error('동 데이터 로드 실패:', error);
        // 기본 더미 데이터 설정 (필요시)
        setDongDataLoaded(true);
      }
    };

    loadDongData();
  }, []);

  // 지도 중심 변경 핸들러
  const handleCenterChanged = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
    console.log('지도 중심 변경:', lat, lng);

    // 필요한 경우 여기서 새 위치에 대한 데이터를 다시 로드할 수 있음
    // 예: fetchNearbyData(lat, lng);
  };

  // src/pages/Home/index.tsx의 handleSelectLocation 함수
  const handleSelectLocation = (selectedLocation: string) => {
    setLocation(selectedLocation);

    // 동 데이터가 로드되었다면 선택한 위치의 좌표를 찾아 지도 중심 변경
    if (dongDataLoaded && dongData.length > 0) {
      const coordinates = findDongCoordinates(dongData, selectedLocation);

      if (coordinates) {
        setMapCenter(coordinates);
        // 새 위치에 대한 데이터 가져오기
        fetchNearbyData(coordinates.lat, coordinates.lng);
      } else {
        console.log('선택한 위치의 좌표를 찾을 수 없습니다:', selectedLocation);
      }
    } else {
      console.log('동 데이터가 로드되지 않았습니다.');
    }
  };
  // 현재 위치를 기반으로 데이터 로드
  const fetchNearbyData = async (lat: number, lng: number) => {
    try {
      // 주변 장소 API 호출 (실제 API 연동 시 사용)
      // const placesResponse = await getNearbyPlaces(lat, lng);
      // setPlaces(placesResponse.data.places);

      // 더미 데이터 사용
      setPlaces(dummyStorageLocations);

      // 위치 정보 업데이트는 이제 handleSelectLocation에서 처리

      // 특가 아이템 로드 (구/동 정보 추출)
      const locationParts = location.split(' ');
      const district = locationParts[0] || '영등포구';
      const neighborhood = locationParts[1] || '여의도동';

      const discountResponse = await getDiscountItems(district, neighborhood);
      setDiscountItems(discountResponse.data.items);

      // 최근 거래 내역 로드
      const recentResponse = await getRecentItems(district, neighborhood);
      setRecentItems(recentResponse.data.items);
    } catch (error) {
      console.error('데이터 로드 오류:', error);

      // 오류 시 더미 데이터 사용
      setPlaces(dummyStorageLocations);

      setDiscountItems([
        {
          id: '1',
          placeId: '1',
          title: '여의도 IFC 보관소 특가',
          originalPrice: 15000,
          discountPrice: 8250,
          discountRate: 45,
          imageUrl: 'https://placehold.co/300x200',
        },
        {
          id: '2',
          placeId: '3',
          title: '국회의사당 보관소 특가',
          originalPrice: 12000,
          discountPrice: 7800,
          discountRate: 35,
          imageUrl: 'https://placehold.co/300x200',
        },
      ]);

      setRecentItems([
        {
          id: '1',
          name: '플레이스테이션',
          price: 12000,
          tags: ['전자기기', '일주일 이내'],
          imageUrl: 'https://placehold.co/64x64',
          location: '여의도동',
          keeperId: 'keeper1',
          rating: 4.5,
        },
        {
          id: '2',
          name: '캐리어',
          price: 8000,
          tags: ['여행', '장기'],
          imageUrl: 'https://placehold.co/64x64',
          location: '여의도동',
          keeperId: 'keeper2',
          rating: 4.8,
        },
      ]);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('초기 데이터 로드 시작');

        // 현재 위치 가져오기 시도 (성공하면 해당 위치로, 실패하면 기본 위치로)
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
              fetchNearbyData(mapCenter.lat, mapCenter.lng);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
          );
        } else {
          // 위치 정보를 지원하지 않는 경우, 기본 위치 사용
          fetchNearbyData(mapCenter.lat, mapCenter.lng);
        }
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
    navigate(`/storagedetail/${placeId}`);
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
    navigate(`/storagedetail/${id}`);
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
