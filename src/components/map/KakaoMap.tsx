import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// 컨테이너 스타일
const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 새로고침 버튼 스타일
const RefreshButton = styled.button`
  position: absolute;
  top: 70px; // 헤더 아래에 위치
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// 마커 인터페이스
interface Marker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

// 컴포넌트 속성 정의
interface KakaoMapProps {
  center: { lat: number; lng: number };
  level: number;
  storageMarkers?: Marker[];
  onMarkerClick?: (id: string) => void;
  draggable?: boolean;
  zoomable?: boolean;
  onCenterChanged?: (lat: number, lng: number) => void;
  isLocationModalOpen?: boolean;
  showCurrentLocation?: boolean;
  onCurrentLocationClick?: () => void;
  detailMode?: boolean;
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
  showCurrentLocation = false,
  onCurrentLocationClick,
  detailMode = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [kakaoMap, setKakaoMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userLocationMarker, setUserLocationMarker] = useState<any | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: level,
      draggable: draggable && !detailMode,
      scrollwheel: zoomable && !detailMode,
    };

    const map = new window.kakao.maps.Map(mapRef.current, options);
    setKakaoMap(map);

    // 상세 페이지 모드인 경우 지도 컨트롤러 숨기기
    if (detailMode) {
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      const zoomControl = new window.kakao.maps.ZoomControl();

      // 컨트롤러 제거 (지도 유형 변경, 줌 컨트롤 모두 제거)
      map.removeControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
      map.removeControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    }

    // 지도 드래그 끝 이벤트 리스너
    window.kakao.maps.event.addListener(map, 'dragend', () => {
      const latlng = map.getCenter();
      if (onCenterChanged) {
        onCenterChanged(latlng.getLat(), latlng.getLng());
      }
    });

    // 현재 위치 가져오기 (상세 페이지 모드가 아니고 showCurrentLocation이 true인 경우)
    if (!detailMode && showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setCurrentUserLocation({ lat: userLat, lng: userLng });

          // 사용자 위치에 특별한 마커 추가
          addUserLocationMarker(map, userLat, userLng);
        },
        error => {
          console.error('사용자 위치를 가져오는데 실패했습니다:', error);
        },
      );
    }

    return () => {
      // 정리 작업
    };
  }, []);

  // 사용자 위치 마커 추가 함수
  const addUserLocationMarker = (map: any, lat: number, lng: number) => {
    // 기존 사용자 위치 마커가 있으면 제거
    if (userLocationMarker) {
      userLocationMarker.setMap(null);
    }

    // 사용자 위치 마커 이미지 설정 (보라색 별 아이콘)
    const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
    const imageSize = new window.kakao.maps.Size(24, 35);
    const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    // 사용자 위치 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: map,
      image: markerImage,
      zIndex: 10,
    });

    // 마커 저장
    setUserLocationMarker(marker);
  };

  // 현재 위치로 이동하는 함수
  const moveToUserLocation = () => {
    if (kakaoMap && currentUserLocation) {
      kakaoMap.setCenter(
        new window.kakao.maps.LatLng(currentUserLocation.lat, currentUserLocation.lng),
      );

      // 이동 후 중심 위치 변경 이벤트 발생
      if (onCenterChanged) {
        onCenterChanged(currentUserLocation.lat, currentUserLocation.lng);
      }

      // 외부 콜백 호출
      if (onCurrentLocationClick) {
        onCurrentLocationClick();
      }
    } else {
      // 위치 정보가 없을 경우 다시 요청
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            setCurrentUserLocation({ lat: userLat, lng: userLng });

            if (kakaoMap) {
              kakaoMap.setCenter(new window.kakao.maps.LatLng(userLat, userLng));
              addUserLocationMarker(kakaoMap, userLat, userLng);

              // 이동 후 중심 위치 변경 이벤트 발생
              if (onCenterChanged) {
                onCenterChanged(userLat, userLng);
              }

              // 외부 콜백 호출
              if (onCurrentLocationClick) {
                onCurrentLocationClick();
              }
            }
          },
          error => {
            console.error('사용자 위치를 가져오는데 실패했습니다:', error);
            alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
          },
        );
      } else {
        alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      }
    }
  };

  // 중심 위치 변경 시 지도 업데이트
  useEffect(() => {
    if (kakaoMap) {
      const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
      kakaoMap.setCenter(newCenter);
    }
  }, [center, kakaoMap]);

  // 마커 업데이트
  useEffect(() => {
    if (!kakaoMap) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    // 보관소 마커 추가
    storageMarkers.forEach(markerData => {
      const position = new window.kakao.maps.LatLng(markerData.latitude, markerData.longitude);

      const marker = new window.kakao.maps.Marker({
        position,
        map: kakaoMap,
      });

      // 클릭 이벤트 추가
      if (onMarkerClick) {
        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(markerData.id);
        });
      }

      // 인포윈도우 추가 (필요한 경우)
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${markerData.name}</div>`,
      });

      // 마우스 오버 시 인포윈도우 표시
      window.kakao.maps.event.addListener(marker, 'mouseover', () => {
        infowindow.open(kakaoMap, marker);
      });

      // 마우스 아웃 시 인포윈도우 닫기
      window.kakao.maps.event.addListener(marker, 'mouseout', () => {
        infowindow.close();
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // 모달이 열려 있을 때는 지도 이벤트 막기
    if (isLocationModalOpen) {
      kakaoMap.setDraggable(false);
      kakaoMap.setZoomable(false);
    } else {
      kakaoMap.setDraggable(draggable);
      kakaoMap.setZoomable(zoomable);
    }

    return () => {
      // 정리 작업
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [kakaoMap, storageMarkers, onMarkerClick, isLocationModalOpen]);

  // 모달 상태가 변경될 때 지도 드래그/줌 기능 업데이트
  useEffect(() => {
    if (kakaoMap) {
      if (isLocationModalOpen) {
        kakaoMap.setDraggable(false);
        kakaoMap.setZoomable(false);
      } else {
        kakaoMap.setDraggable(draggable);
        kakaoMap.setZoomable(zoomable);
      }
    }
  }, [isLocationModalOpen, kakaoMap, draggable, zoomable]);

  return (
    <MapContainer ref={mapRef}>
      {!detailMode && showCurrentLocation && (
        <RefreshButton onClick={moveToUserLocation} title="현재 위치로 이동">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.944 12.979c-.489 4.509-4.306 8.021-8.944 8.021-2.698 0-5.112-1.194-6.763-3.075l1.245-1.245c1.283 1.645 3.276 2.7 5.518 2.7 3.895 0 7.052-3.189 7.049-7.098 0-.143-.007-.283-.018-.423l-1.869 1.868-1.414-1.414 3.535-3.536.707.707.707.707-3.536 3.535-1.414-1.414 1.882-1.883c-1.496-3.583-5.045-6.11-9.179-6.11-5.523 0-10 4.477-10 10s4.477 10 10 10c5.9 0 10.428-4.525 10.949-9.93l1.545.409z"
              fill="#3A00E5"
            />
          </svg>
        </RefreshButton>
      )}
    </MapContainer>
  );
};

export default KakaoMap;
