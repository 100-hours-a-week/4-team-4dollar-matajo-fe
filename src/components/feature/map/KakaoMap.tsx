// src/components/feature/map/KakaoMap.tsx

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { getLocationPosts, LocationPost } from '../../../services/api/modules/storage';

// 컨테이너 스타일
const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

// 새로고침 버튼 스타일
const RefreshButton = styled.button`
  position: absolute;
  top: 50px;
  right: 15px;
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
  z-index: 100;

  &:hover {
    background-color: #f5f5f5;
  }
`;

// 로딩 인디케이터 스타일
const LoadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px 20px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 10;
`;

// 마커 인터페이스
interface Marker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

// 주소 검색 결과 인터페이스
interface AddressSearchResult {
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
  onZoomChanged?: (level: number) => void;
  isLocationModalOpen?: boolean;
  showCurrentLocation?: boolean;
  onCurrentLocationClick?: () => void;
  detailMode?: boolean;
  locationInfoId?: string; // 위치 정보 ID 추가
}

const KakaoMap: React.FC<KakaoMapProps> = ({
  center,
  level,
  storageMarkers = [],
  onMarkerClick,
  draggable = true,
  zoomable = true,
  onCenterChanged,
  onZoomChanged,
  isLocationModalOpen = false,
  showCurrentLocation = false,
  onCurrentLocationClick,
  detailMode = false,
  locationInfoId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const kakaoMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const geocoderRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);
  const lastFetchedLocationIdRef = useRef<string | null>(null);

  const [isMapInitialized, setIsMapInitialized] = useState<boolean>(false);
  const [locationPosts, setLocationPosts] = useState<LocationPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 메모이제이션된 중심 좌표
  const memoizedCenter = useMemo(() => {
    return window.kakao && window.kakao.maps
      ? new window.kakao.maps.LatLng(center.lat, center.lng)
      : null;
  }, [center.lat, center.lng]);

  // 지도 초기화 - 최초 한 번만 실행
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps || isMapInitialized) return;

    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: level,
      draggable: true, // 항상 드래그 가능하도록 설정
      scrollwheel: zoomable,
    };

    const map = new window.kakao.maps.Map(mapRef.current, options);
    kakaoMapRef.current = map;

    // 주소-좌표 변환 객체 생성
    geocoderRef.current = new window.kakao.maps.services.Geocoder();

    // 상세 페이지 모드인 경우 지도 컨트롤러 숨기기
    if (detailMode) {
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      const zoomControl = new window.kakao.maps.ZoomControl();

      // 컨트롤러 제거 (지도 유형 변경, 줌 컨트롤 모두 제거)
      map.removeControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
      map.removeControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    }

    // 지도 드래그 끝 이벤트 리스너
    window.kakao.maps.event.addListener(map, 'dragend', function () {
      const latlng = map.getCenter();
      if (onCenterChanged) {
        onCenterChanged(latlng.getLat(), latlng.getLng());
      }
    });

    // 지도 클릭 이벤트 직접 처리
    window.kakao.maps.event.addListener(map, 'click', function () {
      // 클릭 이벤트에서는 특별한 작업 없이 지도의 드래그 기능에 의존
      // 필요시 추가 기능 구현
    });

    // 현재 위치 가져오기 (상세 페이지 모드가 아니고 showCurrentLocation이 true인 경우)
    if (!detailMode && showCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setCurrentUserLocation({ lat: userLat, lng: userLng });
        },
        error => {
          console.error('사용자 위치를 가져오는데 실패했습니다:', error);
        },
      );
    }

    setIsMapInitialized(true);

    // 정리 함수
    return () => {
      // 필요시 정리 작업 추가
    };
  }, [center.lat, center.lng, level, zoomable, detailMode, showCurrentLocation, onCenterChanged]);

  // 주소로 좌표 검색하는 함수
  const getCoordinatesByAddress = useCallback(
    (address: string): Promise<{ lat: number; lng: number } | null> => {
      return new Promise((resolve, reject) => {
        if (!geocoderRef.current) {
          console.error('Geocoder가 초기화되지 않았습니다.');
          reject(new Error('Geocoder가 초기화되지 않았습니다.'));
          return;
        }

        geocoderRef.current.addressSearch(address, (result: any, status: any) => {
          if (status === 'OK') {
            // 정상적으로 검색이 완료됐으면
            const coords = {
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x),
            };
            resolve(coords);
          } else {
            console.error(`주소 [${address}] 좌표 변환 실패:`, status);
            resolve(null);
          }
        });
      });
    },
    [],
  );

  // 사용자 위치 마커 추가 함수
  const addUserLocationMarker = useCallback((lat: number, lng: number) => {
    if (!kakaoMapRef.current) return;

    // 기존 사용자 위치 마커가 있으면 제거
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setMap(null);
    }

    // 사용자 위치 마커 이미지 설정
    const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
    const imageSize = new window.kakao.maps.Size(24, 35);
    const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    // 사용자 위치 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(lat, lng),
      map: kakaoMapRef.current,
      image: markerImage,
      zIndex: 10,
    });

    // 마커 저장
    userLocationMarkerRef.current = marker;
  }, []);

  // 현재 위치로 이동하는 함수
  const moveToUserLocation = useCallback(() => {
    if (!kakaoMapRef.current) return;

    // 항상 geolocation을 통해 최신 위치 정보를 받아옵니다.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setCurrentUserLocation({ lat: userLat, lng: userLng });

          // 정확한 사용자 위치로 이동 (추가 조정 없이)
          const currentLatLng = new window.kakao.maps.LatLng(userLat, userLng);
          kakaoMapRef.current.setCenter(currentLatLng);
          kakaoMapRef.current.setLevel(3); // 현재 위치 버튼 클릭시 레벨 3으로 고정

          // 사용자 위치 마커 업데이트

          // 이동 후 중심 위치 변경 이벤트 발생
          if (onCenterChanged) {
            onCenterChanged(userLat, userLng);
          }

          // 외부 콜백 호출
          if (onCurrentLocationClick) {
            onCurrentLocationClick();
          }
        },
        error => {
          console.error('사용자 위치를 가져오는데 실패했습니다:', error);
          alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    } else {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
    }
  }, [onCenterChanged, onCurrentLocationClick, addUserLocationMarker]);

  // 중심 위치 변경 시 지도 업데이트 (메모이제이션된 중심 좌표 사용)
  useEffect(() => {
    if (kakaoMapRef.current && memoizedCenter && isMapInitialized) {
      // 부드럽게 중심 좌표 변경 (애니메이션 적용)
      kakaoMapRef.current.panTo(memoizedCenter);
    }
  }, [memoizedCenter, isMapInitialized]);

  // 마커 업데이트 함수 - 효율적인 마커 업데이트 방식으로 변경
  const updateKakaoMapMarkers = useCallback(
    (newStorageMarkers: Marker[]) => {
      if (!kakaoMapRef.current || !isMapInitialized) return;

      // 유효한 좌표를 가진 마커만 필터링
      const validMarkers = newStorageMarkers.filter(marker => {
        const lat = parseFloat(marker.latitude.toString());
        const lng = parseFloat(marker.longitude.toString());
        return (
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat !== 0 &&
          lng !== 0 &&
          lat > -90 &&
          lat < 90 &&
          lng > -180 &&
          lng < 180 && // 유효한 위도/경도 범위 체크
          marker.id &&
          marker.id.trim() !== '' // ID 유효성 검증
        );
      });

      // 현재 마커 ID 세트
      const currentMarkerIds = new Set(markersRef.current.keys());

      // 추가할 마커 ID 세트
      const newMarkerIds = new Set(validMarkers.map(m => m.id));

      // 1. 제거할 마커 처리 - 새 마커 목록에 없는 기존 마커 제거
      currentMarkerIds.forEach(id => {
        if (!newMarkerIds.has(id)) {
          const marker = markersRef.current.get(id);
          if (marker) {
            marker.setMap(null);
            markersRef.current.delete(id);
          }
        }
      });

      // 2. 새 마커 추가 또는 위치 업데이트
      validMarkers.forEach(markerData => {
        const lat = parseFloat(markerData.latitude.toString());
        const lng = parseFloat(markerData.longitude.toString());
        const position = new window.kakao.maps.LatLng(lat, lng);

        // 기존 마커가 있으면 위치만 업데이트
        if (markersRef.current.has(markerData.id)) {
          const existingMarker = markersRef.current.get(markerData.id);
          existingMarker.setPosition(position);
        }
        // 없으면 새 마커 생성
        else {
          // 마커 이미지 설정
          const imageSrc =
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png';
          const imageSize = new window.kakao.maps.Size(24, 35);
          const imageOption = { offset: new window.kakao.maps.Point(12, 35) };
          const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

          const marker = new window.kakao.maps.Marker({
            position,
            map: kakaoMapRef.current,
            image: markerImage,
          });

          // 클릭 이벤트 추가
          if (onMarkerClick) {
            window.kakao.maps.event.addListener(marker, 'click', function () {
              onMarkerClick(markerData.id);
            });
          }

          // 인포윈도우 추가
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${markerData.name || markerData.address}</div>`,
          });

          // 마우스 오버 시 인포윈도우 표시
          window.kakao.maps.event.addListener(marker, 'mouseover', function () {
            infowindow.open(kakaoMapRef.current, marker);
          });

          // 마우스 아웃 시 인포윈도우 닫기
          window.kakao.maps.event.addListener(marker, 'mouseout', function () {
            infowindow.close();
          });

          // 마커 참조에 저장
          markersRef.current.set(markerData.id, marker);
        }
      });
    },
    [onMarkerClick, isMapInitialized],
  );

  // 위치 기반 게시글 조회 함수 - 중복 요청 방지와 배치 처리 최적화
  const fetchLocationPosts = useCallback(async () => {
    if (!locationInfoId || !kakaoMapRef.current || !geocoderRef.current || !isMapInitialized)
      return;

    // 이미 가져온 위치 정보인 경우 스킵
    if (locationInfoId === lastFetchedLocationIdRef.current) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await getLocationPosts(locationInfoId);
      if (response.success && response.data) {
        // API 응답 구조가 { posts: [] } 형태이므로 posts 배열 추출
        const postsData = response.data.posts || [];

        // 주소만 있고 좌표가 없는 게시글들만 필터링
        const addressesToSearch = postsData.filter(
          (post: LocationPost) => !post.latitude || !post.longitude,
        );

        // 주소로 좌표 검색 (일괄 처리)
        const coordsResults = await Promise.all(
          addressesToSearch.map(async (post: LocationPost) => {
            if (!post.post_address) return null;
            try {
              const coords = await getCoordinatesByAddress(post.post_address);
              return coords ? { post_id: post.post_id, coords } : null;
            } catch (error) {
              return null;
            }
          }),
        );

        // 좌표 매핑 - 불필요한 중간 변수 없이 직접 처리
        const postsWithCoords = postsData.map((post: LocationPost) => {
          // 이미 좌표가 있는 경우 그대로 사용
          if (post.latitude && post.longitude) {
            return post;
          }

          // 좌표 검색 결과 찾기
          const coordsResult = coordsResults.find(
            result => result && result.post_id === post.post_id,
          );

          if (coordsResult && coordsResult.coords) {
            return {
              ...post,
              latitude: coordsResult.coords.lat,
              longitude: coordsResult.coords.lng,
            };
          }

          // 좌표 검색 실패한 경우 원본 반환
          return post;
        });

        setLocationPosts(postsWithCoords);
        lastFetchedLocationIdRef.current = locationInfoId;

        // 게시글 데이터를 마커로 변환 - 한번에 효율적으로 처리
        const newMarkers = postsWithCoords
          .filter((post: LocationPost) => post.latitude && post.longitude)
          .map((post: LocationPost) => ({
            id: post.post_id.toString(),
            name: post.post_title || '게시글',
            latitude: post.latitude,
            longitude: post.longitude,
            address: post.post_address || '',
          }));

        // 마커 업데이트
        updateKakaoMapMarkers(newMarkers);
      }
    } catch (error) {
      console.error('위치 기반 게시글 조회 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [locationInfoId, isMapInitialized, getCoordinatesByAddress, updateKakaoMapMarkers]);

  // locationInfoId 변경 시 API 호출 - 참조 객체 사용으로 의존성 제거
  useEffect(() => {
    if (locationInfoId && isMapInitialized && locationInfoId !== lastFetchedLocationIdRef.current) {
      fetchLocationPosts();
    }
  }, [locationInfoId, fetchLocationPosts, isMapInitialized]);

  // 기본 마커 업데이트 - 위치 기반 게시글이 없을 때만
  useEffect(() => {
    if (!isMapInitialized) return;

    // 위치 기반 게시글 마커가 없을 때만 기본 마커 사용
    if (locationPosts.length === 0 && storageMarkers.length > 0) {
      updateKakaoMapMarkers(storageMarkers);
    }
  }, [isMapInitialized, storageMarkers, updateKakaoMapMarkers, locationPosts.length]);

  // 모달 상태가 변경될 때 지도 드래그/줌 기능 업데이트
  useEffect(() => {
    if (kakaoMapRef.current && isMapInitialized) {
      if (isLocationModalOpen) {
        kakaoMapRef.current.setDraggable(false);
        kakaoMapRef.current.setZoomable(false);
      } else {
        kakaoMapRef.current.setDraggable(draggable && !detailMode);
        kakaoMapRef.current.setZoomable(zoomable && !detailMode);
      }
    }
  }, [isLocationModalOpen, draggable, zoomable, detailMode, isMapInitialized]);

  return (
    <>
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
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              fill="#3A00E5"
            />
          </svg>
        </RefreshButton>
      )}
      <MapContainer ref={mapRef}>
        {isLoading && <LoadingIndicator>데이터를 불러오는 중...</LoadingIndicator>}
      </MapContainer>
    </>
  );
};

export default React.memo(KakaoMap);
