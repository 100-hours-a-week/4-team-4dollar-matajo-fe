import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// 전역 window 객체에 kakao 타입 추가
declare global {
  interface Window {
    kakao: any;
  }
}

// 보관소 장소 인터페이스
interface StoragePlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface KakaoMapProps {
  center?: {
    lat: number;
    lng: number;
  };
  level?: number;
  width?: string;
  height?: string;
  storageMarkers?: StoragePlace[];
  onMarkerClick?: (placeId: string) => void;
  draggable?: boolean;
  zoomable?: boolean;
  detailMode?: boolean; // 상세 페이지 모드 여부
  onCenterChanged?: (lat: number, lng: number) => void;
  isLocationModalOpen?: boolean; // 위치 검색 모달이 열려있는지 여부
}

const MapContainer = styled.div<{ width: string; height: string }>`
  width: ${props => props.width};
  height: ${props => props.height};
  position: relative;
  z-index: 1;
  border-radius: 8px;
  overflow: hidden;
`;

// 현재 위치 버튼 스타일 (오른쪽 상단)
const CurrentLocationButton = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  width: 36px;
  height: 36px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 10;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }

  &:active {
    background-color: #e0e0e0;
  }
`;

const KakaoMap: React.FC<KakaoMapProps> = ({
  center = { lat: 37.5244, lng: 126.9231 }, // 여의도 기본 좌표
  level = 4, // 초기 지도 레벨은 4로 설정
  width = '100%',
  height = '100%',
  storageMarkers = [],
  onMarkerClick,
  draggable = true,
  zoomable = true,
  detailMode = false,
  onCenterChanged,
  isLocationModalOpen = false, // 기본값 false
}) => {
  // 지도 상태 관리
  const mapRef = useRef<HTMLDivElement>(null);
  const [kakaoMap, setKakaoMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const mapInitialized = useRef<boolean>(false);
  const navigate = useNavigate();

  // 지도 초기화 (한 번만 실행)
  useEffect(() => {
    // 이미 초기화된 경우 중복 실행 방지
    if (mapInitialized.current || !mapRef.current || !window.kakao || !window.kakao.maps) return;

    console.log('카카오맵 초기화 시작');

    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: level,
      draggable: draggable,
      zoomable: zoomable,
    };

    try {
      // 지도 객체 생성
      const map = new window.kakao.maps.Map(mapRef.current, options);
      setKakaoMap(map);
      mapInitialized.current = true;

      console.log('카카오맵 초기화 완료');

      // 초기 마커 설정은 다른 useEffect에서 처리
    } catch (error) {
      console.error('카카오맵 초기화 오류:', error);
    }
  }, []);

  // 마커 처리 (지도 생성 후 실행)
  useEffect(() => {
    if (!kakaoMap) return;

    console.log('마커 설정 중...');

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: any[] = [];

    // 마커 데이터 준비
    const markersData =
      storageMarkers.length > 0
        ? storageMarkers
        : [
            {
              id: '1',
              name: '여의도 보관소',
              latitude: 37.525,
              longitude: 126.923,
            },
            {
              id: '2',
              name: '강남 보관소',
              latitude: 37.504,
              longitude: 127.024,
            },
            {
              id: '3',
              name: '신촌 보관소',
              latitude: 37.555,
              longitude: 126.937,
            },
            {
              id: '4',
              name: '홍대 보관소',
              latitude: 37.557,
              longitude: 126.924,
            },
          ];

    // 상세 페이지 모드인 경우
    if (detailMode && markersData.length > 0) {
      const place = markersData[0];
      const position = new window.kakao.maps.LatLng(place.latitude, place.longitude);

      const marker = new window.kakao.maps.Marker({
        position,
        map: kakaoMap,
      });

      newMarkers.push(marker);

      // 정보창 표시
      const infoContent = `
        <div style="padding:5px;font-size:12px;width:150px;text-align:center;">
          <strong>${place.name}</strong><br/>
          <span style="font-size:11px;color:#666;">${place.address || ''}</span>
        </div>
      `;

      const infowindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
        removable: false,
      });

      infowindow.open(kakaoMap, marker);
    } else {
      // 일반 모드 - 여러 마커 표시
      const markerImageSrc =
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
      const imageSize = new window.kakao.maps.Size(24, 35);
      const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize);

      markersData.forEach(place => {
        const position = new window.kakao.maps.LatLng(place.latitude, place.longitude);

        const marker = new window.kakao.maps.Marker({
          position,
          map: kakaoMap,
          title: place.name,
          image: markerImage,
        });

        newMarkers.push(marker);

        // 인포윈도우 생성
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;font-weight:bold;">${place.name}</div>`,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', function () {
          if (onMarkerClick) {
            onMarkerClick(place.id);
          } else {
            navigate(`/storagedetail/${place.id}`);
          }
        });

        // 마우스오버/아웃 이벤트
        window.kakao.maps.event.addListener(marker, 'mouseover', function () {
          infowindow.open(kakaoMap, marker);
        });

        window.kakao.maps.event.addListener(marker, 'mouseout', function () {
          infowindow.close();
        });
      });

      // 지도 영역 변경 이벤트
      window.kakao.maps.event.addListener(kakaoMap, 'dragend', function () {
        // 마커 업데이트 (필요시)
        updateVisibleMarkers();

        // 중심 좌표 변경 콜백
        if (onCenterChanged) {
          const mapCenter = kakaoMap.getCenter();
          onCenterChanged(mapCenter.getLat(), mapCenter.getLng());
        }
      });

      window.kakao.maps.event.addListener(kakaoMap, 'zoom_changed', function () {
        updateVisibleMarkers();
      });
    }

    setMarkers(newMarkers);
  }, [kakaoMap, storageMarkers, detailMode, onMarkerClick, navigate, onCenterChanged]);

  // 지도 설정 업데이트 (center, level, draggable, zoomable)
  useEffect(() => {
    if (!kakaoMap) return;

    // 지도 중심 위치 변경
    const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
    kakaoMap.setCenter(newCenter);

    // 지도 레벨 변경
    kakaoMap.setLevel(level);

    // 드래그 가능 여부 업데이트
    kakaoMap.setDraggable(draggable);

    // 줌 가능 여부 업데이트
    kakaoMap.setZoomable(zoomable);
  }, [kakaoMap, center.lat, center.lng, level, draggable, zoomable]);

  // 모달 상태 변경 시 지도 다시 그리기
  useEffect(() => {
    if (!kakaoMap) return;

    console.log('모달 상태 변경됨, 지도 relayout 호출');

    // 지도 컨테이너 요소가 보이는지 확인
    const isVisible =
      mapRef.current &&
      mapRef.current.offsetParent !== null &&
      window.getComputedStyle(mapRef.current).display !== 'none';

    if (isVisible) {
      setTimeout(() => {
        kakaoMap.relayout();

        // 중심점 다시 설정
        const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        kakaoMap.setCenter(newCenter);
      }, 300);
    }
  }, [kakaoMap, isLocationModalOpen, center.lat, center.lng]);

  // 보이는 마커만 표시하는 함수
  const updateVisibleMarkers = () => {
    if (!kakaoMap) return;

    const bounds = kakaoMap.getBounds();

    markers.forEach(marker => {
      const position = marker.getPosition();

      if (bounds.contain(position)) {
        marker.setMap(kakaoMap);
      } else {
        marker.setMap(null);
      }
    });
  };

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (!navigator.geolocation || !kakaoMap) {
      alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const currentPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // 지도 중심 이동
        const moveLatLng = new window.kakao.maps.LatLng(currentPos.lat, currentPos.lng);
        kakaoMap.setCenter(moveLatLng);

        // 콜백 호출
        if (onCenterChanged) {
          onCenterChanged(currentPos.lat, currentPos.lng);
        }
      },
      error => {
        console.error('현재 위치를 가져오는데 실패했습니다:', error);
        alert('현재 위치를 가져오는데 실패했습니다. 위치 접근 권한을 확인해주세요.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
    };
  }, [markers]);

  return (
    <MapContainer id="kakaoMap" ref={mapRef} width={width} height={height}>
      {/* 현재 위치 버튼 */}
      <CurrentLocationButton onClick={moveToCurrentLocation}>
        <svg
          width="20"
          height="20"
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
    </MapContainer>
  );
};

export default KakaoMap;
