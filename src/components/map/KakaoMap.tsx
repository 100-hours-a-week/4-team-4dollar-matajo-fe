// src/components/map/KakaoMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트 정의
const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 현재 위치 버튼 스타일
const CurrentLocationButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
`;

// 마커 정보 인터페이스
interface StorageMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

// 컴포넌트 Props 인터페이스
interface KakaoMapProps {
  center: { lat: number; lng: number };
  level: number;
  storageMarkers?: StorageMarker[];
  onMarkerClick?: (id: string) => void;
  draggable?: boolean;
  zoomable?: boolean;
  onCenterChanged?: (lat: number, lng: number) => void;
  isLocationModalOpen?: boolean;
  detailMode?: boolean; // 추가: 상세 페이지 모드 (마커 스타일 변경 등에 사용)
  showCurrentLocation?: boolean; // 추가: 현재 위치 표시 여부
  onCurrentLocationClick?: () => void; // 추가: 현재 위치 버튼 클릭 핸들러
}

declare global {
  interface Window {
    kakao: any;
  }
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  center,
  level,
  storageMarkers = [],
  onMarkerClick,
  draggable = true,
  zoomable = true,
  onCenterChanged,
  isLocationModalOpen = false,
  detailMode = false,
  showCurrentLocation = true,
  onCurrentLocationClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [currentLocationMarker, setCurrentLocationMarker] = useState<any>(null);
  const centerChangedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapRef.current) return;

    // 카카오맵 API가 로드되었는지 확인
    if (window.kakao && window.kakao.maps) {
      initializeMap();
    } else {
      // API가 로드되지 않았다면 다시 로드
      const script = document.createElement('script');
      script.src =
        '//dapi.kakao.com/v2/maps/sdk.js?appkey=a4c611d058d64f59855869d2b158e4b9&libraries=services&autoload=false';
      document.head.appendChild(script);

      script.onload = () => {
        window.kakao.maps.load(() => {
          initializeMap();
        });
      };
    }

    // 컴포넌트 언마운트 시 타임아웃 정리
    return () => {
      if (centerChangedTimeoutRef.current) {
        clearTimeout(centerChangedTimeoutRef.current);
      }
    };
  }, [mapRef.current]);

  // 맵 초기화 함수
  const initializeMap = () => {
    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: level,
      draggable: draggable, // 드래그 가능 여부
      zoomable: zoomable, // 줌 가능 여부
    };

    const kakaoMap = new window.kakao.maps.Map(mapRef.current, options);
    setMap(kakaoMap);

    // 드래그 이벤트 리스너 등록
    window.kakao.maps.event.addListener(kakaoMap, 'dragend', () => {
      if (onCenterChanged) {
        const newCenter = kakaoMap.getCenter();
        // 중복 호출 방지를 위한 디바운싱
        if (centerChangedTimeoutRef.current) {
          clearTimeout(centerChangedTimeoutRef.current);
        }
        centerChangedTimeoutRef.current = setTimeout(() => {
          onCenterChanged(newCenter.getLat(), newCenter.getLng());
        }, 200);
      }
    });
  };

  // 중심 좌표 업데이트
  useEffect(() => {
    if (!map) return;

    // 맵 중심 변경
    map.setCenter(new window.kakao.maps.LatLng(center.lat, center.lng));
  }, [center, map]);

  // 마커 관리
  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // 새 마커 생성
    const newMarkers = storageMarkers.map(markerData => {
      const position = new window.kakao.maps.LatLng(markerData.latitude, markerData.longitude);

      // 상세 모드일 경우 다른 마커 스타일 사용 가능
      const markerOptions: any = {
        position,
        map,
        title: markerData.name,
      };

      // 상세 모드에서 특별한 마커 스타일을 적용할 수 있음
      if (detailMode) {
        // 상세 모드에서는 마커 스타일 변경 가능 (예: 크기, 색상 등)
        // 예를 들어 커스텀 이미지 마커를 사용하려면:
        // const markerImage = new window.kakao.maps.MarkerImage(
        //   '이미지주소',
        //   new window.kakao.maps.Size(24, 35),
        // );
        // markerOptions.image = markerImage;
      }

      // 마커 생성
      const marker = new window.kakao.maps.Marker(markerOptions);

      // 마커 클릭 이벤트 (상세 모드에서는 클릭 이벤트가 필요 없을 수 있음)
      if (onMarkerClick && !detailMode) {
        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(markerData.id);
        });
      }

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, storageMarkers, detailMode]);

  // 현재 위치 가져오기 함수
  const getCurrentLocation = () => {
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 현재 위치로 지도 이동
          map.setCenter(new window.kakao.maps.LatLng(lat, lng));

          // 기존 현재 위치 마커 제거
          if (currentLocationMarker) {
            currentLocationMarker.setMap(null);
          }

          // 현재 위치 마커 생성 (시그니처 보라색 별 마커)
          const markerImage = new window.kakao.maps.MarkerImage(
            // 별 모양 마커 이미지 URL (기본 이미지로 대체)
            '//t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            new window.kakao.maps.Size(24, 35),
          );

          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(lat, lng),
            map: map,
            image: markerImage,
            zIndex: 10, // 다른 마커보다 위에 표시
          });

          setCurrentLocationMarker(marker);

          // 위치 변경 콜백 호출
          if (onCenterChanged) {
            onCenterChanged(lat, lng);
          }
        },
        error => {
          console.error('현재 위치를 가져오는데 실패했습니다:', error);
          alert('현재 위치를 가져오는데 실패했습니다. 위치 접근 권한을 확인해주세요.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
    }
  };

  // 모달이 열려있을 때 지도 드래그 기능 비활성화
  useEffect(() => {
    if (!map) return;

    if (isLocationModalOpen) {
      map.setDraggable(false);
      map.setZoomable(false);
    } else {
      map.setDraggable(draggable);
      map.setZoomable(zoomable);
    }
  }, [map, isLocationModalOpen, draggable, zoomable]);

  return (
    <MapContainer ref={mapRef}>
      {/* 현재 위치 버튼 (상세 모드에서는 표시하지 않음) */}
      {!detailMode && showCurrentLocation && (
        <CurrentLocationButton
          onClick={onCurrentLocationClick || getCurrentLocation}
          title="현재 위치로 이동"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z"
              fill="#3A00E5"
            />
          </svg>
        </CurrentLocationButton>
      )}
    </MapContainer>
  );
};

export default KakaoMap;
