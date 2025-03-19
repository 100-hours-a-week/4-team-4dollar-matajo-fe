import React, { useEffect, useRef } from 'react';
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
  width: 24px;
  height: 24px;
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
}) => {
  // 맵 컨테이너 참조
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const navigate = useNavigate();

  // 지도 초기화 함수
  const initializeMap = () => {
    if (!mapRef.current) return;

    console.log('카카오맵 초기화 시작');

    // 지도 옵션
    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: level,
      draggable: draggable, // 드래그 가능 여부
      zoomable: zoomable, // 줌 가능 여부
    };

    try {
      // 지도 생성
      const map = new window.kakao.maps.Map(mapRef.current, options);
      mapInstanceRef.current = map;

      console.log('카카오맵 초기화 완료, 드래그 가능: ', draggable);

      // 마커 추가
      if (detailMode) {
        // 상세 페이지 모드일 경우 단일 마커만 표시
        addDetailMarker();
      } else {
        // 일반 모드인 경우 모든 마커 표시
        addMarkers();

        // 지도 이벤트 리스너 추가 (일반 모드에서만)
        window.kakao.maps.event.addListener(map, 'zoom_changed', updateMarkers);

        // 드래그 엔드 이벤트 - 중심 좌표 변경 통지
        window.kakao.maps.event.addListener(map, 'dragend', function () {
          updateMarkers();
          // 중심 좌표 변경 콜백이 있으면 호출
          if (onCenterChanged) {
            const center = map.getCenter();
            onCenterChanged(center.getLat(), center.getLng());
          }
        });
      }
    } catch (error) {
      console.error('지도 초기화 오류:', error);
    }
  };

  // 상세 페이지용 단일 마커 추가
  const addDetailMarker = () => {
    if (!mapInstanceRef.current) return;

    // 기존 마커 삭제
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 상세 페이지의 중앙 좌표에 마커 생성
    const markerPosition = new window.kakao.maps.LatLng(center.lat, center.lng);

    const marker = new window.kakao.maps.Marker({
      position: markerPosition,
      map: mapInstanceRef.current,
    });

    markersRef.current.push(marker);

    // 상세 페이지에서는 인포윈도우를 항상 표시
    const markerInfo =
      storageMarkers && storageMarkers.length > 0
        ? storageMarkers[0]
        : { name: '보관소', address: '여의도동' };

    const infoContent = `
      <div style="padding:5px;font-size:12px;width:150px;text-align:center;">
        <strong>${markerInfo.name}</strong><br/>
        <span style="font-size:11px;color:#666;">${markerInfo.address || ''}</span>
      </div>
    `;

    const infowindow = new window.kakao.maps.InfoWindow({
      content: infoContent,
      removable: true,
    });

    infowindow.open(mapInstanceRef.current, marker);
  };

  // 일반 모드용 마커 추가 함수
  const addMarkers = () => {
    if (!mapInstanceRef.current) return;

    // 기존 마커 삭제
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 더미 보관소 데이터가 없다면 샘플 데이터 사용
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

    // 마커 이미지 설정
    const markerImageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
    const imageSize = new window.kakao.maps.Size(24, 35);
    const markerImage = new window.kakao.maps.MarkerImage(markerImageSrc, imageSize);

    // 마커 생성 및 추가
    markersData.forEach(place => {
      const position = new window.kakao.maps.LatLng(place.latitude, place.longitude);

      const marker = new window.kakao.maps.Marker({
        map: mapInstanceRef.current,
        position,
        title: place.name,
        image: markerImage,
      });

      markersRef.current.push(marker);

      // 인포윈도우 생성
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;font-weight:bold;">${place.name}</div>`,
      });

      // 마커 클릭 이벤트 - 상세 페이지로 이동
      window.kakao.maps.event.addListener(marker, 'click', function () {
        if (onMarkerClick) {
          onMarkerClick(place.id);
        } else {
          navigate(`/storagedetail/${place.id}`);
        }
      });

      // 마커에 마우스오버 이벤트 등록
      window.kakao.maps.event.addListener(marker, 'mouseover', function () {
        infowindow.open(mapInstanceRef.current, marker);
      });

      // 마커에 마우스아웃 이벤트 등록
      window.kakao.maps.event.addListener(marker, 'mouseout', function () {
        infowindow.close();
      });
    });
  };

  // 지도 영역에 따라 마커 업데이트
  const updateMarkers = () => {
    if (!mapInstanceRef.current) return;

    // 지도 영역 가져오기
    const bounds = mapInstanceRef.current.getBounds();

    // 마커 표시/숨김 처리
    markersRef.current.forEach(marker => {
      const position = marker.getPosition();

      // 지도 영역 내에 마커가 있으면 표시, 없으면 숨김
      if (bounds.contain(position)) {
        marker.setMap(mapInstanceRef.current);
      } else {
        marker.setMap(null);
      }
    });
  };

  // 현재 위치로 이동하는 함수
  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (mapInstanceRef.current) {
            // 지도 중심 이동
            const moveLatLng = new window.kakao.maps.LatLng(currentPos.lat, currentPos.lng);
            mapInstanceRef.current.setCenter(moveLatLng);

            // 콜백 호출
            if (onCenterChanged) {
              onCenterChanged(currentPos.lat, currentPos.lng);
            }
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

  // 지도 초기화
  useEffect(() => {
    // 카카오맵 SDK가 로드되었는지 확인
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        console.log('카카오맵 SDK 이미 로드됨');
        initializeMap();
      } else {
        console.log('카카오맵 SDK 로드 중...');
        // SDK 로드 스크립트 생성
        const script = document.createElement('script');
        script.async = true;
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=402f887c60ea890e82149e2120a9ce6f&autoload=false`;

        script.onload = () => {
          console.log('카카오맵 SDK 로드 완료, 지도 초기화 중...');
          window.kakao.maps.load(initializeMap);
        };

        script.onerror = () => {
          console.error('카카오맵 SDK 로드 실패');
        };

        document.head.appendChild(script);
      }
    };

    loadKakaoMap();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, []);

  // center, level 변경 시 지도 위치 업데이트
  useEffect(() => {
    if (mapInstanceRef.current) {
      // 지도 중심 위치 변경
      const newCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
      mapInstanceRef.current.setCenter(newCenter);

      // 지도 레벨 변경
      mapInstanceRef.current.setLevel(level);

      // 드래그 가능 여부 업데이트
      mapInstanceRef.current.setDraggable(draggable);

      // 줌 가능 여부 업데이트
      mapInstanceRef.current.setZoomable(zoomable);
    }
  }, [center.lat, center.lng, level, draggable, zoomable]);

  return (
    <MapContainer id="map" ref={mapRef} width={width} height={height}>
      {/* 현재 위치 버튼 - 모든 페이지에 표시 */}
      <CurrentLocationButton onClick={moveToCurrentLocation}>
        <svg
          width="16"
          height="16"
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
